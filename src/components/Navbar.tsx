
import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Home, Swords, Shield, BookOpen, BarChart, LogOut, Target, List, Plus, Bell } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from 'react';
import { getEnemies } from '@/utils/storage';
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [hasNotifications, setHasNotifications] = useState(false);
  
  // Verifica se há inimigos que precisam de revisão
  useEffect(() => {
    if (user) {
      checkForReviewNeeds();
    }
  }, [user, location.pathname]);
  
  const checkForReviewNeeds = () => {
    try {
      const enemies = getEnemies();
      const needsReview = enemies.some(enemy => {
        // Considera inimigos que têm progresso menor que 50% como necessitando de revisão
        return enemy.progress < 50 || enemy.status === 'needs_review';
      });
      
      setHasNotifications(needsReview);
    } catch (error) {
      console.error("Erro ao verificar notificações:", error);
    }
  };
  
  const handleNotificationClick = () => {
    const enemies = getEnemies();
    const reviewEnemies = enemies.filter(e => e.progress < 50 || e.status === 'needs_review');
    
    if (reviewEnemies.length > 0) {
      toast({
        title: "Temas que precisam de revisão",
        description: `Você tem ${reviewEnemies.length} temas que precisam de revisão.`,
        action: (
          <Link to="/spartan-progress" className="bg-amber-500 text-white px-3 py-1 rounded-md text-xs">
            Ver Detalhes
          </Link>
        ),
      });
    } else {
      toast({
        title: "Nenhuma revisão pendente",
        description: "Você não tem temas que precisam de revisão no momento.",
      });
    }
  };
  
  const navItems = [
    { path: '/', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
    { path: '/enemies', icon: <Target className="h-5 w-5" />, label: 'Inimigos' },
    { path: '/battlefield', icon: <Swords className="h-5 w-5" />, label: 'Campo de Batalha' },
    { path: '/battle-strategy', icon: <Shield className="h-5 w-5" />, label: 'Estratégia' },
    { path: '/battle-simulations', icon: <Target className="h-5 w-5" />, label: 'Simulados' },
    { path: '/full-challenge', icon: <List className="h-5 w-5" />, label: 'Desafio Completo' },
    { path: '/skills', icon: <BookOpen className="h-5 w-5" />, label: 'Habilidades' },
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
              
              {/* Novo ícone para cadastro rápido de inimigos */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    to="/enemies" 
                    state={{ openEnemyForm: true }}
                    className={`
                      p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-700
                      flex items-center justify-center text-amber-400
                    `}
                    aria-label="Cadastrar Inimigo"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="sr-only">Cadastrar Inimigo</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Cadastrar Inimigo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Botão de notificações */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-gray-700 relative"
                    onClick={handleNotificationClick}
                    aria-label="Notificações"
                  >
                    <Bell className="h-5 w-5" />
                    {hasNotifications && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notificações</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
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
