import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Mail, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  X
} from 'lucide-react';
import api from '../lib/api';
import { format, isPast } from 'date-fns';
import { cn } from '../lib/utils';

import { useAuth } from '../context/AuthContext';
import { mockReminders } from '../lib/mockData';

const Reminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dueDate: '',
    recurrence: 'none'
  });

  const fetchReminders = async () => {
    if (user?.isDemo) {
      setReminders(mockReminders);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get('/api/reminders');
      setReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const toggleStatus = async (reminder) => {
    if (user?.isDemo) {
      const newStatus = reminder.status === 'pending' ? 'completed' : 'pending';
      setReminders(reminders.map(r => 
        r._id === reminder._id ? { ...r, status: newStatus } : r
      ));
      return;
    }
    try {
      const newStatus = reminder.status === 'pending' ? 'completed' : 'pending';
      await api.patch(`/api/reminders/${reminder._id}`, { status: newStatus });
      setReminders(reminders.map(r => 
        r._id === reminder._id ? { ...r, status: newStatus } : r
      ));
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold tracking-tight">Lembretes</h2>
          <p className="text-[#86868b] text-lg font-medium">Organize o que é importante hoje.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#0077ed] text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-[#0071e3]/20"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Novo
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-[#1d1d1f] rounded-4xl border border-[#d2d2d7] dark:border-[#424245]">
            <div className="w-20 h-20 bg-[#f5f5f7] dark:bg-[#2d2d2f] rounded-4xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-[#86868b] opacity-20" strokeWidth={1} />
            </div>
            <p className="text-[#86868b] font-medium text-lg">Nada planejado por enquanto.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1d1d1f] rounded-4xl border border-[#d2d2d7] dark:border-[#424245] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden divide-y divide-[#f5f5f7] dark:divide-[#2d2d2f]">
            {reminders.map((reminder) => {
              const isOverdue = reminder.status === 'pending' && isPast(new Date(reminder.dueDate));
              
              return (
                <div 
                  key={reminder._id}
                  className={cn(
                    "group flex items-start gap-6 p-8 transition-all hover:bg-[#f5f5f7]/50 dark:hover:bg-[#2d2d2f]/50",
                    reminder.status === 'completed' && "opacity-40"
                  )}
                >
                  <button 
                    onClick={() => toggleStatus(reminder)}
                    className={cn(
                      "mt-1 transition-all duration-300 transform hover:scale-110",
                      reminder.status === 'completed' ? "text-[#0071e3]" : "text-[#d2d2d7] dark:text-[#424245] hover:text-[#0071e3]"
                    )}
                  >
                    {reminder.status === 'completed' ? <CheckCircle2 className="w-6 h-6" strokeWidth={2} /> : <Circle className="w-6 h-6" strokeWidth={1.5} />}
                  </button>
                  
                  <div className="flex-1">
                    <h4 className={cn(
                      "text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] transition-all",
                      reminder.status === 'completed' && "line-through"
                    )}>
                      {reminder.title}
                    </h4>
                    {reminder.description && (
                      <p className="text-[#86868b] text-sm mt-1 font-medium">{reminder.description}</p>
                    )}
                    <div className="flex items-center gap-6 mt-3">
                      <div className={cn(
                        "flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider",
                        isOverdue ? "text-red-500" : "text-[#86868b]"
                      )}>
                        <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                        {format(new Date(reminder.dueDate), "dd MMM • HH:mm")}
                      </div>
                      {reminder.emailId && (
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0071e3]">
                          <Mail className="w-3.5 h-3.5" strokeWidth={2} />
                          E-mail
                        </div>
                      )}
                    </div>
                  </div>

                  <button className="p-2 text-[#86868b] opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all rounded-full hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal - Apple Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-md bg-white dark:bg-[#1d1d1f] rounded-4xl shadow-2xl border border-[#d2d2d7] dark:border-[#424245] p-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-semibold">Novo Lembrete</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#f5f5f7] dark:hover:bg-[#2d2d2f] rounded-full text-[#86868b] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form className="space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest pl-1">Título</label>
                <input
                  type="text"
                  required
                  placeholder="O que precisa ser feito?"
                  className="w-full px-6 py-4 bg-[#f5f5f7] dark:bg-[#2d2d2f] border-none rounded-2xl focus:ring-2 focus:ring-[#0071e3] transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest pl-1">Data e Hora</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-6 py-4 bg-[#f5f5f7] dark:bg-[#2d2d2f] border-none rounded-2xl focus:ring-2 focus:ring-[#0071e3] transition-all text-sm font-medium"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] bg-[#f5f5f7] dark:bg-[#2d2d2f] hover:bg-[#eaeaec] dark:hover:bg-[#323236] rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 text-sm font-bold text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-2xl transition-all shadow-lg shadow-[#0071e3]/20"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;
