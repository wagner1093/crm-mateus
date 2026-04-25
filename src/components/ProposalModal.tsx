'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Briefcase, DollarSign, Calendar, Check, Clock, AlertCircle, CheckCircle2, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  proposal?: any;
}

export function ProposalModal({ isOpen, onClose, onSuccess, proposal }: ProposalModalProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    cliente_nome: '',
    servico_id: '',
    valor: 0,
    status: 'Rascunho',
    data_validade: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    observacoes: '',
    modo_pagamento: ''
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (proposal) {
      setFormData({
        cliente_nome: proposal.cliente_nome || '',
        servico_id: proposal.servico_id || '',
        valor: proposal.valor || 0,
        status: proposal.status || 'Rascunho',
        data_validade: proposal.data_validade || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: proposal.observacoes || '',
        modo_pagamento: proposal.modo_pagamento || ''
      });
    } else {
      setFormData({
        cliente_nome: '',
        servico_id: '',
        valor: 0,
        status: 'Rascunho',
        data_validade: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: '',
        modo_pagamento: ''
      });
    }
  }, [proposal, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [clientsRes, servicesRes] = await Promise.all([
        supabase.from('crmmateus_clientes').select('id, nome'),
        supabase.from('crmmateus_servicos').select('id, nome, preco_padrao')
      ]);
      setClients(clientsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (err) {
      console.error('Error fetching data for proposal:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (proposal?.id) {
        const { error } = await supabase
          .from('crmmateus_propostas')
          .update(formData)
          .eq('id', proposal.id);
        if (error) throw error;
        toast.success('Proposta atualizada!');
      } else {
        const { error } = await supabase
          .from('crmmateus_propostas')
          .insert([formData]);
        if (error) throw error;
        toast.success('Proposta criada com sucesso!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar proposta.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const lbl = "text-[13px] font-bold text-[#64748B] mb-2 block font-dmsans uppercase tracking-wide";
  const inI = "w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-dmsans placeholder:text-gray-400";

  const statusOptions = [
    { key: 'Rascunho', icon: Clock },
    { key: 'Enviada', icon: Send },
    { key: 'Aceita', icon: CheckCircle2 },
    { key: 'Recusada', icon: AlertCircle }
  ];

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
                <h3 className="text-xl font-bold text-gray-900">{proposal ? 'Editar Proposta' : 'Nova Proposta'}</h3>
                <p className="text-xs text-gray-400 font-medium mt-1">Geração de orçamentos e propostas comerciais.</p>
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
                {/* Cliente */}
                <div className="md:col-span-2">
                  <label className={lbl}>Cliente / Empresa</label>
                  <input
                    required
                    type="text"
                    className={inI}
                    placeholder="Ex: Marta Souza ou Empresa LTDA"
                    value={formData.cliente_nome}
                    onChange={e => setFormData({...formData, cliente_nome: e.target.value})}
                    list="clients-list"
                  />
                  <datalist id="clients-list">
                    {clients.map(c => <option key={c.id} value={c.nome} />)}
                  </datalist>
                </div>

                {/* Serviço */}
                <div>
                  <label className={lbl}>Serviço Principal</label>
                  <select
                    required
                    className={inI + " appearance-none cursor-pointer"}
                    value={formData.servico_id}
                    onChange={e => {
                      const s = services.find(x => x.id === e.target.value);
                      setFormData({
                        ...formData, 
                        servico_id: e.target.value,
                        valor: s?.preco_padrao || formData.valor
                      });
                    }}
                  >
                    <option value="">Selecione...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                </div>

                {/* Valor */}
                <div>
                  <label className={lbl}>Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className={inI}
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={e => setFormData({...formData, valor: parseFloat(e.target.value)})}
                  />
                </div>

                {/* Data Validade */}
                <div>
                  <label className={lbl}>Válido até</label>
                  <input
                    type="date"
                    required
                    className={inI}
                    value={formData.data_validade}
                    onChange={e => setFormData({...formData, data_validade: e.target.value})}
                  />
                </div>

                {/* Modo de Pagamento */}
                <div>
                  <label className={lbl}>Modo de Pagamento</label>
                  <select
                    className={inI + " appearance-none cursor-pointer"}
                    value={formData.modo_pagamento}
                    onChange={e => setFormData({...formData, modo_pagamento: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="A vista (PIX/Boleto)">A vista (PIX/Boleto)</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Parcelado (Boleto)">Parcelado (Boleto)</option>
                    <option value="A combinar">A combinar</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className={lbl}>Status</label>
                  <select
                    className={inI + " appearance-none cursor-pointer"}
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.key} value={opt.key}>{opt.key}</option>
                    ))}
                  </select>
                </div>

                {/* Observacoes */}
                <div className="md:col-span-2">
                  <label className={lbl}>Escopo / Observações</label>
                  <textarea
                    rows={3}
                    className={inI + " resize-none min-h-[100px]"}
                    placeholder="Detalhes sobre a proposta..."
                    value={formData.observacoes}
                    onChange={e => setFormData({...formData, observacoes: e.target.value})}
                  />
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
                      <span>{proposal ? 'Atualizar Proposta' : 'Gerar Proposta'}</span>
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
