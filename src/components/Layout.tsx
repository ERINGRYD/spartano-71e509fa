
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { Loader, Shield, Award } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { useCharacter } from '@/hooks/useCharacter';

const Layout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const { level, xp, nextLevelXp, attributes } = useCharacter();
  
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Spartan Banner */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white py-2 px-3 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-bold">{t('spartan.title')}</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 hidden sm:block">
              <span className="text-xs font-bold">{t('spartan.level', { level })}</span>
            </div>
            <div className="relative w-24 sm:w-32 h-2 bg-gray-700 rounded-full">
              <div 
                className="absolute left-0 top-0 h-2 bg-yellow-500 rounded-full" 
                style={{ width: `${(xp / nextLevelXp) * 100}%` }}
              />
            </div>
            <div className="ml-1 text-xs">
              <span>{xp}/{nextLevelXp} XP</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading Bar */}
      <div className="flex justify-between p-1 sm:p-2 bg-white border-b">
        <div className="flex items-center">
          {isLoading && (
            <div className="flex items-center text-xs sm:text-sm text-gray-500 animate-pulse ml-1 sm:ml-2">
              <Loader className="animate-spin mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              <span>{t('common.loading')}</span>
            </div>
          )}
        </div>
        
        {/* Character Attributes Quick View */}
        {attributes && (
          <div className="hidden md:flex items-center space-x-4 text-xs">
            {Object.entries(attributes).map(([key, value]) => (
              <div key={key} className="flex items-center" title={t(`attributes.${key}.description`)}>
                <Award className="w-3 h-3 mr-1 text-warrior-primary" />
                <span className="font-medium mr-1">{t(`attributes.${key}.name`)}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Navbar />
      <main className="flex-grow">
        <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <div className="p-2 sm:p-4">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;

