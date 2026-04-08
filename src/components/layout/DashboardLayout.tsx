import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserCircle, Video, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { cn } from '../../lib/utils';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navigation = [
    { name: 'نظرة عامة', href: '/dashboard', icon: LayoutDashboard },
    { name: 'الملف الشخصي', href: '/dashboard/profile', icon: UserCircle },
    { name: 'الفيديوهات', href: '/dashboard/videos', icon: Video },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 flex-shrink-0">
        <span className="text-xl font-bold text-indigo-600">EduSaaS</span>
        <button
          onClick={handleLogout}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <LogOut className="ml-2 h-5 w-5 text-gray-400" />
          <span className="hidden sm:inline">تسجيل الخروج</span>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 flex-shrink-0 h-16 flex justify-around items-center px-2 sm:px-6 pb-safe">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                isActive
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 sm:h-6 sm:w-6',
                  isActive ? 'text-indigo-600' : 'text-gray-400'
                )}
              />
              <span className={cn("text-[10px] sm:text-xs font-medium", isActive ? 'text-indigo-600' : 'text-gray-500')}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
