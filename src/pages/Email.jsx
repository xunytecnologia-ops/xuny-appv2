import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, 
  Send, 
  Trash2, 
  Star, 
  Archive, 
  RefreshCw,
  Search,
  Plus,
  Paperclip,
  Reply,
  Forward,
  ChevronLeft,
  ChevronRight,
  X,
  HardDrive,
  MoreVertical,
  FolderOpen
} from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';

const Email = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '', attachments: [] });
  const [currentLabel, setCurrentLabel] = useState('INBOX');

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      const params = { q: searchTerm ? `${searchTerm} label:${currentLabel}` : `label:${currentLabel}` };
      const response = await api.get('/api/gmail', { params });
      setEmails(response.data.messages || []);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('API do Gmail desativada. Por favor, ative-a no Google Cloud Console.');
      } else {
        toast.error('Erro ao carregar emails');
      }
    } finally {
      setLoading(false);
    }
  }, [currentLabel, searchTerm]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const getHeader = (headers, name) => {
    return headers.find(h => h.name === name)?.value || '';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const sendPromise = api.post('/api/gmail/send', composeData);
      await toast.promise(sendPromise, {
        loading: 'Enviando email...',
        success: 'Email enviado com sucesso!',
        error: 'Erro ao enviar email'
      });
      setIsComposeOpen(false);
      setComposeData({ to: '', subject: '', body: '', attachments: [] });
    } catch (error) {
      console.error(error);
    }
  };

  const handleMoveToTrash = async (id) => {
    try {
      await api.delete(`/api/gmail/${id}`);
      toast.success('Email movido para a lixeira');
      setSelectedEmail(null);
      fetchEmails();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-[#1d1d1f] rounded-4xl overflow-hidden border border-[#d2d2d7] dark:border-[#424245] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none">
      {/* Sidebar - Labels */}
      <div className="w-64 border-r border-[#d2d2d7] dark:border-[#424245] p-6 space-y-6 hidden lg:block bg-[#f5f5f7]/50 dark:bg-[#1d1d1f]/50">
        <button 
          onClick={() => setIsComposeOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#0071e3] hover:bg-[#0077ed] text-white py-3 px-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-[#0071e3]/20"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Escrever
        </button>
        
        <nav className="space-y-1">
          {[
            { label: 'Entrada', id: 'INBOX', icon: Mail },
            { label: 'Enviados', id: 'SENT', icon: Send },
            { label: 'Importantes', id: 'STARRED', icon: Star },
            { label: 'Lixeira', id: 'TRASH', icon: Trash2 },
            { label: 'Arquivados', id: 'SPAM', icon: Archive },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentLabel(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                currentLabel === item.id 
                  ? "bg-white dark:bg-[#323236] text-[#0071e3] shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                  : "text-[#1d1d1f] dark:text-[#f5f5f7] opacity-60 hover:opacity-100 hover:bg-white dark:hover:bg-[#2d2d2f]"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" strokeWidth={1.5} />
                {item.label}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* List */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 border-r border-[#d2d2d7] dark:border-[#424245]",
        selectedEmail ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b border-[#d2d2d7] dark:border-[#424245] flex items-center justify-between bg-white/50 dark:bg-[#1d1d1f]/50 glass">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
            <input
              type="text"
              placeholder="Buscar emails..."
              className="w-full pl-10 pr-4 py-2 bg-[#f5f5f7] dark:bg-[#2d2d2f] border-none rounded-full text-sm focus:ring-2 focus:ring-[#0071e3] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchEmails} className="p-2 text-[#86868b] hover:bg-[#f5f5f7] dark:hover:bg-[#2d2d2f] rounded-full ml-2">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white dark:bg-[#1d1d1f]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : emails.length === 0 ? (
            <div className="p-12 text-center text-[#86868b] font-medium">Nenhum email encontrado.</div>
          ) : (
            emails.map((email) => {
              const subject = getHeader(email.payload.headers, 'Subject');
              const from = getHeader(email.payload.headers, 'From');
              const date = getHeader(email.payload.headers, 'Date');

              return (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={cn(
                    "p-6 border-b border-[#f5f5f7] dark:border-[#2d2d2f] cursor-pointer hover:bg-[#f5f5f7]/50 dark:hover:bg-[#2d2d2f]/50 transition-all duration-200",
                    selectedEmail?.id === email.id && "bg-[#f5f5f7] dark:bg-[#2d2d2f] ring-1 ring-inset ring-[#0071e3]/10"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate max-w-[150px]">{from}</span>
                    <span className="text-[11px] font-bold text-[#86868b] uppercase">
                      {date ? (isNaN(new Date(date).getTime()) ? '' : format(new Date(date), 'HH:mm')) : ''}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] truncate mb-1">{subject}</h4>
                  <p className="text-xs text-[#86868b] truncate line-clamp-1">{email.snippet}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "flex-[2] flex flex-col min-w-0 bg-[#f5f5f7]/30 dark:bg-black/30",
        !selectedEmail && "hidden md:flex items-center justify-center"
      )}>
        {selectedEmail ? (
          <>
            <div className="p-4 border-b border-[#d2d2d7] dark:border-[#424245] flex items-center justify-between bg-white/50 dark:bg-[#1d1d1f]/50 glass">
              <div className="flex gap-1">
                <button className="p-2.5 hover:bg-white dark:hover:bg-[#2d2d2f] rounded-full text-[#1d1d1f] dark:text-[#f5f5f7] opacity-60 hover:opacity-100 transition-all shadow-sm"><Reply className="w-4 h-4" strokeWidth={1.5} /></button>
                <button className="p-2.5 hover:bg-white dark:hover:bg-[#2d2d2f] rounded-full text-[#1d1d1f] dark:text-[#f5f5f7] opacity-60 hover:opacity-100 transition-all shadow-sm"><Forward className="w-4 h-4" strokeWidth={1.5} /></button>
                <button 
                  onClick={() => handleMoveToTrash(selectedEmail.id)}
                  className="p-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full text-red-500 opacity-60 hover:opacity-100 transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              <button 
                onClick={() => setSelectedEmail(null)}
                className="md:hidden px-4 py-2 bg-white dark:bg-[#2d2d2f] text-xs font-bold rounded-full shadow-sm"
              >
                Voltar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-white dark:bg-[#1d1d1f]">
              <h2 className="text-3xl font-semibold tracking-tight mb-8 leading-tight">{getHeader(selectedEmail.payload.headers, 'Subject')}</h2>
              <div className="flex items-center justify-between mb-12 pb-8 border-b border-[#f5f5f7] dark:border-[#2d2d2f]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] dark:bg-[#2d2d2f] flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] font-bold text-lg">
                    {getHeader(selectedEmail.payload.headers, 'From')[0]}
                  </div>
                  <div>
                    <p className="text-base font-semibold">{getHeader(selectedEmail.payload.headers, 'From')}</p>
                    <p className="text-xs text-[#86868b] font-medium">Para: mim</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#86868b] uppercase tracking-wider">
                  {selectedEmail && getHeader(selectedEmail.payload.headers, 'Date') && !isNaN(new Date(getHeader(selectedEmail.payload.headers, 'Date')).getTime())
                    ? format(new Date(getHeader(selectedEmail.payload.headers, 'Date')), 'dd MMM yyyy, HH:mm')
                    : ''}
                </span>
              </div>
              <div className="prose dark:prose-invert max-w-none text-base text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
                <p className="whitespace-pre-wrap">{selectedEmail.snippet}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-12">
            <div className="w-24 h-24 bg-white dark:bg-[#1d1d1f] rounded-4xl flex items-center justify-center mx-auto mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#d2d2d7] dark:border-[#424245]">
              <Mail className="w-10 h-10 text-[#86868b] opacity-20" strokeWidth={1} />
            </div>
            <p className="text-[#86868b] font-medium text-lg">Selecione uma mensagem para ler</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1d1d1f] rounded-4xl shadow-2xl border border-[#d2d2d7] dark:border-[#424245] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-[#f5f5f7] dark:border-[#2d2d2f] flex items-center justify-between">
              <h3 className="text-lg font-semibold">Nova Mensagem</h3>
              <button onClick={() => setIsComposeOpen(false)} className="p-2 hover:bg-[#f5f5f7] dark:hover:bg-[#2d2d2f] rounded-full transition-colors text-[#86868b]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSend} className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-4 border-b border-[#f5f5f7] dark:border-[#2d2d2f] pb-2">
                  <span className="text-sm font-bold text-[#86868b] uppercase w-12">Para</span>
                  <input 
                    type="email" 
                    required
                    className="flex-1 px-0 py-2 bg-transparent focus:ring-0 border-none text-sm font-medium"
                    value={composeData.to}
                    onChange={e => setComposeData({...composeData, to: e.target.value})}
                  />
                </div>
                <div className="flex items-center gap-4 border-b border-[#f5f5f7] dark:border-[#2d2d2f] pb-2">
                  <span className="text-sm font-bold text-[#86868b] uppercase w-12">Assunto</span>
                  <input 
                    type="text" 
                    required
                    className="flex-1 px-0 py-2 bg-transparent focus:ring-0 border-none text-sm font-medium"
                    value={composeData.subject}
                    onChange={e => setComposeData({...composeData, subject: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex-1 min-h-[300px]">
                <textarea 
                  placeholder="Escreva sua mensagem aqui..."
                  className="w-full h-full p-0 border-none bg-transparent focus:ring-0 text-base leading-relaxed resize-none placeholder:text-[#86868b]/50"
                  value={composeData.body}
                  onChange={e => setComposeData({...composeData, body: e.target.value})}
                />
              </div>
              <div className="pt-6 border-t border-[#f5f5f7] dark:border-[#2d2d2f] flex items-center justify-between">
                <div className="flex gap-1">
                  <button type="button" className="p-3 hover:bg-[#f5f5f7] dark:hover:bg-[#2d2d2f] rounded-full text-[#86868b] transition-colors">
                    <Paperclip className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  <button type="button" className="p-3 hover:bg-[#f5f5f7] dark:hover:bg-[#2d2d2f] rounded-full text-[#86868b] transition-colors">
                    <HardDrive className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
                <button 
                  type="submit"
                  className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-[#0071e3]/20 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" strokeWidth={2.5} />
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Email;
