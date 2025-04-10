
import { Link, useLocation } from 'react-router-dom';
import { Swords, Shield, Compass, Cpu, Trophy } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'text-warrior-primary font-semibold border-b-2 border-warrior-primary' 
      : 'text-gray-600 hover:text-warrior-primary';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-2">
            <Swords className="w-6 h-6 text-warrior-primary" />
            <span className="text-xl font-bold text-warrior-primary">
              Preparo de Batalha
            </span>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link to="/" className={`flex items-center space-x-1 ${isActive('/')}`}>
              <Shield className="w-5 h-5" />
              <span>Inimigos</span>
            </Link>

            <Link to="/battlefield" className={`flex items-center space-x-1 ${isActive('/battlefield')}`}>
              <Swords className="w-5 h-5" />
              <span>Campo de Batalha</span>
            </Link>

            <Link to="/battle-strategy" className={`flex items-center space-x-1 ${isActive('/battle-strategy')}`}>
              <Compass className="w-5 h-5" />
              <span>Estratégia de Batalha</span>
            </Link>
            
            <Link to="/skills" className={`flex items-center space-x-1 ${isActive('/skills')}`}>
              <Cpu className="w-5 h-5" />
              <span>Skills</span>
            </Link>
          </div>

          <Link to="/conquests" className={`hidden md:flex items-center space-x-1 ${isActive('/conquests')}`}>
            <Trophy className="w-5 h-5" />
            <span>Jornada e Conquistas</span>
          </Link>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden flex justify-between py-3 border-t border-gray-200">
          <Link to="/" className={`flex flex-col items-center space-y-1 ${isActive('/')}`}>
            <Shield className="w-5 h-5" />
            <span className="text-xs">Inimigos</span>
          </Link>

          <Link to="/battlefield" className={`flex flex-col items-center space-y-1 ${isActive('/battlefield')}`}>
            <Swords className="w-5 h-5" />
            <span className="text-xs">Campo</span>
          </Link>

          <Link to="/battle-strategy" className={`flex flex-col items-center space-y-1 ${isActive('/battle-strategy')}`}>
            <Compass className="w-5 h-5" />
            <span className="text-xs">Estratégia</span>
          </Link>
          
          <Link to="/skills" className={`flex flex-col items-center space-y-1 ${isActive('/skills')}`}>
            <Cpu className="w-5 h-5" />
            <span className="text-xs">Skills</span>
          </Link>
          
          <Link to="/conquests" className={`flex flex-col items-center space-y-1 ${isActive('/conquests')}`}>
            <Trophy className="w-5 h-5" />
            <span className="text-xs">Jornada</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
