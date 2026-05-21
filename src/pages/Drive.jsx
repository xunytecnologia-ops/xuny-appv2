import React, { useState, useEffect, useCallback } from 'react';
import { 
  Folder, 
  File, 
  Search, 
  Grid, 
  List, 
  Plus, 
  Upload, 
  ChevronRight,
  Download,
  Trash2,
  Share2,
  Edit2,
  FileText,
  FileImage,
  FileVideo,
  FileCode,
  MoreHorizontal
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import api from '../lib/api';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';

const Drive = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Meu Drive' }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [draggedFileId, setDraggedFileId] = useState(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const params = currentFolder ? { folderId: currentFolder } : {};
      if (searchTerm) params.q = `name contains '${searchTerm}' and trashed = false`;
      const response = await api.get('/api/drive', { params });
      setFiles(response.data || []);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('API do Google Drive desativada. Por favor, ative-a no Google Cloud Console.');
      } else {
        toast.error('Erro ao carregar arquivos');
      }
    } finally {
      setLoading(false);
    }
  }, [currentFolder, searchTerm]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const formData = new FormData();
    acceptedFiles.forEach(file => formData.append('files', file));
    if (currentFolder) formData.append('parentId', currentFolder);

    try {
      const uploadPromise = api.post('/api/drive/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await toast.promise(uploadPromise, {
        loading: 'Enviando arquivos...',
        success: 'Upload concluído!',
        error: 'Erro no upload'
      });
      fetchFiles();
    } catch (error) {
      console.error(error);
    }
  }, [currentFolder, fetchFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const getFileIcon = (mimeType) => {
    if (mimeType === 'application/vnd.google-apps.folder') return Folder;
    if (mimeType.includes('image')) return FileImage;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('video')) return FileVideo;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileCode;
    return File;
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
    setSelectedFileId(null);
  };

  const handleGoBack = () => {
    if (breadcrumbs.length > 1) {
      navigateToBreadcrumb(breadcrumbs.length - 2);
    }
  };

  const navigateToBreadcrumb = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[index].id);
    setSelectedFileId(null);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await api.post('/api/drive/folder', { 
        name: newFolderName,
        parentId: currentFolder 
      });
      toast.success('Pasta criada com sucesso');
      setIsCreatingFolder(false);
      setNewFolderName('');
      fetchFiles();
    } catch (error) {
      toast.error('Erro ao criar pasta');
    }
  };

  const handleMoveFile = async (fileId, targetFolderId) => {
    if (fileId === targetFolderId) return;
    
    try {
      await api.patch(`/api/drive/${fileId}`, { parentId: targetFolderId });
      toast.success('Arquivo movido');
      fetchFiles();
    } catch (error) {
      toast.error('Erro ao mover arquivo');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          {currentFolder && (
            <button 
              onClick={handleGoBack}
              className="p-2.5 bg-white dark:bg-[#1d1d1f] border border-[#d2d2d7] dark:border-[#424245] rounded-xl text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#f5f5f7] dark:hover:bg-[#2d2d2f] transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5 rotate-180" strokeWidth={2} />
            </button>
          )}
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold tracking-tight">Arquivos</h2>
            <div className="flex items-center gap-2 text-sm font-medium text-[#86868b]">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={crumb.id || 'root'}>
                  {i > 0 && <ChevronRight className="w-3 h-3 opacity-40" />}
                  <button 
                    onClick={() => navigateToBreadcrumb(i)}
                    className={cn("hover:text-[#0071e3] transition-colors", i === breadcrumbs.length - 1 && "text-[#1d1d1f] dark:text-[#f5f5f7]")}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-[#f5f5f7] dark:bg-[#1d1d1f] border border-[#d2d2d7] dark:border-[#424245] rounded-xl p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white dark:bg-[#323236] text-[#0071e3] shadow-sm" : "text-[#86868b]")}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white dark:bg-[#323236] text-[#0071e3] shadow-sm" : "text-[#86868b]")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-[#0071e3]/20"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nova Pasta
          </button>
        </div>
      </div>

      <div 
        className={cn(
          "flex-1 bg-white dark:bg-[#1d1d1f] rounded-4xl border border-[#d2d2d7] dark:border-[#424245] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden flex flex-col relative transition-all duration-300",
          isDragActive && "ring-2 ring-[#0071e3] bg-[#0071e3]/5"
        )}
        {...getRootProps()}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedFileId(null);
        }}
      >
        <input {...getInputProps()} />
        {isDragActive && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0071e3]/5 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1d1d1f] p-12 rounded-4xl shadow-2xl text-center border-2 border-dashed border-[#0071e3] animate-in zoom-in-95 duration-200">
              <Upload className="w-12 h-12 text-[#0071e3] mx-auto mb-4 animate-bounce" />
              <p className="text-xl font-bold tracking-tight">Solte para enviar</p>
            </div>
          </div>
        )}

        <div className="p-6 border-b border-[#f5f5f7] dark:border-[#2d2d2f] bg-white/50 dark:bg-[#1d1d1f]/50 glass">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
            <input
              type="text"
              placeholder="Buscar em arquivos..."
              className="w-full pl-10 pr-4 py-2 bg-[#f5f5f7] dark:bg-[#2d2d2f] border-none rounded-full text-sm placeholder:text-[#86868b]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {files.length === 0 && !isCreatingFolder && (
                <div className="flex flex-col items-center justify-center h-64 text-[#86868b]">
                  <div className="w-20 h-20 bg-[#f5f5f7] dark:bg-[#2d2d2f] rounded-4xl flex items-center justify-center mb-6">
                    <Folder className="w-10 h-10 opacity-20" strokeWidth={1} />
                  </div>
                  <p className="text-lg font-medium">Esta pasta está vazia</p>
                </div>
              )}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                  {isCreatingFolder && (
                    <div className="flex flex-col items-center p-6 rounded-3xl bg-[#0071e3]/5 ring-2 ring-[#0071e3] animate-in zoom-in-95 duration-200">
                      <div className="w-20 h-20 rounded-3xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center mb-4">
                        <Folder className="w-10 h-10" strokeWidth={1.5} />
                      </div>
                      <form onSubmit={handleCreateFolder} className="w-full">
                        <input
                          autoFocus
                          type="text"
                          className="w-full bg-transparent border-none p-0 text-sm font-semibold text-center focus:ring-0 placeholder:text-[#86868b]"
                          placeholder="Nome da pasta"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          onBlur={() => !newFolderName && setIsCreatingFolder(false)}
                          onKeyDown={(e) => e.key === 'Escape' && setIsCreatingFolder(false)}
                        />
                      </form>
                    </div>
                  )}
                  {files.map((file) => {
                    const Icon = getFileIcon(file.mimeType);
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                    const isSelected = selectedFileId === file.id;
                    
                    return (
                      <div 
                        key={file.id}
                        draggable
                        onDragStart={(e) => {
                          setDraggedFileId(file.id);
                          e.dataTransfer.setData('text/plain', file.id);
                        }}
                        onDragOver={(e) => {
                          if (isFolder && draggedFileId !== file.id) {
                            e.preventDefault();
                            e.currentTarget.classList.add('bg-[#0071e3]/10', 'scale-105');
                          }
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('bg-[#0071e3]/10', 'scale-105');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('bg-[#0071e3]/10', 'scale-105');
                          const droppedFileId = e.dataTransfer.getData('text/plain');
                          if (isFolder) handleMoveFile(droppedFileId, file.id);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFileId(file.id);
                        }}
                        onDoubleClick={() => isFolder && handleFolderClick(file)}
                        className={cn(
                          "group flex flex-col items-center p-6 rounded-3xl border border-transparent transition-all cursor-pointer relative select-none",
                          isSelected ? "bg-[#0071e3]/10 ring-1 ring-[#0071e3]/30" : "hover:bg-[#f5f5f7] dark:hover:bg-[#2d2d2f]"
                        )}
                      >
                        <div className={cn(
                          "w-20 h-20 rounded-3xl flex items-center justify-center mb-4 transition-all",
                          isFolder ? "bg-[#fef3c7] text-[#d97706]" : "bg-[#f5f5f7] dark:bg-[#323236] text-[#1d1d1f] dark:text-[#f5f5f7]",
                          isSelected && "scale-105"
                        )}>
                          <Icon className="w-10 h-10" strokeWidth={1.5} />
                        </div>
                        <span className={cn(
                          "text-sm font-semibold text-center truncate w-full px-2",
                          isSelected ? "text-[#0071e3]" : "text-[#1d1d1f] dark:text-[#f5f5f7]"
                        )}>{file.name}</span>
                        
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button className="p-1.5 bg-white dark:bg-[#323236] shadow-sm rounded-full text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1">
                  {isCreatingFolder && (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0071e3]/5 ring-1 ring-[#0071e3] animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center shrink-0">
                          <Folder className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <form onSubmit={handleCreateFolder} className="flex-1">
                          <input
                            autoFocus
                            type="text"
                            className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 placeholder:text-[#86868b]"
                            placeholder="Nome da pasta"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onBlur={() => !newFolderName && setIsCreatingFolder(false)}
                            onKeyDown={(e) => e.key === 'Escape' && setIsCreatingFolder(false)}
                          />
                        </form>
                      </div>
                    </div>
                  )}
                  {files.map((file) => {
                    const Icon = getFileIcon(file.mimeType);
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                    
                    return (
                      <div 
                        key={file.id}
                        onDoubleClick={() => isFolder && handleFolderClick(file)}
                        className="group flex items-center justify-between p-4 rounded-2xl hover:bg-[#f5f5f7] dark:hover:bg-[#2d2d2f] transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            isFolder ? "bg-[#fef3c7] text-[#d97706]" : "bg-[#f5f5f7] dark:bg-[#323236] text-[#1d1d1f] dark:text-[#f5f5f7]"
                          )}>
                            <Icon className="w-5 h-5" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{file.name}</p>
                            <p className="text-[11px] font-bold text-[#86868b] uppercase mt-0.5">
                              {isFolder ? 'Pasta' : format(new Date(file.modifiedTime), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-xs font-medium text-[#86868b] hidden md:block">
                            {file.size ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : '--'}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button className="p-2 hover:bg-white dark:hover:bg-[#323236] rounded-full text-[#86868b] transition-all shadow-sm"><Download className="w-4 h-4" /></button>
                            <button className="p-2 hover:bg-white dark:hover:bg-[#323236] rounded-full text-[#86868b] transition-all shadow-sm"><Share2 className="w-4 h-4" /></button>
                            <button className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Drive;
