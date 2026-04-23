'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Building2, Bell, Shield, Smartphone, Globe, 
  Save, Check, AlertCircle, Terminal, Cpu, Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const sections = [
  { id: 'empresa', label: 'Dados da Empresa', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'perfil', label: 'Meu Perfil', icon: User, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'notificacoes', label: 'Notificações', icon: Bell, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'seguranca', label: 'Segurança', icon: Shield, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'sistema', label: 'Sistema & API', icon: Terminal, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

export default function ConfigPage() {
  const [activeSection, setActiveSection] = useState('empresa');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configurações salvas com sucesso!', {
        style: {
          borderRadius: '2rem',
          background: '#111827',
          color: '#fff',
          fontWeight: '900',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }
      });
    }, 1000);
  };

  const lbl = "text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block px-1";
  const inI = "w-full px-6 py-4 rounded-2xl bg-gray-50 border-none text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500/20 shadow-inner transition-all";

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-400 bg-clip-text text-transparent font-heading">
            Configurações
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">Gerencie os parâmetros globais e identidade do seu ecossistema.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gray-900 hover:bg-black text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-gray-200 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Salvar Alterações</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-10">
        {/* Navigation Sidebar */}
        <div className="w-full xl:w-80 space-y-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "w-full flex items-center justify-between p-5 rounded-[2rem] transition-all duration-300 group",
                activeSection === s.id 
                  ? "bg-white shadow-2xl shadow-gray-200/50 text-gray-900" 
                  : "text-gray-400 hover:bg-white/50 hover:text-gray-600"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                  activeSection === s.id ? s.bg + " " + s.color : "bg-gray-50 text-gray-300 group-hover:bg-white group-hover:text-gray-400"
                )}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.15em]">{s.label}</span>
              </div>
              {activeSection === s.id && (
                <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-2" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <motion.div 
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-sm"
        >
          {activeSection === 'empresa' && (
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-1 font-heading">Perfil Institucional</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Informações públicas e faturamento.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={lbl}>Nome da Empresa</label>
                  <input type="text" placeholder="Ex: Mateus Agency" className={inI} defaultValue="Mateus Soluções" />
                </div>
                <div className="space-y-2">
                  <label className={lbl}>CNPJ / Identificação</label>
                  <input type="text" placeholder="00.000.000/0001-00" className={inI} defaultValue="45.123.890/0001-22" />
                </div>
                <div className="space-y-2">
                  <label className={lbl}>E-mail Corporativo</label>
                  <input type="email" placeholder="contato@empresa.com" className={inI} defaultValue="financeiro@mateus.com" />
                </div>
                <div className="space-y-2">
                  <label className={lbl}>WhatsApp Business</label>
                  <input type="text" placeholder="(11) 99999-9999" className={inI} defaultValue="(11) 98888-7777" />
                </div>
              </div>

              <div className="pt-10 border-t border-gray-50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-black text-gray-900 tracking-tight font-heading">Metas de Performance</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className={lbl}>Meta Faturamento (R$)</label>
                    <input type="text" defaultValue="50.000" className={cn(inI, "font-black text-emerald-600 bg-emerald-50/30")} />
                  </div>
                  <div className="space-y-2">
                    <label className={lbl}>Novos Clientes/Mês</label>
                    <input type="number" defaultValue="10" className={cn(inI, "font-black text-blue-600 bg-blue-50/30")} />
                  </div>
                  <div className="space-y-2">
                    <label className={lbl}>Conversão Alvo (%)</label>
                    <input type="number" defaultValue="20" className={cn(inI, "font-black text-orange-600 bg-orange-50/30")} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'seguranca' && (
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-1 font-heading">Segurança da Conta</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Proteção de dados e acessos críticos.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Autenticação de Dois Fatores (2FA)</p>
                      <p className="text-xs font-bold text-gray-400">Adicione uma camada extra de proteção via app.</p>
                    </div>
                  </div>
                  <button className="px-6 py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Ativar</button>
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-orange-600 shadow-sm">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Logs de Acesso</p>
                      <p className="text-xs font-bold text-gray-400">Histórico detalhado de quem acessou o sistema.</p>
                    </div>
                  </div>
                  <button className="px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">Ver Logs</button>
                </div>
              </div>
            </div>
          )}

          {activeSection !== 'empresa' && activeSection !== 'seguranca' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                <Cpu className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-1 font-heading">Módulo em Desenvolvimento</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest max-w-xs">
                Estamos refinando esta seção para garantir a melhor experiência executiva.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
