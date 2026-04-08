import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BookOpen, UserCircle } from 'lucide-react';

export default function TeacherProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfileAndVideos() {
      if (!username) return;
      try {
        // Fetch user profile by username
        const usersRef = collection(db, 'users');
        const qUser = query(usersRef, where('username', '==', username.toLowerCase()));
        const userSnapshot = await getDocs(qUser);
        
        if (userSnapshot.empty) {
          setError('Teacher not found');
          setLoading(false);
          return;
        }

        const userData = userSnapshot.docs[0].data();
        setProfile(userData);

        // Fetch videos for this user
        const videosRef = collection(db, 'videos');
        const qVideos = query(videosRef, where('userId', '==', userData.id));
        const videoSnapshot = await getDocs(qVideos);
        
        const videosData = videoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVideos(videosData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err) {
        console.error('Error fetching public profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndVideos();
  }, [username]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">EduSaaS</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="w-32 h-32 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
            {profile.image ? (
              <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-full h-full text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-gray-900">{profile.name}</h1>
            <p className="text-indigo-600 font-medium mt-1">@{profile.username}</p>
            {profile.bio && (
              <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Videos Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Educational Videos</h2>
          {videos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
              No videos uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video w-full">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2" title={video.title}>
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
