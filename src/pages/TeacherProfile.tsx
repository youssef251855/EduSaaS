import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BookOpen, UserCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

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
          setError('المعلم غير موجود');
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
        setError('فشل في تحميل الملف الشخصي');
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndVideos();
  }, [username]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{profile.name} - محفظة الفيديوهات التعليمية</title>
        <meta name="description" content={profile.bio || `محفظة الفيديوهات التعليمية للأستاذ ${profile.name}. شاهد أحدث الدروس والشروحات.`} />
        <meta property="og:title" content={`${profile.name} - محفظة الفيديوهات التعليمية`} />
        <meta property="og:description" content={profile.bio || `محفظة الفيديوهات التعليمية للأستاذ ${profile.name}. شاهد أحدث الدروس والشروحات.`} />
        {profile.image && <meta property="og:image" content={profile.image} />}
      </Helmet>

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
            {profile.youtubeChannelTitle && (
              <a 
                href={`https://www.youtube.com/channel/${profile.youtubeChannelId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                {profile.youtubeChannelTitle}
              </a>
            )}
            {profile.bio && (
              <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Videos Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">الفيديوهات التعليمية</h2>
          {videos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
              لم يتم رفع أي فيديوهات بعد.
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
