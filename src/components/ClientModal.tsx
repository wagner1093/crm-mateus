'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, User, Phone, Mail, Building2, MapPin, FileText, DollarSign, Briefcase, AlignLeft } from 'lucide-react';
import { CurrencyInput } from '@/components/CurrencyInput';
import { PhoneInput } from '@/components/PhoneInput';
import { DocumentInput } from '@/components/DocumentInput';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: any;
}

const EMPTY = {
  nome: '', tipo: 'PF', email: '', whatsapp: '', telefone: '',
  cpf_cnpj: '', responsavel: '', segmento: '',
  endereco: '', cidade: '', estado: '', cep: '',
  valor_recorrente: 0, status: 'Ativo', observacoes: '',
};

export function ClientModal({ isOpen, onClose, onSuccess, client }: ClientModalProps) {
  const [formData, setFormData] = useState({ ...EMPTY });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (client) {
      setFormData({
        nome: client.nome || '',
        tipo: client.tipo || 'PF',
        email: client.email || '',
        whatsapp: client.whatsapp || '',
        telefone: client.telefone || '',
        cpf_cnpj: client.cpf_cnpj || '',
        responsavel: client.responsavel || '',
        segmento: client.segmento || '',
        endereco: client.endereco || '',
        cidade: client.cidade || '',
        estado: client.estado || '',
        cep: client.cep || '',
        valor_recorrente: client.valor_recorrente || 0,
        status: client.status || 'Ativo',
        observacoes: client.observacoes || '',
      });
    } else {
      setFormData({ ...EMPTY });
    }
  }, [client, isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (client?.id) {
        const { error } = await supabase.from('crmmateus_clientes').update(formData).eq('id', client.id);
        if (error) throw error;
        toast.success('Cliente atualizado!');
      } else {
        const { error } = await supabase.from('crmmateus_clientes').insert([formData]);
        if (error) throw error;
        toast.success('Cliente cadastrado!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + (err?.message ?? 'tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const f = (v: any, k: string) => setFormData(p => ({ ...p, [k]: v }));
  const lbl = "text-[11px] font-black text-gray-400 mb-1.5 block uppercase tracking-widest";
  const inp = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#1d7cf9]/20 focus:border-[#1d7cf9] transition-all placeholder:text-gray-400";

  const SectionTitle = ({ icon: Icon, label }: { icon: any; label: string }) => (
    <div className="flex items-center gap-2 mt-2 mb-4 pb-3 border-b border-gray-100">
      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-[#1d7cf9]" />
      </div>
      <span className="text-[12px] font-black uppercase tracking-widest text-gray-500">{label}</span>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[700px] bg-white shadow-2xl rounded-2xl overflow-hidden z-[10000] flex flex-col"
            style={{ maxHeight: '92vh' }}>

            {/* Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{client ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Gerencie os dados completos do cliente</p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6" style={{ scrollbarWidth: 'thin' }}>

              {/* Identificação */}
              <div>
                <SectionTitle icon={User} label="Identificação" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={lbl}>Nome / Razão Social *</label>
                    <input required className={inp} placeholder="Ex: João Silva ou Tech Solutions Ltda" value={formData.nome} onChange={e => f(e.target.value, 'nome')} />
                  </div>
                  <div>
                    <label className={lbl}>Tipo de Pessoa</label>
                    <select className={inp + " appearance-none cursor-pointer"} value={formData.tipo} onChange={e => f(e.target.value, 'tipo')}>
                      <option value="PF">Pessoa Física (PF)</option>
                      <option value="PJ">Pessoa Jurídica (PJ)</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>{formData.tipo === 'PJ' ? 'CNPJ' : 'CPF'}</label>
                    <DocumentInput
                      type={formData.tipo === 'PJ' ? 'CNPJ' : 'CPF'}
                      className={inp}
                      value={formData.cpf_cnpj}
                      onChange={v => f(v, 'cpf_cnpj')}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Responsável / Contato</label>
                    <input className={inp} placeholder="Nome do responsável" value={formData.responsavel} onChange={e => f(e.target.value, 'responsavel')} />
                  </div>
                  <div>
                    <label className={lbl}>Segmento / Setor</label>
                    <input className={inp} placeholder="Ex: E-commerce, Saúde, Educação" value={formData.segmento} onChange={e => f(e.target.value, 'segmento')} />
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div>
                <SectionTitle icon={Phone} label="Contato" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>E-mail</label>
                    <input type="email" className={inp} placeholder="email@exemplo.com" value={formData.email} onChange={e => f(e.target.value, 'email')} />
                  </div>
                  <div>
                    <label className={lbl}>WhatsApp</label>
                    <PhoneInput className={inp} value={formData.whatsapp} onChange={v => f(v, 'whatsapp')} />
                  </div>
                  <div>
                    <label className={lbl}>Telefone Fixo</label>
                    <PhoneInput className={inp} placeholder="(00) 0000-0000" value={formData.telefone} onChange={v => f(v, 'telefone')} />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <SectionTitle icon={MapPin} label="Endereço" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={lbl}>Logradouro</label>
                    <input className={inp} placeholder="Rua, número, complemento" value={formData.endereco} onChange={e => f(e.target.value, 'endereco')} />
                  </div>
                  <div>
                    <label className={lbl}>Cidade</label>
                    <input className={inp} placeholder="Ex: São Paulo" value={formData.cidade} onChange={e => f(e.target.value, 'cidade')} />
                  </div>
                  <div>
                    <label className={lbl}>Estado</label>
                    <select className={inp + " appearance-none cursor-pointer"} value={formData.estado} onChange={e => f(e.target.value, 'estado')}>
                      <option value="">Selecione...</option>
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>CEP</label>
                    <input className={inp} placeholder="00000-000" value={formData.cep} onChange={e => f(e.target.value, 'cep')} />
                  </div>
                </div>
              </div>

              {/* Financeiro */}
              <div>
                <SectionTitle icon={DollarSign} label="Financeiro & Contrato" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Faturamento Recorrente (R$)</label>
                    <CurrencyInput className={inp} value={formData.valor_recorrente} onChange={v => f(v, 'valor_recorrente')} />
                  </div>
                  <div>
                    <label className={lbl}>Status Contratual</label>
                    <select className={inp + " appearance-none cursor-pointer"} value={formData.status} onChange={e => f(e.target.value, 'status')}>
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Encerrado">Encerrado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <SectionTitle icon={AlignLeft} label="Observações" />
                <textarea
                  rows={3}
                  className={inp + " resize-none"}
                  placeholder="Informações adicionais sobre o cliente, preferências, histórico relevante..."
                  value={formData.observacoes}
                  onChange={e => f(e.target.value, 'observacoes')}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-[2] py-3 rounded-xl bg-[#1C1C1E] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" />{client ? 'Salvar Alterações' : 'Cadastrar Cliente'}</>}
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
