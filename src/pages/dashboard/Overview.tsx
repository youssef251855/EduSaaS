import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { Video, Eye, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Overview() {
  const { user } = useAuth();
  const [videoCount, setVideoCount] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data());
        }

        const q = query(collection(db, 'videos'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        setVideoCount(querySnapshot.size);
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Videos</h3>
            <Video className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{videoCount}</p>
          <p className="text-sm text-gray-500 mt-2">
            {profile?.plan === 'free' ? `${videoCount} / 5 videos used` : 'Unlimited videos'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Current Plan</h3>
            <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
              {profile?.plan || 'Free'}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {profile?.plan === 'free' ? 'Upgrade to Pro for unlimited uploads.' : 'You are on the Pro plan.'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Public Profile</h3>
            <Eye className="w-5 h-5 text-indigo-500" />
          </div>
          {profile?.username ? (
            <Link
              to={`/teacher/${profile.username}`}
              target="_blank"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <LinkIcon className="w-4 h-4" />
              View Portfolio
            </Link>
          ) : (
            <p className="text-sm text-gray-500">Set up your username in Profile Settings.</p>
          )}
        </div>
      </div>
    </div>
  );
}
