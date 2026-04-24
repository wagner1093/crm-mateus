'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Plus, User, Briefcase, Mail, Phone, DollarSign, MessageSquare, Save, Snowflake, Thermometer, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LeadModal({ isOpen, onClose, onSuccess }: LeadModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    contato: '',
    origem_proposta: '',
    observacoes: '',
    etapa: 'Prospecção',
    temperatura: 'Morno',
    valor_estimado: 0,
    servico_interesse: [] as string[]
  });
  const [displayValue, setDisplayValue] = useState('');
  const [availableServices, setAvailableServices] = useState<string[]>(['Tráfego Pago', 'Social Mídia', 'Criação de Site', 'Criação de Sistema', 'Hospedagem']);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.contato) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('crmmateus_leads').insert([formData]);
      if (error) throw error;

      toast.success('Lead criado com sucesso!');
      onSuccess?.();
      onClose();
      setFormData({
        nome: '',
        contato: '',
        origem_proposta: '',
        observacoes: '',
        etapa: 'Prospecção',
        temperatura: 'Morno',
        valor_estimado: 0,
        servico_interesse: []
      });
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao criar lead.');
    } finally {
      setLoading(false);
    }
  };

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
    setFormData({ ...formData, contato: formatted });
  };

  const handleCurrencyInput = (val: string) => {
    const raw = val.replace(/\D/g, '');
    const num = parseInt(raw || '0', 10) / 100;
    setFormData({ ...formData, valor_estimado: num });
    setDisplayValue(num > 0 ? `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '');
  };

  const lbl = "text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block ml-1";
  const inI = "w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-transparent text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#007AFF]/10 focus:border-[#007AFF]/20 focus:bg-white outline-none transition-all placeholder:text-gray-400";
  
  const serviceColors: Record<string, { bg: string, border: string, text: string }> = {
    'Tráfego Pago': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
    'Social Mídia': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600' },
    'Criação de Site': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
    'Criação de Sistema': { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600' },
    'Hospedagem': { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-600' },
  };

  const chipBtn = (s: string, active: boolean) => {
    const color = serviceColors[s] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600' };
    return `px-5 py-3 rounded-2xl text-[12px] font-bold border transition-all ${
      active 
        ? `${color.bg} ${color.border} ${color.text} shadow-sm` 
        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
    }`;
  };


  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[680px] bg-white shadow-2xl rounded-[40px] overflow-hidden z-[10000] flex flex-col p-2"
            style={{ maxHeight: '95vh' }}
          >
            {/* Header */}
            <div className="px-10 py-10 flex items-center justify-between bg-white">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Novo Lead</h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">Preencha os dados básicos da oportunidade.</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-10 pb-10 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div>
                  <label className={lbl}>Nome / Empresa *</label>
                  <div className="relative group">
                    <input
                      required
                      type="text"
                      className={inI + " pl-14"}
                      placeholder="Ex: João Silva ou Tech Inc"
                      value={formData.nome}
                      onChange={e => setFormData({...formData, nome: e.target.value})}
                    />
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className={lbl}>Contato (WhatsApp) *</label>
                  <div className="relative group">
                    <input
                      required
                      type="text"
                      className={inI + " pl-14"}
                      placeholder="(00) 00000-0000"
                      value={formData.contato}
                      onChange={e => handlePhoneInput(e.target.value)}
                      maxLength={15}
                    />
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                  </div>
                </div>

                {/* Serviços */}
                <div className="md:col-span-2">
                  <label className={lbl}>Serviços de Interesse *</label>
                  <div className="flex flex-wrap gap-3">
                    {availableServices.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          const current = formData.servico_interesse;
                          const next = current.includes(s) ? current.filter(x => x !== s) : [...current, s];
                          setFormData({...formData, servico_interesse: next});
                        }}
                        className={chipBtn(s, formData.servico_interesse.includes(s))}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Valor Estimado */}
                <div className="md:col-span-2">
                  <label className={lbl}>Valor Estimado (R$)</label>
                  <div className="relative group">
                    <input
                      type="text"
                      className={inI + " pl-14"}
                      placeholder="R$ 0,00"
                      value={displayValue}
                      onChange={e => handleCurrencyInput(e.target.value)}
                    />
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                  </div>
                </div>

                {/* Temperatura */}
                <div className="md:col-span-2">
                  <label className={lbl}>Temperatura *</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, temperatura: 'Frio'})}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[12px] font-bold transition-all ${
                        formData.temperatura === 'Frio' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#F8F9FA] text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <Snowflake className="w-4 h-4" />
                      Frio
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, temperatura: 'Morno'})}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[12px] font-bold transition-all ${
                        formData.temperatura === 'Morno' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-[#F8F9FA] text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <Thermometer className="w-4 h-4" />
                      Morno
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, temperatura: 'Quente'})}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[12px] font-bold transition-all ${
                        formData.temperatura === 'Quente' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-[#F8F9FA] text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <Flame className="w-4 h-4" />
                      Quente
                    </button>
                  </div>
                </div>

                {/* Observacoes */}
                <div className="md:col-span-2">
                  <label className={lbl}>Observações</label>
                  <div className="relative group">
                    <textarea
                      rows={4}
                      className={inI + " pl-14 resize-none"}
                      placeholder="Notas importantes sobre o lead..."
                      value={formData.observacoes}
                      onChange={e => setFormData({...formData, observacoes: e.target.value})}
                    />
                    <MessageSquare className="absolute left-5 top-5 w-5 h-5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 rounded-2xl bg-[#F8F9FA] text-gray-600 text-[13px] font-bold hover:bg-gray-200 transition-all active:scale-95 flex-1 border border-transparent"
                >
                  Cancelar
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="px-8 py-4 rounded-2xl bg-[#007AFF] text-white text-[13px] font-bold hover:bg-[#0066EE] shadow-lg shadow-[#007AFF]/20 transition-all active:scale-[0.98] disabled:opacity-50 flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar Lead</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
