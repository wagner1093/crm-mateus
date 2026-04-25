'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Plus, Search, X, Check, Trash2, Pencil
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { ConfirmModal } from '@/components/ConfirmModal';
import { toast } from 'react-hot-toast';

type Service = {
  id: string;
  nome: string;
  categoria: string;
  preco_padrao: number;
  tipo_cobranca: string;
  descricao: string | null;
  cor: string;
  created_at: string;
};

const CATEGORIES = ['Todos', 'Marketing', 'Desenvolvimento', 'Design', 'Infraestrutura', 'Outros'];
const COBRANCA_OPTS = ['Único', 'Mensal', 'Anual', 'Variável'];
const COLORS = [
  { name: 'Azul',     hex: '#3B82F6' },
  { name: 'Índigo',   hex: '#6366F1' },
  { name: 'Roxo',     hex: '#8B5CF6' },
  { name: 'Rosa',     hex: '#EC4899' },
  { name: 'Vermelho', hex: '#EF4444' },
  { name: 'Âmbar',   hex: '#F59E0B' },
  { name: 'Verde',    hex: '#10B981' },
  { name: 'Grafite',  hex: '#52525B' },
];

const BILLING_COLORS: Record<string, string> = {
  'Mensal':   'bg-blue-50 text-blue-600',
  'Anual':    'bg-violet-50 text-violet-600',
  'Único':    'bg-zinc-100 text-zinc-600',
  'Variável': 'bg-amber-50 text-amber-700',
};

export default function ServicosClient() {
  const [servicos, setServicos] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => { fetchServicos(); }, []);

  const fetchServicos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('crmmateus_servicos').select('*').order('nome');
      if (error) throw error;
      setServicos(data || []);
    } catch (err) {
      toast.error('Erro ao carregar serviços.');
    } finally {
      setLoading(false);
    }
  };

  const filteredServicos = useMemo(() => servicos.filter(s => {
    const matchCat = selectedCategory === 'Todos' || s.categoria === selectedCategory;
    const matchSearch = s.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.descricao?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  }), [servicos, selectedCategory, searchQuery]);

  const handleOpenModal = (service?: Service) => {
    setEditingService(service ?? null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const performDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('crmmateus_servicos').delete().eq('id', id);
      if (error) throw error;
      toast.success('Serviço excluído!');
      fetchServicos();
    } catch (err) {
      toast.error('Erro ao excluir serviço.');
    }
  };

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-gray-900 tracking-tight font-heading">Serviços</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Portfólio de ofertas e precificação.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#1C1C1E] text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Novo serviço
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-[13px] font-bold whitespace-nowrap transition-all",
                selectedCategory === c
                  ? "bg-[#111118] text-white shadow-lg shadow-black/10"
                  : "bg-[#F8F9FA] text-gray-500 hover:bg-gray-100"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative shrink-0 w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar serviço..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
          />
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl skeleton" />
          ))
        ) : filteredServicos.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5 text-zinc-300" />
            </div>
            <p className="text-sm font-semibold text-zinc-400">Nenhum serviço encontrado</p>
            <p className="text-xs text-zinc-300 mt-1">Ajuste os filtros ou cadastre um novo serviço</p>
          </div>
        ) : (
          filteredServicos.map((s, i) => (
            <motion.div
              layout
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="group relative bg-white rounded-[32px] p-7 border border-gray-100 hover:border-blue-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all flex flex-col h-full overflow-hidden"
            >
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all z-10">
                <button
                  onClick={() => handleOpenModal(s)}
                  className="w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Icon + meta */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-inherit/20"
                  style={{ backgroundColor: s.cor }}
                >
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none mb-1.5">
                    {s.categoria}
                  </span>
                  <h3 className="text-[17px] font-bold text-gray-900 tracking-tight leading-snug truncate">
                    {s.nome}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-3 flex-1 mb-6">
                {s.descricao || 'Sem descrição cadastrada.'}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">base</span>
                  <span className="text-xl font-black text-gray-900 tracking-tight">
                    R$ {s.preco_padrao.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                </div>
                <span className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest",
                  BILLING_COLORS[s.tipo_cobranca] ?? 'bg-gray-100 text-gray-500'
                )}>
                  {s.tipo_cobranca}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <ServiceModal 
            onClose={() => {
              setIsModalOpen(false);
              setEditingService(null);
            }} 
            onSuccess={fetchServicos}
            service={editingService}
          />
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && performDelete(deleteConfirmId)}
        title="Excluir Serviço"
        message="Tem certeza que deseja excluir este serviço? Esta ação removerá o serviço do catálogo permanentemente."
        confirmText="Excluir Serviço"
        variant="danger"
      />
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────

function ServiceModal({ service, onClose, onSuccess }: {
  service: Service | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome:          service?.nome          || '',
    categoria:     service?.categoria     || 'Marketing',
    preco_padrao:  service?.preco_padrao  || 0,
    tipo_cobranca: service?.tipo_cobranca || 'Mensal',
    descricao:     service?.descricao     || '',
    cor:           service?.cor           || COLORS[0].hex,
  });
  const [displayPrice, setDisplayPrice] = useState(
    service?.preco_padrao ? `R$ ${service.preco_padrao.toLocaleString('pt-BR')}` : ''
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handlePriceInput = (val: string) => {
    const raw = val.replace(/\D/g, '');
    const num = parseInt(raw || '0', 10);
    setForm(f => ({ ...f, preco_padrao: num }));
    setDisplayPrice(num > 0 ? `R$ ${num.toLocaleString('pt-BR')}` : '');
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.nome) return toast.error('Nome é obrigatório');
    setLoading(true);
    try {
      if (service) {
        const { error } = await supabase.from('crmmateus_servicos').update(form).eq('id', service.id);
        if (error) throw error;
        toast.success('Serviço atualizado.');
      } else {
        const { error } = await supabase.from('crmmateus_servicos').insert([form]);
        if (error) throw error;
        toast.success('Serviço criado.');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar serviço.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-[4px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[520px] bg-white rounded-[32px] shadow-2xl z-[10000] flex flex-col overflow-hidden border border-gray-100"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              {service ? 'Editar serviço' : 'Novo serviço'}
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Configure as propriedades deste serviço.</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="px-8 py-7 overflow-y-auto custom-scrollbar space-y-6">

          {/* Nome */}
          <div>
            <label className="text-[13px] font-bold text-[#64748B] mb-2 block font-dmsans uppercase tracking-wide">Nome do serviço</label>
            <input
              required
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-dmsans placeholder:text-gray-400"
              placeholder="Ex: Gestão de Tráfego Pago"
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            />
          </div>

          {/* Row: Categoria + Cobrança */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-bold text-[#64748B] mb-2 block font-dmsans uppercase tracking-wide">Categoria</label>
              <select
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-dmsans appearance-none cursor-pointer"
                value={form.categoria}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
              >
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[13px] font-bold text-[#64748B] mb-2 block font-dmsans uppercase tracking-wide">Cobrança</label>
              <select
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-dmsans appearance-none cursor-pointer"
                value={form.tipo_cobranca}
                onChange={e => setForm(f => ({ ...f, tipo_cobranca: e.target.value }))}
              >
                {COBRANCA_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Preço */}
          <div>
            <label className="text-[13px] font-bold text-[#64748B] mb-2 block font-dmsans uppercase tracking-wide">Preço base</label>
            <input
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-dmsans placeholder:text-gray-400"
              placeholder="R$ 0"
              value={displayPrice}
              onChange={e => handlePriceInput(e.target.value)}
            />
          </div>

          {/* Cor */}
          <div>
            <label className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2 block ml-1">Cor de identificação</label>
            <div className="flex gap-3 pt-1">
              {COLORS.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => setForm(f => ({ ...f, cor: c.hex }))}
                  className={cn(
                    "w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center",
                    form.cor === c.hex
                      ? "border-gray-900 scale-110 shadow-lg shadow-inherit/20"
                      : "border-transparent opacity-40 hover:opacity-100"
                  )}
                  style={{ backgroundColor: c.hex }}
                >
                  {form.cor === c.hex && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-[13px] font-bold text-[#64748B] mb-2 block font-dmsans uppercase tracking-wide">Descrição</label>
            <textarea
              rows={4}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-dmsans placeholder:text-gray-400 resize-none"
              placeholder="Descreva o que está incluso no serviço..."
              value={form.descricao || ''}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 text-gray-600 text-sm font-bold hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] px-6 py-4 rounded-2xl bg-[#111118] text-white text-sm font-bold hover:bg-black shadow-xl shadow-black/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{service ? 'Salvar alterações' : 'Criar serviço'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}
