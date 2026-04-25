'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, Trash2, Pencil, X, Save,
  CheckCircle2, Clock, XCircle, AlertCircle, Calendar,
  DollarSign, User, Briefcase, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  'Ativo':      { label: 'Ativo',      color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 },
  'Aguardando': { label: 'Aguardando', color: 'bg-amber-50 text-amber-600 border-amber-100',       icon: Clock },
  'Encerrado':  { label: 'Encerrado',  color: 'bg-gray-100 text-gray-500 border-gray-200',         icon: XCircle },
  'Cancelado':  { label: 'Cancelado',  color: 'bg-rose-50 text-rose-600 border-rose-100',          icon: XCircle },
};

const AVAILABLE_SERVICES = ['Tráfego Pago', 'Social Mídia', 'Criação de Site', 'Criação de Sistema', 'Hospedagem', 'Consultoria'];

interface Contrato {
  id: string;
  titulo: string;
  cliente_id?: string;
  cliente_nome?: string;
  servicos: string[];
  valor: number;
  data_inicio?: string;
  data_fim?: string;
  status: string;
  observacoes?: string;
  created_at: string;
}

const EMPTY_FORM = {
  titulo: '',
  cliente_nome: '',
  servicos: [] as string[],
  valor: 0,
  data_inicio: '',
  data_fim: '',
  status: 'Ativo',
  observacoes: ''
};

export default function ContratosPage() {
  const [contracts, setContracts] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contrato | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contrato | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [displayValue, setDisplayValue] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crmmateus_contratos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setContracts(data || []);
    } catch (err) {
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContracts(); }, []);

  const openCreate = () => {
    setSelectedContract(null);
    setFormData(EMPTY_FORM);
    setDisplayValue('');
    setIsModalOpen(true);
  };

  const openEdit = (c: Contrato) => {
    setSelectedContract(c);
    setFormData({
      titulo: c.titulo,
      cliente_nome: c.cliente_nome || '',
      servicos: c.servicos || [],
      valor: c.valor,
      data_inicio: c.data_inicio || '',
      data_fim: c.data_fim || '',
      status: c.status,
      observacoes: c.observacoes || ''
    });
    setDisplayValue(c.valor > 0 ? `R$ ${c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '');
    setIsModalOpen(true);
  };

  const handleCurrencyInput = (val: string) => {
    const raw = val.replace(/\D/g, '');
    const num = parseInt(raw || '0', 10) / 100;
    setFormData(f => ({ ...f, valor: num }));
    setDisplayValue(num > 0 ? `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.cliente_nome) {
      toast.error('Título e Cliente são obrigatórios');
      return;
    }
    setSaving(true);
    try {
      if (selectedContract) {
        const { error } = await supabase
          .from('crmmateus_contratos')
          .update(formData)
          .eq('id', selectedContract.id);
        if (error) throw error;
        toast.success('Contrato atualizado!');
      } else {
        const { error } = await supabase
          .from('crmmateus_contratos')
          .insert([formData]);
        if (error) throw error;
        toast.success('Contrato criado!');
      }
      setIsModalOpen(false);
      fetchContracts();
    } catch (err) {
      toast.error('Erro ao salvar contrato');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Contrato) => {
    try {
      const { error } = await supabase.from('crmmateus_contratos').delete().eq('id', c.id);
      if (error) throw error;
      toast.success('Contrato excluído');
      setDeleteTarget(null);
      fetchContracts();
    } catch {
      toast.error('Erro ao excluir contrato');
    }
  };

  const filtered = contracts.filter(c =>
    c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.cliente_nome || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: contracts.length,
    ativos: contracts.filter(c => c.status === 'Ativo').length,
    encerrados: contracts.filter(c => c.status === 'Encerrado').length,
    valorTotal: contracts.filter(c => c.status === 'Ativo').reduce((a, c) => a + c.valor, 0)
  };

  const lbl = "text-[13px] font-bold text-[#64748B] mb-2 block font-dmsans uppercase tracking-wide";
  const inI = "w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-dmsans placeholder:text-gray-400";

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-400 bg-clip-text text-transparent font-heading">
            Contratos
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">Gestão completa dos contratos de serviço.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1C1C1E] text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Contrato</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Contratos', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-50', border: 'border-gray-100' },
          { label: 'Contratos Ativos', value: stats.ativos, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Encerrados', value: stats.encerrados, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' },
          { label: 'Receita Mensal', value: `R$ ${stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${s.bg} border ${s.border} rounded-[28px] p-6`}
          >
            <p className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-2">{s.label}</p>
            <p className={`text-2xl font-black ${s.color} tracking-tight`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título ou cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Documentos</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold text-sm">Nenhum contrato encontrado</p>
            <p className="text-gray-300 text-xs mt-1">Clique em "Novo Contrato" para começar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => {
              const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG['Ativo'];
              const StatusIcon = statusCfg.icon;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group flex items-center justify-between p-5 rounded-[24px] border border-transparent hover:border-blue-50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 tracking-tight">{c.titulo}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[12px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                          <User className="w-3 h-3" /> {c.cliente_nome || '—'}
                        </span>
                        {c.servicos?.length > 0 && (
                          <span className="text-[12px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> {c.servicos.slice(0, 2).join(', ')}{c.servicos.length > 2 ? ` +${c.servicos.length - 2}` : ''}
                          </span>
                        )}
                        {c.data_fim && (
                          <span className="text-[12px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> até {format(new Date(c.data_fim), 'dd/MM/yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-sm font-black text-gray-900 tabular-nums">
                      R$ {c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-black uppercase tracking-widest', statusCfg.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[640px] bg-white shadow-2xl rounded-[40px] overflow-hidden z-[10000] flex flex-col p-2"
              style={{ maxHeight: '95vh' }}
            >
              <div className="px-10 py-10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                      {selectedContract ? 'Editar Contrato' : 'Novo Contrato'}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">Preencha os dados do contrato.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="px-10 pb-10 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className={lbl}>Título do Contrato *</label>
                    <input
                      required type="text"
                      placeholder="Ex: Contrato de Gestão de Tráfego"
                      className={inI}
                      value={formData.titulo}
                      onChange={e => setFormData(f => ({ ...f, titulo: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className={lbl}>Cliente *</label>
                    <input
                      required type="text"
                      placeholder="Nome do cliente"
                      className={inI}
                      value={formData.cliente_nome}
                      onChange={e => setFormData(f => ({ ...f, cliente_nome: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className={lbl}>Valor Mensal (R$)</label>
                    <input
                      type="text"
                      placeholder="R$ 0,00"
                      className={inI}
                      value={displayValue}
                      onChange={e => handleCurrencyInput(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={lbl}>Data Início</label>
                    <input
                      type="date"
                      className={inI}
                      value={formData.data_inicio}
                      onChange={e => setFormData(f => ({ ...f, data_inicio: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className={lbl}>Data Fim</label>
                    <input
                      type="date"
                      className={inI}
                      value={formData.data_fim}
                      onChange={e => setFormData(f => ({ ...f, data_fim: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={lbl}>Status</label>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <button
                          key={key} type="button"
                          onClick={() => setFormData(f => ({ ...f, status: key }))}
                          className={cn(
                            'py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-1.5',
                            formData.status === key ? cfg.color : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'
                          )}
                        >
                          <cfg.icon className="w-3 h-3" />
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={lbl}>Serviços</label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_SERVICES.map(s => (
                        <button
                          key={s} type="button"
                          onClick={() => {
                            const curr = formData.servicos;
                            const next = curr.includes(s) ? curr.filter(x => x !== s) : [...curr, s];
                            setFormData(f => ({ ...f, servicos: next }));
                          }}
                          className={cn(
                            'px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest border transition-all',
                            formData.servicos.includes(s)
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={lbl}>Observações</label>
                    <textarea
                      rows={3}
                      className={inI + ' resize-none'}
                      placeholder="Notas sobre o contrato..."
                      value={formData.observacoes}
                      onChange={e => setFormData(f => ({ ...f, observacoes: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-600 text-[12px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit" disabled={saving}
                    className="flex-1 py-4 rounded-2xl bg-gray-900 text-white text-[12px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><Save className="w-4 h-4" /> Salvar</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-[32px] p-10 w-full max-w-md z-[10000] text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Excluir Contrato</h3>
              <p className="text-gray-400 text-sm mb-8">Deseja realmente excluir <strong className="text-gray-700">{deleteTarget.titulo}</strong>? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-600 text-[12px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget)}
                  className="flex-1 py-4 rounded-2xl bg-rose-500 text-white text-[12px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
