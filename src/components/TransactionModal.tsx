'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, DollarSign, Calendar, Tag, FileText, ArrowDownCircle, ArrowUpCircle, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: any;
}

export function TransactionModal({ isOpen, onClose, onSuccess, transaction }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: 0,
    tipo: 'Entrada',
    categoria: '',
    data_pagamento: new Date().toISOString().split('T')[0],
    status: 'Pendente',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (transaction) {
      setFormData({
        descricao: transaction.descricao || '',
        valor: transaction.valor || 0,
        tipo: transaction.tipo || 'Entrada',
        categoria: transaction.categoria || '',
        data_pagamento: transaction.data_pagamento || new Date().toISOString().split('T')[0],
        status: transaction.status || 'Pendente',
        observacoes: transaction.observacoes || ''
      });
    }
  }, [transaction]);

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
      if (transaction?.id) {
        const { error } = await supabase
          .from('crmmateus_financeiro')
          .update(formData)
          .eq('id', transaction.id);
        if (error) throw error;
        toast.success('Lançamento atualizado!');
      } else {
        const { error } = await supabase
          .from('crmmateus_financeiro')
          .insert([formData]);
        if (error) throw error;
        toast.success('Lançamento realizado!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar lançamento.');
    } finally {
      setLoading(false);
    }
  };

  const lbl = "text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 block ml-1";
  const inI = "w-full px-5 py-4 rounded-2xl bg-gray-50 border-none text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500/10 focus:bg-white outline-none transition-all placeholder:text-gray-300";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
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
            className="relative w-full max-w-[640px] bg-white shadow-2xl rounded-[40px] overflow-hidden z-[10000] flex flex-col p-2"
            style={{ maxHeight: '95vh' }}
          >
            {/* Header */}
            <div className="px-10 py-10 flex items-center justify-between bg-white">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{transaction ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
                  <p className="text-sm text-gray-400 font-medium mt-1">Gestão de entradas e saídas financeiras.</p>
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
                {/* Descricao */}
                <div className="md:col-span-2">
                  <label className={lbl}>Descrição do Lançamento *</label>
                  <div className="relative group">
                    <input
                      required
                      type="text"
                      className={inI + " pl-14"}
                      placeholder="Ex: Pagamento Mensalidade ou Servidor"
                      value={formData.descricao}
                      onChange={e => setFormData({...formData, descricao: e.target.value})}
                    />
                    <FileText className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>

                {/* Valor */}
                <div>
                  <label className={lbl}>Valor (R$) *</label>
                  <div className="relative group">
                    <input
                      type="number"
                      step="0.01"
                      required
                      className={inI + " pl-14"}
                      placeholder="0,00"
                      value={formData.valor}
                      onChange={e => setFormData({...formData, valor: parseFloat(e.target.value)})}
                    />
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>

                {/* Tipo */}
                <div>
                  <label className={lbl}>Tipo *</label>
                  <div className="relative group">
                    <select
                      className={inI + " appearance-none cursor-pointer pl-14"}
                      value={formData.tipo}
                      onChange={e => setFormData({...formData, tipo: e.target.value})}
                    >
                      <option value="Entrada">Receita (Entrada)</option>
                      <option value="Saída">Despesa (Saída)</option>
                    </select>
                    {formData.tipo === 'Entrada' ? (
                      <ArrowUpCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 transition-colors" />
                    ) : (
                      <ArrowDownCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 transition-colors" />
                    )}
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <label className={lbl}>Categoria</label>
                  <div className="relative group">
                    <input
                      type="text"
                      className={inI + " pl-14"}
                      placeholder="Ex: Consultoria, Fixos, Marketing"
                      value={formData.categoria}
                      onChange={e => setFormData({...formData, categoria: e.target.value})}
                    />
                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>

                {/* Data */}
                <div>
                  <label className={lbl}>Data do Pagamento *</label>
                  <div className="relative group">
                    <input
                      type="date"
                      required
                      className={inI + " pl-14"}
                      value={formData.data_pagamento}
                      onChange={e => setFormData({...formData, data_pagamento: e.target.value})}
                    />
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className={lbl}>Status do Lançamento *</label>
                  <select
                    className={inI + " appearance-none cursor-pointer"}
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Confirmado / Pago</option>
                    <option value="Atrasado">Atrasado</option>
                  </select>
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
                  disabled={loading}
                  type="submit"
                  className="px-10 py-5 rounded-[24px] bg-[#007AFF] text-white text-[13px] font-bold uppercase tracking-widest hover:bg-[#0066EE] shadow-xl shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-50 flex-[2] flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>{transaction ? 'Salvar Alterações' : 'Lançar Transação'}</span>
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
