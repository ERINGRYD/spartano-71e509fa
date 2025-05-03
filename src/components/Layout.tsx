
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { Loader } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Layout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex justify-between p-1 sm:p-2 bg-white border-b">
        <div className="flex items-center">
          {isLoading && (
            <div className="flex items-center text-xs sm:text-sm text-gray-500 animate-pulse ml-1 sm:ml-2">
              <Loader className="animate-spin mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              <span>{t('common.loading') || 'Loading...'}</span>
            </div>
          )}
        </div>
      </div>
      <Navbar />
      <main className="flex-grow">
        <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <div className="p-1 sm:p-4 pb-16 md:pb-4">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
