import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Mail, 
  HardDrive, 
  Bell, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

import logo from '../../assets/logo.svg';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Resumo' },
    { to: '/email', icon: Mail, label: 'E-mail' },
    { to: '/drive', icon: HardDrive, label: 'Arquivos' },
    { to: '/reminders', icon: Bell, label: 'Lembretes' },
    { to: '/settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-black flex flex-col h-screen border-r border-[#d2d2d7] dark:border-[#2c2c2e] transition-colors duration-300">
      <div className="p-8">
        {/* Logo removida conforme solicitado */}
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
              isActive 
                ? "bg-[#f5f5f7] dark:bg-[#1c1c1e] text-[#0071e3] shadow-none" 
                : "text-[#1d1d1f] dark:text-[#f5f5f7] opacity-60 hover:opacity-100 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e]"
            )}
          >
            <item.icon className="w-5 h-5 mr-3" strokeWidth={1.5} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-[#d2d2d7] dark:border-[#2c2c2e]">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-500 opacity-80 hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" strokeWidth={1.5} />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
