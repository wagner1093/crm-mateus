'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Phone, Mail, FileText, DollarSign, Activity, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: any;
}

export function ClientModal({ isOpen, onClose, onSuccess, client }: ClientModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    valor_recorrente: 0,
    status: 'Ativo'
  });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (client) {
      setFormData({
        nome: client.nome || '',
        email: client.email || '',
        whatsapp: client.whatsapp || '',
        valor_recorrente: client.valor_recorrente || 0,
        status: client.status || 'Ativo'
      });
    }
  }, [client]);

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
    setLoading(true);

    try {
      if (client?.id) {
        const { error } = await supabase
          .from('crmmateus_clientes')
          .update(formData)
          .eq('id', client.id);
        if (error) throw error;
        toast.success('Cliente atualizado!');
      } else {
        const { error } = await supabase
          .from('crmmateus_clientes')
          .insert([formData]);
        if (error) throw error;
        toast.success('Cliente cadastrado!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar cliente.');
    } finally {
      setLoading(false);
    }
  };

  const lbl = "text-[13px] font-bold text-[#64748B] mb-2 block font-dmsans uppercase tracking-wide";
  const inI = "w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-dmsans placeholder:text-gray-400";

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
            className="relative w-full max-w-[640px] bg-white shadow-2xl rounded-2xl overflow-hidden z-[10000] flex flex-col"
            style={{ maxHeight: '95vh' }}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{client ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <p className="text-xs text-gray-400 font-medium mt-1">Gestão de carteira e faturamento recorrente.</p>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div className="md:col-span-2">
                  <label className={lbl}>Nome / Razão Social</label>
                  <input
                    required
                    type="text"
                    className={inI}
                    placeholder="Ex: João Silva ou Tech Inc"
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className={lbl}>E-mail de Contato</label>
                  <input
                    type="email"
                    className={inI}
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className={lbl}>WhatsApp / Celular</label>
                  <input
                    type="text"
                    className={inI}
                    placeholder="(00) 00000-0000"
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  />
                </div>

                {/* Valor Recorrente */}
                <div>
                  <label className={lbl}>Faturamento Recorrente (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className={inI}
                    placeholder="0,00"
                    value={formData.valor_recorrente}
                    onChange={e => setFormData({...formData, valor_recorrente: parseFloat(e.target.value)})}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className={lbl}>Status Contratual</label>
                  <select
                    className={inI + " appearance-none cursor-pointer"}
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-xl bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 flex-1"
                >
                  Cancelar
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 flex-[2] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{client ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
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
