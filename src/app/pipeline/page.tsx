'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, AlignJustify, SlidersHorizontal, Pencil, Trash2, X, Check, Phone, FileText, DollarSign, User, Flame, Zap, Snowflake, PenLine, Mail, AlignLeft, Bell, Calendar, CreditCard, AlertTriangle, MessageSquare, Save, Briefcase, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeadModal } from '@/components/LeadModal';
import { supabase } from '@/lib/supabase';
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors,
  closestCorners, useDroppable,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'react-hot-toast';

// ── Types ────────────────────────────────────────────────────────────────────
type Lead = {
  id: string; nome: string; etapa: string; temperatura: string;
  valor_estimado: number | null; origem_proposta: string | null;
  servico_interesse: string[] | null; created_at: string;
  contato?: string | null;
  email?: string | null;
  origem_lead?: string | null;
  observacoes?: string | null;
  forma_pagamento?: string | null;
  urgencia?: string | null;
  observacoes_negocio?: string | null;
  followup_data?: string | null;
  followup_intervalo?: number | null;
  followup_tipo?: string | null;
  followup_notas?: string | null;
};
type Col = { id: string; title: string; color: string };

// ── Constants ────────────────────────────────────────────────────────────────
const COLUMNS: Col[] = [
  { id: 'Prospecção',   title: 'Prospecção',      color: '#6B7280' },
  { id: 'Qualificação', title: 'Qualificação',     color: '#3B82F6' },
  { id: 'Proposta',     title: 'Proposta',         color: '#8B5CF6' },
  { id: 'Negociação',   title: 'Negociação',       color: '#F59E0B' },
  { id: 'Fechado',      title: 'Fechado',          color: '#10B981' },
  { id: 'Perdido',      title: 'Perdido',          color: '#EF4444' },
];

const fmt = (v: number | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v ?? 0);

// ── Status badge ─────────────────────────────────────────────────────────────
function Badge({ t }: { t: string }) {
  const map: Record<string, { cls: string; Icon: typeof Flame }> = {
    Quente: { cls: 'bg-red-50 text-red-500 border border-red-200', Icon: Flame },
    Morno:  { cls: 'bg-amber-50 text-amber-500 border border-amber-200', Icon: Zap },
    Frio:   { cls: 'bg-blue-50 text-blue-500 border border-blue-200', Icon: Snowflake },
  };
  const entry = map[t] ?? { cls: 'bg-gray-100 text-gray-500 border border-gray-200', Icon: Zap };
  return (
    <span className={cn('flex items-center gap-1 font-semibold rounded-full text-[12px] px-3 py-1.5', entry.cls)}>
      <entry.Icon className="w-3 h-3" />
      {t}
    </span>
  );
}

let SERVICE_OPTIONS_STATIC = [
  'Tráfego Pago', 'Criação de Site', 'Criação de Sistema',
  'Social Media', 'SEO', 'Design Gráfico', 'Consultoria', 'E-commerce',
];

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

// ── Card body (shared by sortable + overlay) ──────────────────────────────────
function CardBody({ lead, onEdit, onDelete }: { lead: Lead; onEdit?: () => void; onDelete?: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  const services = lead.servico_interesse ?? [];

  return (
    <>
      {/* Row 1: name + edit button */}
      <div className="flex items-start justify-between mb-1">
        <h4 className="font-semibold text-[15px] leading-snug text-gray-900 pr-2 flex-1 font-heading">{lead.nome}</h4>
        {onEdit && (
          <div ref={menuRef} className="relative flex-shrink-0">
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-all duration-150 group"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold max-w-0 overflow-hidden group-hover:max-w-[40px] transition-all duration-200 whitespace-nowrap">Editar</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 bg-white border border-gray-100 rounded-xl shadow-xl z-40 w-32 py-1">
                <button
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); setMenuOpen(false); onEdit(); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="w-3 h-3" /> Editar
                </button>
                <button
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete?.(); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" /> Excluir
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 2: company */}
      {lead.origem_proposta && (
        <p className="text-[12px] text-gray-400 mb-2.5 truncate font-medium">{lead.origem_proposta}</p>
      )}

      {/* Row 3: services */}
      {services.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {services.map(s => (
            <span key={s} className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500 border border-indigo-100">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-50 pt-2.5 mt-1 flex items-end justify-between gap-2">
        <div>
          <span className="text-[17px] font-bold text-gray-900">{fmt(lead.valor_estimado)}</span>
          <p className="text-[10.5px] text-gray-400 mt-0.5">{fmtDate(lead.created_at)}</p>
        </div>
        <Badge t={lead.temperatura} />
      </div>
    </>
  );
}

// â”€â”€ Sortable card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SortableCard({ lead, onEdit, onDelete }: { lead: Lead; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id, data: { type: 'card', lead },
  });
  const colColor = COLUMNS.find(c => c.id === lead.etapa)?.color ?? '#6B7280';
  return (
    <div
      ref={setNodeRef} {...attributes} {...listeners}
      className="bg-white rounded-xl border border-gray-100 select-none cursor-grab active:cursor-grabbing overflow-hidden"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? 'transform 180ms cubic-bezier(0.25,1,0.5,1)',
        opacity: isDragging ? 0.35 : 1,
        boxShadow: isDragging ? 'none' : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex">
        <div className="w-1 flex-shrink-0 transition-colors duration-300" style={{ backgroundColor: colColor }} />
        <div className="flex-1 p-5">
          <CardBody lead={lead} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Drag overlay card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function OverlayCard({ lead }: { lead: Lead }) {
  const colColor = COLUMNS.find(c => c.id === lead.etapa)?.color ?? '#6B7280';
  return (
    <div className="bg-white rounded-xl border border-gray-100 w-[290px] cursor-grabbing overflow-hidden"
      style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)', transform: 'rotate(1.5deg) scale(1.02)' }}>
      <div className="flex">
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: colColor }} />
        <div className="flex-1 p-5">
          <CardBody lead={lead} />
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Column â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function KanbanColumn({ col, leads, isOver, onAdd, onEdit, onDelete }: {
  col: Col; leads: Lead[]; isOver: boolean;
  onAdd: () => void; onEdit: (l: Lead) => void; onDelete: (id: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: col.id, data: { type: 'column' } });
  const ids = useMemo(() => leads.map(l => l.id), [leads]);
  const total = leads.reduce((s, l) => s + (l.valor_estimado ?? 0), 0);

  return (
    <div className="w-[290px] flex-shrink-0 flex flex-col">
      {/* Header */}
      <div className="mb-4 px-0.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
          <h3 className="font-bold text-[17px] text-gray-900 font-heading">{col.title}</h3>
          <span className="text-[11.5px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${col.color}1A`, color: col.color }}>
            {leads.length}
          </span>
        </div>
        <p className="text-[13px] text-gray-400 font-medium pl-5">Total {fmt(total)}</p>
      </div>

      {/* Drop zone */}
      <div ref={setNodeRef} className="flex-1 rounded-2xl p-2.5 flex flex-col gap-2 min-h-[380px]"
        style={{
          backgroundColor: isOver ? `${col.color}0E` : '#FAFAFA',
          outline: isOver ? `2px dashed ${col.color}55` : '2px dashed transparent',
          outlineOffset: '-1px',
          transition: 'background-color 150ms ease, outline-color 150ms ease',
        }}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {leads.map(l => (
            <SortableCard key={l.id} lead={l} onEdit={() => onEdit(l)} onDelete={() => onDelete(l.id)} />
          ))}
        </SortableContext>
        <button onClick={onAdd}
          className="mt-auto w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-white transition-all text-[11.5px] font-semibold flex items-center justify-center gap-1.5 group">
          <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          Novo Lead
        </button>
      </div>
    </div>
  );
}

// ── EditModal (Standardized Premium Version) ──────────────────────────────────
type ModalTab = 'contato' | 'negocio' | 'followup';

function EditModal({ lead, onClose, onSave, availableServices }: { 
  lead: Lead; 
  onClose: () => void; 
  onSave: (u: Partial<Lead>) => Promise<void>, 
  availableServices: string[] 
}) {
  const [tab, setTab] = useState<ModalTab>('contato');
  const [formData, setFormData] = useState({
    nome: lead.nome,
    whatsapp: lead.contato ?? '',
    email: lead.email ?? '',
    origem_lead: lead.origem_lead ?? '',
    origem_proposta: lead.origem_proposta ?? '',
    observacoes_contato: lead.observacoes ?? '',
    etapa: lead.etapa,
    temperatura: lead.temperatura,
    forma_pagamento: lead.forma_pagamento ?? '',
    urgencia: lead.urgencia ?? '',
    observacoes_negocio: lead.observacoes_negocio ?? '',
    valor_estimado: lead.valor_estimado ?? 0,
    followup_data: lead.followup_data ?? '',
    followup_intervalo: lead.followup_intervalo ?? 3,
    followup_tipo: lead.followup_tipo ?? 'WhatsApp',
    followup_notas: lead.followup_notas ?? ''
  });
  const [selectedServices, setSelectedServices] = useState<string[]>(lead.servico_interesse ?? []);
  const [saving, setSaving] = useState(false);
  const [displayValue, setDisplayValue] = useState(lead.valor_estimado ? `R$ ${lead.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '');

  const toggleService = (s: string) => setSelectedServices(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const handlePhoneInput = (val: string) => {
    const raw = val.replace(/\D/g, '');
    let formatted = raw;
    if (raw.length > 2) {
      formatted = `(${raw.slice(0, 2)}) `;
      if (raw.length > 7) {
        formatted += `${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
      } else {
        formatted += raw.slice(2, 11);
      }
    }
    setFormData({ ...formData, whatsapp: formatted });
  };

  const handleCurrencyInput = (val: string) => {
    const raw = val.replace(/\D/g, '');
    const num = parseInt(raw || '0', 10) / 100;
    setFormData({ ...formData, valor_estimado: num });
    setDisplayValue(num > 0 ? `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '');
  };

  const save = async () => {
    setSaving(true);
    
    // Mapear os dados do formulário apenas para as colunas que existem no banco de dados.
    const validData = {
      nome: formData.nome,
      contato: formData.whatsapp,
      origem_proposta: formData.origem_proposta,
      observacoes: formData.observacoes_contato,
      etapa: formData.etapa,
      temperatura: formData.temperatura,
      valor_estimado: formData.valor_estimado,
      servico_interesse: selectedServices.length > 0 ? selectedServices : null
    };

    await onSave(validData);
    setSaving(false);
  };

  const lbl = "text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block ml-1";
  const inI = "w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-transparent text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#007AFF]/10 focus:border-[#007AFF]/20 focus:bg-white outline-none transition-all placeholder:text-gray-400";
  const tabBtn = (active: boolean) => cn(
    "flex-1 flex items-center justify-center gap-3 py-5 transition-all text-[11px] font-bold uppercase tracking-widest relative",
    active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
  );

  const tabs: { id: ModalTab; label: string; Icon: typeof User }[] = [
    { id: 'contato',  label: 'Cliente',   Icon: User },
    { id: 'negocio',  label: 'Negócio',   Icon: DollarSign },
    { id: 'followup', label: 'Follow-up', Icon: Bell },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl z-10 overflow-hidden flex flex-col p-2" 
        style={{ maxHeight: '95vh' }}
      >
        {/* Header */}
        <div className="px-10 py-10 flex items-center justify-between bg-white">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
              <Pencil className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Editar Lead</h3>
              <p className="text-sm text-gray-400 font-medium mt-1">Gerencie as informações desta oportunidade.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex px-10 border-b border-gray-50">
          {tabs.map(t => (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)}
              className={tabBtn(tab === t.id)}
            >
              <t.Icon className={cn("w-4 h-4", tab === t.id ? "text-blue-600" : "text-gray-300")} />
              {t.label}
              {tab === t.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto h-[480px] custom-scrollbar">
          {tab === 'contato' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={lbl}>Nome Completo</label>
                <div className="relative group">
                  <input className={inI + " pl-14"} placeholder="Ex: João Silva ou Tech Inc" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
              </div>
              <div>
                <label className={lbl}>WhatsApp</label>
                <div className="relative group">
                  <input className={inI + " pl-14"} placeholder="(00) 00000-0000" value={formData.whatsapp || ''} onChange={e => handlePhoneInput(e.target.value)} maxLength={15} />
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
              </div>
              <div>
                <label className={lbl}>E-mail</label>
                <div className="relative group">
                  <input className={inI + " pl-14"} placeholder="joao@exemplo.com" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
              </div>
              <div>
                <label className={lbl}>Origem</label>
                <div className="relative group">
                  <select className={inI + " pl-14 appearance-none cursor-pointer"} value={formData.origem_lead || ''} onChange={e => setFormData({...formData, origem_lead: e.target.value})}>
                    <option value="">Selecione...</option>
                    {['Instagram','Facebook','Google','Indicação','Site','WhatsApp','LinkedIn','Outro'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
              </div>
              <div>
                <label className={lbl}>Empresa</label>
                <div className="relative group">
                  <input className={inI + " pl-14"} placeholder="Ex: Acme Corp" value={formData.origem_proposta || ''} onChange={e => setFormData({...formData, origem_proposta: e.target.value})} />
                  <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={lbl}>Observações do Contato</label>
                <div className="relative group">
                  <textarea rows={4} className={inI + " pl-14 resize-none"} placeholder="Notas sobre o contato..." value={formData.observacoes_contato || ''} onChange={e => setFormData({...formData, observacoes_contato: e.target.value})} />
                  <MessageSquare className="absolute left-5 top-5 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
              </div>
            </div>
          )}

          {tab === 'negocio' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={lbl}>Etapa do Funil</label>
                <div className="relative group">
                  <select className={inI + " pl-14 appearance-none cursor-pointer"} value={formData.etapa} onChange={e => setFormData({...formData, etapa: e.target.value})}>
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  <SlidersHorizontal className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
              </div>
              <div>
                <label className={lbl}>Temperatura</label>
                <div className="relative group">
                  <select className={inI + " pl-14 appearance-none cursor-pointer"} value={formData.temperatura} onChange={e => setFormData({...formData, temperatura: e.target.value})}>
                    {['Quente','Morno','Frio'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <Flame className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
              </div>
              <div>
                <label className={lbl}>Valor Estimado (R$)</label>
                <div className="relative group">
                  <input type="text" className={inI + " pl-14"} placeholder="R$ 0,00" value={displayValue} onChange={e => handleCurrencyInput(e.target.value)} />
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
              </div>
              <div>
                <label className={lbl}>Forma de Pagamento</label>
                <div className="relative group">
                  <select className={inI + " pl-14 appearance-none cursor-pointer"} value={formData.forma_pagamento || ''} onChange={e => setFormData({...formData, forma_pagamento: e.target.value})}>
                    <option value="">Selecione...</option>
                    {['À Vista','PIX','Parcelado','Boleto','Cartão','Mensal'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={lbl}>Serviços de Interesse</label>
                <div className="flex flex-wrap gap-2">
                  {availableServices.map(s => {
                    const active = selectedServices.includes(s);
                    return (
                      <button 
                        key={s} 
                        onClick={() => toggleService(s)}
                        className={cn(
                          'px-5 py-3 rounded-2xl text-[12px] font-bold uppercase tracking-wider border transition-all',
                          active ? 'bg-white border-orange-200 text-orange-600 shadow-sm' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={lbl}>Detalhes do Negócio</label>
                <div className="relative group">
                  <textarea rows={4} className={inI + " pl-14 resize-none"} value={formData.observacoes_negocio || ''} onChange={e => setFormData({...formData, observacoes_negocio: e.target.value})} />
                  <FileText className="absolute left-5 top-5 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
              </div>
            </div>
          )}

          {tab === 'followup' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={lbl}>Data do Próximo Contato</label>
                <div className="relative group">
                  <input type="date" className={inI + " pl-14"} value={formData.followup_data || ''} onChange={e => setFormData({...formData, followup_data: e.target.value})} />
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
              </div>
              <div>
                <label className={lbl}>Tipo de Ação</label>
                <div className="relative group">
                  <select className={inI + " pl-14 appearance-none cursor-pointer"} value={formData.followup_tipo || ''} onChange={e => setFormData({...formData, followup_tipo: e.target.value})}>
                    {['WhatsApp','Ligação','E-mail','Reunião'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <Zap className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={lbl}>Notas do Follow-up</label>
                <div className="relative group">
                  <textarea rows={4} className={inI + " pl-14 resize-none"} placeholder="O que deve ser feito no próximo contato..." value={formData.followup_notas || ''} onChange={e => setFormData({...formData, followup_notas: e.target.value})} />
                  <AlignLeft className="absolute left-5 top-5 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-gray-100 bg-white flex gap-4 sticky bottom-0">
          <button 
            onClick={onClose} 
            className="px-8 py-4 rounded-2xl bg-[#F8F9FA] text-gray-600 text-[13px] font-bold hover:bg-gray-200 transition-all active:scale-95 flex-1 border border-transparent"
          >
            Cancelar
          </button>
          <button 
            onClick={save} 
            disabled={saving}
            className="px-8 py-4 rounded-2xl bg-[#007AFF] text-white text-[13px] font-bold hover:bg-[#0066EE] shadow-lg shadow-[#007AFF]/20 transition-all active:scale-[0.98] disabled:opacity-50 flex-1 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}


export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [availableServices, setAvailableServices] = useState<string[]>(SERVICE_OPTIONS_STATIC);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  useEffect(() => { 
    setMounted(true); 
    fetchLeads(); 
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await supabase.from('crmmateus_servicos').select('nome');
      if (data && data.length > 0) {
        setAvailableServices(data.map(s => s.nome));
      }
    } catch (err) {
      console.error('Erro ao buscar serviços:', err);
    }
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('crmmateus_leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data ?? []);
    } catch { toast.error('Erro ao carregar leads.'); }
    finally { setLoading(false); }
  }, []);

  const activeLead = useMemo(() => leads.find(l => l.id === activeId) ?? null, [activeId, leads]);
  const totalValue = leads.reduce((s, l) => s + (l.valor_estimado ?? 0), 0);

  const onDragStart = ({ active }: DragStartEvent) => setActiveId(active.id as string);

  const onDragOver = ({ over }: DragOverEvent) => {
    if (!over) { setOverColumnId(null); return; }
    const id = over.id as string;
    setOverColumnId(COLUMNS.find(c => c.id === id)?.id ?? leads.find(l => l.id === id)?.etapa ?? null);
  };

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null); setOverColumnId(null);
    if (!over) return;
    const lead = leads.find(l => l.id === (active.id as string));
    if (!lead) return;
    const overId = over.id as string;
    const dest = COLUMNS.find(c => c.id === overId)?.id ?? leads.find(l => l.id === overId)?.etapa;
    if (!dest || lead.etapa === dest) return;
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, etapa: dest } : l));
    try {
      const { error } = await supabase.from('crmmateus_leads').update({ etapa: dest }).eq('id', lead.id);
      if (error) throw error;
    } catch { toast.error('Erro ao mover lead.'); fetchLeads(); }
  };

  const handleSaveEdit = async (updated: Partial<Lead>) => {
    if (!editingLead) return;
    setLeads(prev => prev.map(l => l.id === editingLead.id ? { ...l, ...updated } : l));
    setEditingLead(null);
    try {
      const { error } = await supabase.from('crmmateus_leads').update(updated).eq('id', editingLead.id);
      if (error) throw error;
      toast.success('Lead atualizado!');
    } catch { toast.error('Erro ao salvar.'); fetchLeads(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este lead?')) return;
    setLeads(prev => prev.filter(l => l.id !== id));
    try {
      const { error } = await supabase.from('crmmateus_leads').delete().eq('id', id);
      if (error) throw error;
      toast.success('Lead excluído.');
    } catch { toast.error('Erro ao excluir.'); fetchLeads(); }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-[28px] font-bold text-gray-900 tracking-tight font-heading">Pipeline</h2>
          <div className="flex items-center gap-2 text-gray-400 text-[13px] font-medium">
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{leads.length} Negócios</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="font-semibold text-gray-600">{fmt(totalValue)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[LayoutGrid, AlignJustify, SlidersHorizontal].map((Icon, i) => (
            <button key={i} className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
              <Icon className="w-4 h-4" />
            </button>
          ))}
          <button onClick={() => setIsLeadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-[13px] font-semibold hover:bg-gray-800 transition-colors ml-1">
            <Plus className="w-4 h-4" /> Novo Lead
          </button>
        </div>
      </div>

      {/* ── Board ── */}
      <div className="flex-1 overflow-x-auto pb-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">Carregando...</div>
        ) : mounted ? (
          <DndContext sensors={sensors} collisionDetection={closestCorners}
            onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
            <div className="flex gap-4 h-full items-start min-w-max">
              {COLUMNS.map(col => (
                <KanbanColumn key={col.id} col={col}
                  leads={leads.filter(l => l.etapa === col.id)}
                  isOver={overColumnId === col.id}
                  onAdd={() => setIsLeadModalOpen(true)}
                  onEdit={setEditingLead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            {mounted && createPortal(
              <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
                {activeLead && <OverlayCard lead={activeLead} />}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        ) : null}
      </div>

      {/* ── Modals ── */}
      <LeadModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} onSuccess={fetchLeads} />
      {editingLead && <EditModal lead={editingLead} availableServices={availableServices} onClose={() => setEditingLead(null)} onSave={handleSaveEdit} />}
    </div>
  );
}
