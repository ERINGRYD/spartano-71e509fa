
import React from "react";
import { NavLink } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import { Shield, Swords, Eye, Activity, Trophy, PieChart } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile"; // Fixed the import to use named export

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const links = [
    {
      to: "/",
      text: t('nav.enemies'),
      icon: <Shield className="h-5 w-5" />,
    },
    {
      to: "/battlefield",
      text: t('nav.battlefield'),
      icon: <Swords className="h-5 w-5" />,
    },
    {
      to: "/battle-strategy",
      text: t('nav.strategy'),
      icon: <Eye className="h-5 w-5" />,
    },
    {
      to: "/skills",
      text: t('nav.skills'),
      icon: <Activity className="h-5 w-5" />,
    },
    {
      to: "/conquests",
      text: t('nav.conquests'),
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      to: "/summary",
      text: t('nav.summary'),
      icon: <PieChart className="h-5 w-5" />,
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-2">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="text-xl font-bold text-warrior-primary">
              {t('app.title')}
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-0.5">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "px-2 py-2 rounded-md text-sm font-medium flex items-center",
                      isActive
                        ? "text-warrior-primary bg-gray-100"
                        : "text-gray-600 hover:text-warrior-primary hover:bg-gray-50"
                    )
                  }
                >
                  {link.icon}
                  <span className="ml-1">{link.text}</span>
                </NavLink>
              ))}
            </div>
            <div className="ml-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu móvel, somente exibido em telas pequenas */}
      {isMobile && (
        <div className="md:hidden pb-1 flex justify-around overflow-x-auto border-t">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "py-1 px-1.5 flex flex-col items-center justify-center text-[10px] font-medium",
                  isActive
                    ? "text-warrior-primary"
                    : "text-gray-600 hover:text-warrior-primary"
                )
              }
            >
              {link.icon}
              <span className="mt-0.5">{link.text}</span>
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
