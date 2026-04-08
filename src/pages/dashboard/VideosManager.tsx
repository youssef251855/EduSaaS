import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { db, auth, googleProvider } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { uploadVideoToYouTube } from '../../lib/youtube';
import toast from 'react-hot-toast';
import { Video, Trash2, Youtube, Upload } from 'lucide-react';

export default function VideosManager() {
  const { user, youtubeAccessToken, setYoutubeAccessToken } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  async function fetchData() {
    if (!user) return;
    try {
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      if (profileDoc.exists()) {
        setProfile(profileDoc.data());
      }

      const q = query(collection(db, 'videos'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const videosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(videosData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleConnectYouTube = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setYoutubeAccessToken(credential.accessToken);
        toast.success('Connected to YouTube successfully!');
      } else {
        toast.error('Failed to get YouTube access token');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect to YouTube');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile || !youtubeAccessToken) return;

    if (profile?.plan === 'free' && videos.length >= 5) {
      toast.error('Free plan limit reached (5 videos). Please upgrade to Pro.');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload to YouTube
      const youtubeVideoId = await uploadVideoToYouTube(youtubeAccessToken, selectedFile, title, description);
      
      // 2. Save to Firestore
      const newVideoRef = doc(collection(db, 'videos'));
      const videoData = {
        id: newVideoRef.id,
        userId: user.uid,
        title,
        description,
        videoId: youtubeVideoId,
        youtubeUrl: `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(newVideoRef, videoData);
      
      toast.success('Video uploaded successfully!');
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      fetchData(); // Refresh list
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video from your portfolio? (This will not delete it from YouTube)')) return;
    
    try {
      await deleteDoc(doc(db, 'videos', videoId));
      setVideos(videos.filter(v => v.id !== videoId));
      toast.success('Video removed from portfolio');
    } catch (error: any) {
      toast.error('Failed to delete video');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Videos Manager</h1>
        {!youtubeAccessToken && (
          <button
            onClick={handleConnectYouTube}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors"
          >
            <Youtube className="w-5 h-5" />
            Connect YouTube to Upload
          </button>
        )}
      </div>

      {youtubeAccessToken && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" /> Upload New Video
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Video Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Video File (MP4, WebM)</label>
              <input
                type="file"
                accept="video/*"
                required
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? 'Uploading to YouTube...' : 'Upload Video'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Your Portfolio Videos ({videos.length})</h2>
        </div>
        {videos.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No videos uploaded yet.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {videos.map((video) => (
              <li key={video.id} className="p-6 flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                <div className="flex-shrink-0 w-full sm:w-48 aspect-video bg-gray-100 rounded-md overflow-hidden relative">
                  <img
                    src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{video.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{video.description}</p>
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
                  >
                    View on YouTube
                  </a>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove from portfolio"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
