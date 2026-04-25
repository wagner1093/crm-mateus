'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, MoreHorizontal, User, Phone, Mail, 
  Calendar, CheckCircle2, Clock, AlertCircle, Plus,
  Download, ExternalLink, ChevronRight, Trash2, Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClientModal } from '@/components/ClientModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { toast } from 'react-hot-toast';

export default function ClientesClient() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crmmateus_clientes')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const performDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('crmmateus_clientes').delete().eq('id', id);
      if (error) throw error;
      toast.success('Cliente excluído');
      fetchClients();
    } catch (err) {
      toast.error('Erro ao excluir');
    }
  };

  const filteredClients = clients.filter(c =>
    (c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filterStatus || c.status === filterStatus)
  );

  const handleDownloadCSV = () => {
    const rows = [
      ['Nome', 'E-mail', 'WhatsApp', 'Status', 'Recorrência', 'Desde'],
      ...clients.map(c => [
        c.nome,
        c.email || '',
        c.whatsapp || '',
        c.status || '',
        c.valor_recorrente?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0',
        format(new Date(c.created_at), 'dd/MM/yyyy', { locale: ptBR })
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado com sucesso!');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-400 bg-clip-text text-transparent font-heading">
            Clientes
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">Gerencie sua base de clientes ativos e recorrentes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownloadCSV} className="p-3 rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-500 hover:text-primary transition-all" title="Exportar CSV">
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={() => { setSelectedClient(null); setIsModalOpen(true); }}
            className="bg-[#1C1C1E] text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl border border-white/20">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por nome, e-mail ou WhatsApp..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilter(p => !p)}
            className={cn('flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-bold transition-all shadow-sm', showFilter || filterStatus ? 'bg-primary text-white border-primary' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50')}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros {filterStatus ? `(${filterStatus})` : ''}</span>
          </button>
          {showFilter && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50 flex flex-col gap-1 w-44">
              {['Todos', 'Ativo', 'Inativo'].map(s => (
                <button
                  key={s}
                  onClick={() => { setFilterStatus(s === 'Todos' ? null : s); setShowFilter(false); }}
                  className={cn('text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all', filterStatus === s || (s === 'Todos' && !filterStatus) ? 'bg-gray-900 text-white' : 'hover:bg-gray-50 text-gray-600')}
                >{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[40px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cliente</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Serviços</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Recorrência</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Desde</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-10 h-20 bg-gray-50/30"></td>
                  </tr>
                ))
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-gray-200" />
                    </div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Nenhum cliente encontrado</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary flex items-center justify-center font-black text-lg shadow-sm">
                          {client.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-base text-gray-900">{client.nome}</p>
                          <p className="text-xs text-muted-foreground font-medium">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5">
                        {client.servicos_contratados?.length > 0 ? client.servicos_contratados.map((s: string) => (
                          <span key={s} className="px-3 py-1 rounded-lg bg-indigo-50 text-[10px] font-black text-indigo-500 uppercase tracking-wider">
                            {s}
                          </span>
                        )) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase italic">Nenhum serviço</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5",
                        client.status === 'Ativo' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", client.status === 'Ativo' ? "bg-green-500" : "bg-red-500")} />
                        {client.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-base text-gray-900">
                        R$ {client.valor_recorrente?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">mensal</p>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-400">
                      {format(new Date(client.created_at), 'dd MMM yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => { setSelectedClient(client); setIsModalOpen(true); }}
                          className="p-2.5 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)}
                          className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }} 
        onSuccess={fetchClients}
        client={selectedClient}
      />

      <ConfirmModal 
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && performDelete(deleteConfirmId)}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente? Esta ação removerá permanentemente todos os dados e o histórico associados."
        confirmText="Excluir Cliente"
        variant="danger"
      />
    </div>
  );
}
