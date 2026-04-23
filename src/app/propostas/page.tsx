'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Send, Copy, Trash2, CheckCircle2, Clock, 
  Search, Filter, FileText, ExternalLink, MoreHorizontal,
  Briefcase, DollarSign, Calendar, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProposalModal } from '@/components/ProposalModal';
import { toast } from 'react-hot-toast';

export default function PropostasPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crmmateus_propostas')
        .select(`
          *,
          servico:crmmateus_servicos(nome)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, we might get an error. 
        // For now, let's just handle it gracefully.
        console.error('Error fetching proposals:', error);
        setProposals([]);
      } else {
        setProposals(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta proposta?')) return;
    try {
      const { error } = await supabase.from('crmmateus_propostas').delete().eq('id', id);
      if (error) throw error;
      toast.success('Proposta removida');
      fetchProposals();
    } catch (err) {
      toast.error('Erro ao excluir');
    }
  };

  const filteredProposals = proposals.filter(p => 
    p.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.servico?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Aceita': return 'bg-green-50 text-green-600 border-green-100';
      case 'Enviada': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Recusada': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-400 bg-clip-text text-transparent font-heading">
            Propostas
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">Crie e gerencie ofertas comerciais profissionais.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setSelectedProposal(null); setIsModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Proposta</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl border border-white/20">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou serviço..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-none text-sm focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-[3rem] animate-pulse border border-gray-100" />
          ))
        ) : filteredProposals.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Nenhuma proposta encontrada</p>
          </div>
        ) : (
          filteredProposals.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 group relative flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <Send className="w-6 h-6" />
                </div>
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2",
                  getStatusStyles(p.status)
                )}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  {p.status}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-black text-xl text-gray-900 leading-tight mb-1 font-heading group-hover:text-indigo-600 transition-colors">
                  {p.cliente_nome}
                </h3>
                <div className="flex items-center gap-2 text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5" />
                  {p.servico?.nome || 'Serviço Personalizado'}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-50 flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Valor da Proposta</p>
                  <p className="text-2xl font-black text-gray-900">
                    R$ {p.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Válida até</p>
                  <p className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5 justify-end">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    {format(new Date(p.data_validade), 'dd/MM/yy')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-8">
                <button className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" /> Copiar Link
                </button>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <button 
                    onClick={() => { setSelectedProposal(p); setIsModalOpen(true); }}
                    className="p-4 rounded-2xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <ProposalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchProposals} 
        proposal={selectedProposal}
      />
    </div>
  );
}

function Pencil(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}
