
import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  
  const { signOut, user } = useAuth();
  
  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex space-x-2">
            <Link to="/" className={`px-3 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-700 ${location.pathname === '/' ? 'bg-gray-700' : ''}`}>
              Inimigos
            </Link>
            <Link to="/battlefield" className={`px-3 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-700 ${location.pathname === '/battlefield' ? 'bg-gray-700' : ''}`}>
              Campo de Batalha
            </Link>
            <Link to="/battle-strategy" className={`px-3 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-700 ${location.pathname === '/battle-strategy' ? 'bg-gray-700' : ''}`}>
              Estratégia
            </Link>
            <Link to="/skills" className={`px-3 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-700 ${location.pathname === '/skills' ? 'bg-gray-700' : ''}`}>
              Habilidades
            </Link>
            <Link to="/conquests" className={`px-3 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-700 ${location.pathname === '/conquests' ? 'bg-gray-700' : ''}`}>
              Conquistas
            </Link>
             <Link to="/summary" className={`px-3 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-700 ${location.pathname === '/summary' ? 'bg-gray-700' : ''}`}>
              Resumo
            </Link>
            <Link to="/spartan-progress" className={`px-3 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-700 ${location.pathname === '/spartan-progress' ? 'bg-gray-700' : ''}`}>
              Progresso
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {user && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-gray-700"
                onClick={() => signOut()}
              >
                Sair
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
