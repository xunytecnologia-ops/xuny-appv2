import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield, Palette, Globe } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-slate-500 dark:text-slate-400">Gerencie sua conta e preferências do sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <nav className="space-y-1">
            {[
              { label: 'Perfil', icon: User, active: true },
              { label: 'Notificações', icon: Bell },
              { label: 'Privacidade', icon: Shield },
              { label: 'Aparência', icon: Palette },
              { label: 'Idioma', icon: Globe },
            ].map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  item.active 
                    ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm border border-slate-100 dark:border-slate-800" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Informações do Perfil</h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <img src={user?.picture} alt="" className="w-20 h-20 rounded-2xl border-4 border-slate-50 dark:border-slate-800" />
                <button className="text-sm font-semibold text-blue-600 hover:underline">Alterar foto</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome Completo</label>
                  <input 
                    type="text" 
                    defaultValue={user?.name}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Corporativo</label>
                  <input 
                    type="email" 
                    defaultValue={user?.email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Assinatura de Email</label>
                <textarea 
                  rows={4}
                  placeholder="Atenciosamente, [Seu Nome]"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200 dark:shadow-none">
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
