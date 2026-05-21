import React from 'react';
import { 
  Mail, 
  HardDrive, 
  Bell, 
  Database,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import api from '../lib/api';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white dark:bg-[#1d1d1f] p-8 rounded-4xl border border-[#d2d2d7] dark:border-[#424245] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] group">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-[#f5f5f7] dark:bg-[#2d2d2f] rounded-2xl group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-[#1d1d1f] dark:text-[#f5f5f7]" strokeWidth={1.5} />
      </div>
      {trend && (
        <span className="flex items-center text-[11px] font-bold text-[#0071e3] bg-[#0071e3]/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
          {trend}
          <ArrowUpRight className="w-3 h-3 ml-1" />
        </span>
      )}
    </div>
    <h3 className="text-[#86868b] text-xs font-bold uppercase tracking-[0.1em]">{title}</h3>
    <p className="text-3xl font-semibold mt-2 tracking-tight">{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = React.useState({ emails: 0, files: 0, reminders: 0, space: '0 GB' });
  const [recentActivities, setRecentActivities] = React.useState([]);
  const [todayReminders, setTodayReminders] = React.useState([]);

  const formatSize = (bytes) => {
    if (!bytes) return '0 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [emailsRes, filesRes, remindersRes, quotaRes] = await Promise.allSettled([
          api.get('/api/gmail', { params: { maxResults: 5 } }),
          api.get('/api/drive', { params: { pageSize: 5 } }),
          api.get('/api/reminders'),
          api.get('/api/drive/quota')
        ]);

        const emailsData = emailsRes.status === 'fulfilled' ? emailsRes.value.data : null;
        const filesData = filesRes.status === 'fulfilled' ? filesRes.value.data : null;
        const remindersData = remindersRes.status === 'fulfilled' ? remindersRes.value.data : [];
        const quotaData = quotaRes.status === 'fulfilled' ? quotaRes.value.data : null;

        setStats({
          emails: emailsData?.resultSizeEstimate || 0,
          files: filesData?.length || 0,
          reminders: Array.isArray(remindersData) ? remindersData.filter(r => r.status === 'pending').length : 0,
          space: quotaData ? formatSize(quotaData.usage) : '0 GB'
        });

        if (emailsData?.messages) {
          setRecentActivities(emailsData.messages.map(email => ({
            id: email.id,
            type: 'mail',
            title: `Email de ${email.payload.headers.find(h => h.name === 'From')?.value || 'Desconhecido'}`,
            time: 'Recente'
          })));
        }

        if (Array.isArray(remindersData)) {
          setTodayReminders(remindersData.filter(r => r.status === 'pending').slice(0, 3));
        }

        // Se ambos falharem com 403, avisar o usuário
        if (emailsRes.status === 'rejected' && emailsRes.reason.response?.status === 403) {
          console.warn('Gmail API not enabled');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    if (user) fetchData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-4">
      <div className="space-y-2">
        <h2 className="text-4xl font-semibold tracking-tight">Olá, {user?.name.split(' ')[0]}.</h2>
        <p className="text-[#86868b] text-lg font-medium">Tudo o que está acontecendo agora.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Não lidos" 
          value={stats.emails} 
          icon={Mail} 
          trend="+5%"
        />
        <StatCard 
          title="Arquivos" 
          value={stats.files} 
          icon={HardDrive} 
        />
        <StatCard 
          title="Pendentes" 
          value={stats.reminders} 
          icon={Bell} 
        />
        <StatCard 
          title="Armazenamento" 
          value={stats.space} 
          icon={Database} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#1d1d1f] rounded-4xl p-10 border border-[#d2d2d7] dark:border-[#424245] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none">
            <h3 className="text-xl font-semibold mb-8">Atividades Recentes</h3>
            <div className="space-y-8">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] dark:bg-[#2d2d2f] flex items-center justify-center mr-6 transition-all group-hover:bg-[#0071e3]/10">
                    <Mail className="w-5 h-5 text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors group-hover:text-[#0071e3]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 border-b border-[#f5f5f7] dark:border-[#2d2d2f] pb-6 group-last:border-0 group-last:pb-0">
                    <p className="text-base font-medium group-hover:text-[#0071e3] transition-colors">{activity.title}</p>
                    <p className="text-sm text-[#86868b] mt-1 font-medium">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-4xl p-10 border border-[#d2d2d7] dark:border-[#424245]">
            <h3 className="text-xl font-semibold mb-8 flex items-center">
              <Clock className="w-5 h-5 mr-3 text-[#0071e3]" strokeWidth={1.5} />
              Próximos Lembretes
            </h3>
            <div className="space-y-4">
              {todayReminders.map((reminder, i) => (
                <div key={reminder._id || i} className="p-6 rounded-3xl bg-white dark:bg-[#2d2d2f] border border-black/5 dark:border-white/5 shadow-sm transition-all hover:shadow-md cursor-pointer">
                  <p className="text-base font-semibold">{reminder.title || 'Reunião com cliente'}</p>
                  <p className="text-sm text-[#86868b] mt-2 font-medium">
                    {reminder.dueDate ? format(new Date(reminder.dueDate), 'HH:mm') : '14:30'} • {reminder.description || 'Projeto X'}
                  </p>
                </div>
              ))}
              <button className="w-full mt-4 py-3 text-sm text-[#0071e3] font-bold hover:underline transition-all">
                Ver todos os lembretes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
