'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Send, Copy, Trash2, CheckCircle2, Clock,
  Search, Filter, FileText, Briefcase, Calendar,
  AlertCircle, Pencil, FileUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProposalModal } from '@/components/ProposalModal';
import { toast } from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import ProposalPDF from '@/components/ProposalPDF';

export default function PropostasPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);

  useEffect(() => { fetchProposals(); }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const [proposalsRes, configRes] = await Promise.all([
        supabase
          .from('crmmateus_propostas')
          .select(`*, servico:crmmateus_servicos(nome)`)
          .order('created_at', { ascending: false }),
        supabase.from('crmmateus_configuracoes').select('*').limit(1).single()
      ]);
      if (!proposalsRes.error) setProposals(proposalsRes.data || []);
      if (!configRes.error) setConfig(configRes.data);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (p: any) => {
    try {
      setGeneratingPdf(p.id);
      const blob = await pdf(<ProposalPDF proposal={p} organization={config} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `proposta_${p.cliente_nome}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF gerado com sucesso!');
    } catch (err) {
      toast.error('Erro ao gerar PDF');
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta proposta?')) return;
    try {
      const { error } = await supabase.from('crmmateus_propostas').delete().eq('id', id);
      if (error) throw error;
      toast.success('Proposta removida');
      fetchProposals();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const filteredProposals = proposals.filter(p =>
    (p.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.servico?.nome?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filterStatus || p.status === filterStatus)
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Aceita':   return { bg: 'bg-emerald-50',  text: 'text-emerald-600',  border: 'border-emerald-100',  dot: 'bg-emerald-500', iconBg: 'bg-emerald-500', iconText: 'text-white', shadow: 'shadow-emerald-500/30'  };
      case 'Enviada':  return { bg: 'bg-blue-50',     text: 'text-blue-600',     border: 'border-blue-100',     dot: 'bg-blue-500', iconBg: 'bg-blue-500', iconText: 'text-white', shadow: 'shadow-blue-500/30'     };
      case 'Recusada': return { bg: 'bg-red-50',      text: 'text-red-600',      border: 'border-red-100',      dot: 'bg-red-500', iconBg: 'bg-red-500', iconText: 'text-white', shadow: 'shadow-red-500/30'      };
      default:         return { bg: 'bg-gray-50',     text: 'text-gray-500',     border: 'border-gray-100',     dot: 'bg-gray-400', iconBg: 'bg-gray-500', iconText: 'text-white', shadow: 'shadow-gray-500/30'     };
    }
  };

  const statusOptions = ['Todos', 'Rascunho', 'Enviada', 'Aceita', 'Recusada'];

  return (
    <div className="space-y-6 pb-12">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-[#111118] via-[#111118] to-[#52525B]">
            Propostas
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Crie e gerencie ofertas comerciais profissionais.</p>
        </div>
        <button
          onClick={() => { setSelectedProposal(null); setIsModalOpen(true); }}
          className="bg-[#1C1C1E] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nova Proposta
        </button>
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente ou serviço..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-sm font-medium text-[#111118] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1C1C1E]/10 focus:border-gray-400 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilter(p => !p)}
            className={cn(
              'flex items-center gap-2 px-5 py-3.5 rounded-2xl border text-sm font-bold transition-all',
              showFilter || filterStatus
                ? 'bg-[#1C1C1E] text-white border-[#1C1C1E]'
                : 'bg-white border-gray-200 text-[#111118] hover:bg-gray-50'
            )}
          >
            <Filter className="w-4 h-4" />
            Filtros{filterStatus ? ` · ${filterStatus}` : ''}
          </button>
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 right-0 bg-white border border-gray-100 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-2 z-50 flex flex-col gap-1 w-48"
              >
                {statusOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => { setFilterStatus(s === 'Todos' ? null : s); setShowFilter(false); }}
                    className={cn(
                      'text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all',
                      filterStatus === s || (s === 'Todos' && !filterStatus)
                        ? 'bg-[#111118] text-white'
                        : 'hover:bg-gray-50 text-gray-600'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Grid de Propostas ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-56 bg-white rounded-[24px] animate-pulse border border-gray-100" />
          ))
        ) : filteredProposals.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[24px] border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-[20px] flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <FileText className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-gray-400">Nenhuma proposta encontrada</p>
          </div>
        ) : (
          filteredProposals.map((p, i) => {
            const st = getStatusConfig(p.status);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-gray-200 hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-all duration-300 group relative flex flex-col"
              >
                {/* Top row: icon + status */}
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-transform duration-300 group-hover:scale-110", st.iconBg, st.iconText, st.shadow)}>
                    <Send className="w-4 h-4" />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5",
                    st.bg, st.text, st.border
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
                    {p.status}
                  </span>
                </div>

                {/* Client / service */}
                <div className="mb-4">
                  <h3 className="font-bold text-base text-[#111118] leading-tight tracking-tight mb-1 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
                    {p.cliente_nome}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-black uppercase tracking-widest">
                    <Briefcase className="w-3 h-3 shrink-0" />
                    <span className="truncate">{p.servico?.nome || 'Serviço Personalizado'}</span>
                  </div>
                </div>

                {/* Value / validity */}
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-end justify-between mb-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Valor</p>
                    <p className="text-lg font-bold text-[#111118] tracking-tight">
                      R$ {p.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Válida até</p>
                    <p className="text-sm font-bold text-[#111118] flex items-center gap-1 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {format(new Date(p.data_validade), 'dd/MM/yy')}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/proposta/${p.id}`;
                      navigator.clipboard.writeText(link)
                        .then(() => toast.success('Link copiado!'))
                        .catch(() => toast.error('Erro ao copiar link'));
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:bg-[#111118] hover:text-white hover:border-[#111118] transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copiar Link
                  </button>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                    <button
                      onClick={() => handleDownloadPDF(p)}
                      disabled={generatingPdf === p.id}
                      title="Exportar PDF"
                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all disabled:opacity-50"
                    >
                      {generatingPdf === p.id
                        ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        : <FileUp className="w-3.5 h-3.5" />
                      }
                    </button>
                    <button
                      onClick={() => { setSelectedProposal(p); setIsModalOpen(true); }}
                      title="Editar"
                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      title="Excluir"
                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
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
