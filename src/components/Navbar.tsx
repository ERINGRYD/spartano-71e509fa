
import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Home, Swords, Shield, BookOpen, Trophy, FileText, BarChart, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Navbar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const isMobile = useIsMobile();
  
  const navItems = [
    { path: '/', icon: <Home className="h-5 w-5" />, label: 'Inimigos' },
    { path: '/battlefield', icon: <Swords className="h-5 w-5" />, label: 'Campo de Batalha' },
    { path: '/battle-strategy', icon: <Shield className="h-5 w-5" />, label: 'Estratégia' },
    { path: '/skills', icon: <BookOpen className="h-5 w-5" />, label: 'Habilidades' },
    { path: '/conquests', icon: <Trophy className="h-5 w-5" />, label: 'Conquistas' },
    { path: '/summary', icon: <FileText className="h-5 w-5" />, label: 'Resumo' },
    { path: '/spartan-progress', icon: <BarChart className="h-5 w-5" />, label: 'Progresso' }
  ];
  
  return (
    <nav className="bg-gray-800 text-white shadow-md overflow-x-auto">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex space-x-1 md:space-x-2">
            <TooltipProvider delayDuration={300}>
              {navItems.map((item) => (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Link 
                      to={item.path} 
                      className={`
                        p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-700 
                        ${location.pathname === item.path ? 'bg-gray-700' : ''}
                        flex items-center justify-center
                      `}
                      aria-label={item.label}
                    >
                      {item.icon}
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {user && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-gray-700"
                      onClick={() => signOut()}
                      aria-label="Sair"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sair</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
