import React from 'react';
import { Search, Moon, Sun, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user } = useAuth();
  const [isDark, setIsDark] = React.useState(
    document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-black sticky top-0 z-30 border-b border-[#d2d2d7] dark:border-[#424245] flex items-center justify-between px-8 transition-colors duration-300">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 bg-[#f5f5f7] dark:bg-[#1d1d1f] border-none rounded-full text-sm focus:ring-1 focus:ring-[#0071e3] transition-all duration-300 placeholder:text-[#86868b] text-[#1d1d1f] dark:text-[#f5f5f7]"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={toggleTheme}
          className="p-2.5 text-[#1d1d1f] dark:text-[#f5f5f7] opacity-60 hover:opacity-100 hover:bg-[#f5f5f7] dark:hover:bg-[#1d1d1f] rounded-full transition-all duration-200"
        >
          {isDark ? <Sun className="w-5 h-5" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />}
        </button>
        
        <button className="p-2.5 text-[#1d1d1f] dark:text-[#f5f5f7] opacity-60 hover:opacity-100 hover:bg-[#f5f5f7] dark:hover:bg-[#1d1d1f] rounded-full transition-all duration-200 relative">
          <Bell className="w-5 h-5" strokeWidth={1.5} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#0071e3] rounded-full"></span>
        </button>

        <div className="flex items-center pl-4 ml-2 border-l border-[#d2d2d7] dark:border-[#424245]">
          <div className="text-right mr-3 hidden sm:block">
            <p className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] leading-none">{user?.name}</p>
            <p className="text-[11px] text-[#86868b] mt-1 font-medium">{user?.email}</p>
          </div>
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#d2d2d7] dark:border-[#424245] shadow-sm">
            <img
              src={user?.picture}
              alt={user?.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
