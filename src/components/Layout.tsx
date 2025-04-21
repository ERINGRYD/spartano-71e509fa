
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import LanguageSwitcher from './LanguageSwitcher';
import { Loader } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

const Layout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex justify-between p-2 bg-white border-b">
        <div className="flex items-center">
          {isLoading && (
            <div className="flex items-center text-sm text-gray-500 animate-pulse ml-2">
              <Loader className="animate-spin mr-1 h-4 w-4" />
              <span>{t('common.loading') || 'Loading...'}</span>
            </div>
          )}
        </div>
        <LanguageSwitcher />
      </div>
      <Navbar />
      <main className="flex-grow">
        <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
