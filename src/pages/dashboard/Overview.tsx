import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { Video, Eye, Link as LinkIcon, Search, Globe, CheckCircle2 } from 'lucide-react';
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

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">نظرة عامة على لوحة التحكم</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">إجمالي الفيديوهات</h3>
            <Video className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{videoCount}</p>
          <p className="text-sm text-gray-500 mt-2">
            {profile?.plan === 'free' ? `تم استخدام ${videoCount} / 5 فيديوهات` : 'فيديوهات غير محدودة'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">الخطة الحالية</h3>
            <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
              {profile?.plan || 'مجانية'}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {profile?.plan === 'free' ? 'قم بالترقية إلى الخطة الاحترافية لرفع غير محدود.' : 'أنت على الخطة الاحترافية.'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">الملف الشخصي العام</h3>
            <Eye className="w-5 h-5 text-indigo-500" />
          </div>
          {profile?.username ? (
            <Link
              to={`/teacher/${profile.username}`}
              target="_blank"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <LinkIcon className="w-4 h-4" />
              عرض المحفظة
            </Link>
          ) : (
            <p className="text-sm text-gray-500">قم بإعداد اسم المستخدم في إعدادات الملف الشخصي.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">كيف تظهر محفظتك على محركات البحث؟</h2>
        </div>
        
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed">
            تم تصميم منصتنا لتكون صديقة لمحركات البحث (SEO Friendly). عندما يبحث الطلاب عن اسمك أو تخصصك على Google، يمكنهم العثور على محفظتك التعليمية بسهولة. إليك بعض النصائح لتحسين ظهورك:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                نصائح لتحسين الظهور
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                  <span><strong>الاسم الكامل:</strong> استخدم اسمك الحقيقي والكامل في إعدادات الملف الشخصي (مثال: أ. أحمد محمد - مدرس رياضيات).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                  <span><strong>النبذة التعريفية (Bio):</strong> اكتب وصفاً دقيقاً يحتوي على الكلمات التي قد يبحث عنها الطلاب (مثل: المرحلة الثانوية، اسم المادة، المدينة).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                  <span><strong>عناوين الفيديوهات:</strong> اجعل عناوين الفيديوهات واضحة وتعبر عن محتوى الدرس بدقة.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                شكل الظهور في Google
              </h3>
              <div className="bg-white p-4 rounded border border-gray-200 shadow-sm" dir="rtl">
                <div className="text-sm text-gray-800 truncate flex items-center gap-1" dir="ltr">
                  <span className="text-gray-500">https://</span>edu-saa-s.vercel.app/teacher/{profile?.username || 'username'}
                </div>
                <div className="text-lg text-blue-700 hover:underline cursor-pointer truncate mt-1">
                  {profile?.name || 'اسم المعلم'} - محفظة الفيديوهات التعليمية
                </div>
                <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {profile?.bio || 'نبذة تعريفية عن المعلم تظهر هنا. أستاذ متخصص في تدريس المادة للمرحلة الثانوية بخبرة طويلة...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
