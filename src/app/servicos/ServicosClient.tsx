'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Plus, Search, MoreHorizontal, 
  Settings, Layers, Zap, Globe, Shield, Tag,
  X, Check, DollarSign, Type, FileText, Palette,
  Trash2, AlertCircle, Save, CheckCircle2, Pencil
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
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
  { name: 'Azul', hex: '#3B82F6' },
  { name: 'Índigo', hex: '#6366F1' },
  { name: 'Roxo', hex: '#8B5CF6' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Vermelho', hex: '#EF4444' },
  { name: 'Laranja', hex: '#F59E0B' },
  { name: 'Verde', hex: '#10B981' },
  { name: 'Grafite', hex: '#4B5563' },
];

export default function ServicosClient() {
  const [servicos, setServicos] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    fetchServicos();
  }, []);

  const fetchServicos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crmmateus_servicos')
        .select('*')
        .order('nome');
      if (error) throw error;
      setServicos(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar serviços.');
    } finally {
      setLoading(false);
    }
  };

  const filteredServicos = useMemo(() => {
    return servicos.filter(s => {
      const matchesCategory = selectedCategory === 'Todos' || s.categoria === selectedCategory;
      const matchesSearch = s.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           s.descricao?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [servicos, selectedCategory, searchQuery]);

  const handleOpenModal = (service?: Service) => {
    if (service) setEditingService(service);
    else setEditingService(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    
    try {
      const { error } = await supabase.from('crmmateus_servicos').delete().eq('id', id);
      if (error) throw error;
      toast.success('Serviço excluído com sucesso!');
      fetchServicos();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir serviço.');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-400 bg-clip-text text-transparent font-heading">
            Catálogo de Serviços
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">Gerencie seu portfólio de ofertas e precificação estratégica.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-gray-900 hover:bg-black text-white px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-gray-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Serviço</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/50 p-2 rounded-[2.5rem] border border-gray-100/50 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={cn(
                "px-7 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
                selectedCategory === c 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                  : "bg-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-xs px-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Buscar serviços..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] border-none bg-gray-50/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-bold placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 bg-white border border-gray-50 rounded-[3rem] animate-pulse shadow-sm" />
          ))
        ) : filteredServicos.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white border border-dashed border-gray-200 rounded-[3rem]">
            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
              <Briefcase className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-1 font-heading">Nenhum serviço encontrado</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Tente ajustar seus filtros ou cadastre um novo serviço.</p>
          </div>
        ) : (
          filteredServicos.map((servico, i) => (
            <motion.div
              key={servico.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-gray-100 rounded-[3rem] p-9 flex flex-col h-full hover:shadow-[0_30px_80px_rgba(0,0,0,0.08)] hover:translate-y-[-8px] transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <button 
                  onClick={() => handleOpenModal(servico)}
                  className="w-11 h-11 rounded-2xl bg-white shadow-lg text-gray-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(servico.id)}
                  className="w-11 h-11 rounded-2xl bg-white shadow-lg text-gray-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all active:scale-90"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-6 mb-8">
                <div 
                  className="w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-transform duration-500 group-hover:rotate-[10deg] group-hover:scale-110"
                  style={{ backgroundColor: servico.cor, boxShadow: `${servico.cor}44 0px 12px 24px` }}
                >
                  <Briefcase className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-1 block">{servico.categoria}</span>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tighter font-heading leading-tight">{servico.nome}</h3>
                </div>
              </div>

              <p className="text-sm text-gray-400 font-bold leading-relaxed mb-10 flex-1 line-clamp-3">
                {servico.descricao || 'Sem descrição cadastrada para este serviço.'}
              </p>

              <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1.5">Investimento Base</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">
                    <span className="text-sm font-bold text-gray-400 mr-1.5 italic">R$</span>
                    {servico.preco_padrao.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-gray-900 text-white px-5 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gray-200">
                  {servico.tipo_cobranca}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ServiceModal 
            service={editingService} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false);
              fetchServicos();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Modal Component (Standardized) ───────────────────────────────────────────

function ServiceModal({ service, onClose, onSuccess }: { service: Service | null, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: service?.nome || '',
    categoria: service?.categoria || 'Marketing',
    preco_padrao: service?.preco_padrao || 0,
    tipo_cobranca: service?.tipo_cobranca || 'Único',
    descricao: service?.descricao || '',
    cor: service?.cor || COLORS[0].hex
  });

  const [displayPrice, setDisplayPrice] = useState(service?.preco_padrao ? `R$ ${service.preco_padrao.toLocaleString('pt-BR')}` : '');

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
        toast.success('Serviço atualizado!');
      } else {
        const { error } = await supabase.from('crmmateus_servicos').insert([form]);
        if (error) throw error;
        toast.success('Serviço criado!');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar serviço.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const lbl = "text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 block ml-1";
  const inI = "w-full px-5 py-4 rounded-2xl bg-gray-50 border-none text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500/10 focus:bg-white outline-none transition-all placeholder:text-gray-300";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} 
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[640px] bg-white shadow-2xl rounded-[40px] overflow-hidden z-[10000] flex flex-col p-2"
        style={{ maxHeight: '95vh' }}
      >
        {/* Header */}
        <div className="px-10 py-10 flex items-center justify-between bg-white">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {service ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <p className="text-sm text-gray-400 font-medium mt-1">Configure as opções deste serviço.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="px-10 pb-10 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className={lbl}>Nome do Serviço</label>
              <input 
                required
                className={inI} placeholder="Ex: Gestão de Tráfego Performance" 
                value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              />
            </div>

            {/* Categoria */}
            <div>
              <label className={lbl}>Categoria</label>
              <select 
                className={inI + " appearance-none cursor-pointer"}
                value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
              >
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Tipo de Cobrança */}
            <div>
              <label className={lbl}>Modelo de Cobrança</label>
              <select 
                className={inI + " appearance-none cursor-pointer"}
                value={form.tipo_cobranca} onChange={e => setForm(f => ({ ...f, tipo_cobranca: e.target.value }))}
              >
                {COBRANCA_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Preço */}
            <div>
              <label className={lbl}>Preço Base (R$)</label>
              <input 
                className={inI} placeholder="R$ 0,00" 
                value={displayPrice} onChange={e => handlePriceInput(e.target.value)}
              />
            </div>

            {/* Cor */}
            <div>
              <label className={lbl}>Cor de Identificação</label>
              <div className="flex flex-wrap gap-2 py-1">
                {COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, cor: c.hex }))}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all hover:scale-110",
                      form.cor === c.hex ? "border-gray-900 scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <label className={lbl}>Descrição do Serviço</label>
              <textarea 
                rows={4}
                className={inI + " min-h-[120px] py-3 resize-none"} 
                placeholder="Descreva o que está incluso e os principais detalhes do serviço..."
                value={form.descricao || ''} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-10">
            <button 
              type="button"
              onClick={onClose}
              className="px-10 py-5 rounded-[24px] bg-gray-50 text-gray-500 text-[13px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-10 py-5 rounded-[24px] bg-[#007AFF] text-white text-[13px] font-bold uppercase tracking-widest hover:bg-[#0066EE] shadow-xl shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-50 flex-[2] flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>{service ? 'Salvar Alterações' : 'Criar Serviço'}</span>
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
