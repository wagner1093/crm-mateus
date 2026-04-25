'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Building2, Bell, Shield, Smartphone, Globe,
  Save, AlertCircle, Terminal, Database, CheckCircle2, UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

const sections = [
  { id: 'geral', label: 'Geral', desc: 'Perfil e empresa', icon: Building2 },
  { id: 'notificacoes', label: 'Notificações', desc: 'Canais e alertas', icon: Bell },
  { id: 'seguranca', label: 'Segurança', desc: 'Proteção e acessos', icon: Shield },
  { id: 'equipe', label: 'Equipe', desc: 'Membros do time', icon: User },
];

export default function ConfigPage() {
  const [activeSection, setActiveSection] = useState('geral');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nome_empresa: '',
    cnpj: '',
    email_corporativo: '',
    whatsapp: '',
    user_name: 'Zeca',
    phone: '(11) 99999-9999',
    role: 'Administrador',
    address: '',
    segment: '',
    website: '',
  });

  const [configId, setConfigId] = useState<string | null>(null);

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('crmmateus_configuracoes')
        .select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setConfigId(data.id);
        setFormData(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: any = { ...formData, updated_at: new Date().toISOString() };
      if (configId) payload.id = configId;
      const { error } = await supabase.from('crmmateus_configuracoes').upsert(payload);
      if (error) throw error;
      toast.success('Configurações salvas!');
      fetchConfig();
    } catch (err) {
      toast.error('Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const Field = ({ label, icon: Icon, ...props }: any) => (
    <div>
      <label className="block text-[13px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
        <input
          {...props}
          className={cn(
            "w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pr-4 text-base font-medium text-[#111118] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1d7cf9]/20 focus:border-[#1d7cf9] transition-all",
            Icon ? "pl-11" : "pl-4",
            props.disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      </div>
    </div>
  );

  const Card = ({ children, className = '' }: any) => (
    <div className={cn("bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8", className)}>
      {children}
    </div>
  );

  const SectionHeader = ({ icon: Icon, label, sub }: any) => (
    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
      <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1d7cf9]">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-[#111118] tracking-tight">{label}</h3>
        {sub && <p className="text-sm font-medium text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-[#111118] via-[#111118] to-[#52525B]">
            Configurações
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Gerencie perfil, empresa, segurança e equipe.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || loading}
          className="bg-[#1C1C1E] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Save className="w-4 h-4" />}
          Salvar Alterações
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full xl:w-72 flex flex-col gap-2">
          {sections.map((s) => {
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-[20px] text-left transition-all duration-200 group",
                  active
                    ? "bg-[#111111] text-white shadow-[0_8px_30px_rgb(0,0,0,0.15)]"
                    : "bg-white border border-gray-100 text-gray-500 hover:bg-[#111111] hover:text-white hover:border-transparent hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  active ? "bg-white/10" : "bg-gray-100 group-hover:bg-white/10"
                )}>
                  <s.icon className={cn("w-5 h-5", active ? "text-white" : "text-gray-400 group-hover:text-white")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-base font-bold tracking-tight", active ? "text-white" : "text-[#111118] group-hover:text-white")}>{s.label}</p>
                  <p className={cn("text-sm font-medium mt-0.5", active ? "text-white/50" : "text-gray-400 group-hover:text-white/50")}>{s.desc}</p>
                </div>
                {active && <div className="w-1.5 h-6 rounded-full bg-[#1d7cf9]" />}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 space-y-6"
        >
          {/* ── GERAL ── */}
          {activeSection === 'geral' && (
            <>
              {/* Avatars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="flex items-center gap-5 cursor-pointer group">
                    <div className="w-16 h-16 rounded-full bg-[#111118] flex items-center justify-center text-white text-lg font-black shrink-0">AS3</div>
                    <div>
                      <p className="text-sm font-bold text-[#111118]">Foto de Perfil</p>
                      <p className="text-xs font-medium text-gray-400 mt-1">Clique para alterar · 256×256px</p>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-5 cursor-pointer group">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 group-hover:border-[#1d7cf9] group-hover:text-[#1d7cf9] transition-all shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111118]">Logo da Empresa</p>
                      <p className="text-xs font-medium text-gray-400 mt-1">Upload com fundo transparente</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Perfil */}
              <Card>
                <SectionHeader icon={User} label="Informações do Perfil" sub="Seus dados pessoais de acesso" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field icon={User} label="Nome do usuário" placeholder="Ex: João Silva" value={formData.user_name} onChange={(e: any) => setFormData({ ...formData, user_name: e.target.value })} />
                  <Field icon={Globe} label="E-mail corporativo" placeholder="Ex: joao@empresa.com" value={formData.email_corporativo} onChange={(e: any) => setFormData({ ...formData, email_corporativo: e.target.value })} />
                  <Field icon={Smartphone} label="Telefone / WhatsApp" placeholder="(11) 99999-9999" value={formData.phone} onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} />
                  <Field icon={Shield} label="Função" value={formData.role} disabled />
                </div>
              </Card>

              {/* Empresa */}
              <Card>
                <SectionHeader icon={Building2} label="Informações da Empresa" sub="Dados cadastrais do seu negócio" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field icon={Building2} label="Nome / Razão Social" placeholder="Ex: Tech Solutions Ltda" value={formData.nome_empresa} onChange={(e: any) => setFormData({ ...formData, nome_empresa: e.target.value })} />
                  <Field icon={Shield} label="CNPJ / Documento" placeholder="00.000.000/0001-00" value={formData.cnpj} onChange={(e: any) => setFormData({ ...formData, cnpj: e.target.value })} />
                  <div className="md:col-span-2">
                    <Field icon={Globe} label="Endereço completo" placeholder="Ex: Rua Exemplo, 123 — Centro" value={formData.address} onChange={(e: any) => setFormData({ ...formData, address: e.target.value })} />
                  </div>
                  <Field icon={Terminal} label="Segmento" placeholder="Ex: Tecnologia e Software" value={formData.segment} onChange={(e: any) => setFormData({ ...formData, segment: e.target.value })} />
                  <Field icon={Globe} label="Website" placeholder="www.empresa.com.br" value={formData.website} onChange={(e: any) => setFormData({ ...formData, website: e.target.value })} />
                </div>
              </Card>
            </>
          )}

          {/* ── NOTIFICAÇÕES ── */}
          {activeSection === 'notificacoes' && (
            <>
              <Card>
                <SectionHeader icon={Globe} label="Canais de Recebimento" sub="Onde você deseja receber seus alertas" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'email', label: 'E-mail', desc: 'Alertas detalhados por e-mail', icon: Globe, active: true },
                    { id: 'whatsapp', label: 'WhatsApp', desc: 'Mensagens rápidas no celular', icon: Smartphone, active: false },
                    { id: 'dashboard', label: 'Dashboard', desc: 'Notificações internas no CRM', icon: Bell, active: true },
                  ].map((ch) => (
                    <div key={ch.id} className="p-5 rounded-[24px] bg-gray-50 border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", ch.active ? "bg-blue-50 text-[#1d7cf9]" : "bg-gray-100 text-gray-400")}>
                          <ch.icon className="w-5 h-5" />
                        </div>
                        <div className={cn("w-11 h-6 rounded-full relative transition-colors duration-300", ch.active ? "bg-[#1d7cf9]" : "bg-gray-200")}>
                          <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300", ch.active ? "right-1" : "left-1")} />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-[#111118]">{ch.label}</p>
                      <p className="text-xs font-medium text-gray-400 mt-1">{ch.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <SectionHeader icon={Terminal} label="Alertas de Produção" sub="Controle de prazos e fluxo" />
                  <div className="space-y-3">
                    {[
                      { label: 'Atraso na Produção', desc: 'Veículo exceder prazo da etapa', active: true },
                      { label: 'Check-out de Etapa', desc: 'Veículo mudar de setor', active: false },
                    ].map((a, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-[20px] bg-gray-50 border border-gray-100 hover:bg-white hover:border-gray-200 transition-all cursor-pointer">
                        <div>
                          <p className="text-sm font-bold text-[#111118]">{a.label}</p>
                          <p className="text-xs font-medium text-gray-400 mt-0.5">{a.desc}</p>
                        </div>
                        <div className={cn("w-11 h-6 rounded-full relative ml-4 shrink-0 transition-colors", a.active ? "bg-[#1d7cf9]" : "bg-gray-200")}>
                          <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", a.active ? "right-1" : "left-1")} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <SectionHeader icon={Database} label="Alertas Financeiros" sub="Gestão de recebíveis" />
                  <div className="space-y-3">
                    <div className="p-4 rounded-[20px] bg-gray-50 border border-gray-100 hover:bg-white hover:border-gray-200 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#111118]">Pagamentos a Vencer</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-bold text-gray-400">Avisar:</span>
                            <select className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#111118] focus:outline-none focus:ring-2 focus:ring-[#1d7cf9]/20 cursor-pointer">
                              <option>2 dias antes</option>
                              <option>5 dias antes</option>
                            </select>
                          </div>
                        </div>
                        <div className="w-11 h-6 rounded-full bg-[#1d7cf9] relative ml-4 shrink-0">
                          <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-[20px] bg-gray-50 border border-gray-100 hover:bg-white hover:border-gray-200 transition-all cursor-pointer">
                      <div>
                        <p className="text-sm font-bold text-[#111118]">Inadimplência</p>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">Notificar parcelas atrasadas</p>
                      </div>
                      <div className="w-11 h-6 rounded-full bg-[#1d7cf9] relative ml-4 shrink-0">
                        <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* ── SEGURANÇA ── */}
          {activeSection === 'seguranca' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 mb-5">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#111118] tracking-tight">Senha de Acesso</h3>
                  <p className="text-[13px] font-black uppercase tracking-widest text-gray-400 mt-1 mb-6">Última alteração: 3 meses atrás</p>
                  <button className="w-full py-3.5 rounded-2xl border border-gray-200 text-sm font-bold text-[#111118] hover:bg-gray-50 hover:border-gray-300 transition-all">
                    Redefinir Senha
                  </button>
                </Card>

                <Card>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1d7cf9]">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="w-11 h-6 rounded-full bg-gray-200 relative cursor-pointer hover:bg-gray-300 transition-colors">
                      <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#111118] tracking-tight">2FA</h3>
                  <p className="text-[13px] font-black uppercase tracking-widest text-gray-400 mt-1 mb-5">Autenticação em duas etapas</p>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-amber-700">Recomendado: Ative para maior proteção da sua conta.</p>
                  </div>
                </Card>
              </div>

              <Card>
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100">
                  <div>
                    <h3 className="text-xl font-bold text-[#111118] tracking-tight">Dispositivos Conectados</h3>
                    <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1d7cf9] animate-pulse" />
                      Sessões ativas na sua conta
                    </p>
                  </div>
                  <button className="text-xs font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">Sair de todos</button>
                </div>
                <div className="space-y-3">
                  {[
                    { device: 'MacBook Pro 14"', meta: 'Google Chrome · São Paulo, BR', active: true, isPhone: false },
                    { device: 'iPhone 15 Pro Max', meta: 'App CRM Mateus · São Paulo, BR', active: false, isPhone: true },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-[20px] bg-gray-50 border border-gray-100 hover:bg-white hover:border-gray-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#1d7cf9] transition-colors">
                          {d.isPhone ? <Smartphone className="w-5 h-5" /> : <Terminal className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#111118]">{d.device}</p>
                          <p className="text-xs font-medium text-gray-400 mt-0.5">{d.meta}</p>
                        </div>
                      </div>
                      {d.active ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ativo Agora
                        </span>
                      ) : (
                        <button className="text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                          Sair da Sessão
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* ── EQUIPE ── */}
          {activeSection === 'equipe' && (
            <>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#111118] tracking-tight">Gestão de Equipe</h3>
                    <p className="text-sm font-medium text-gray-500 mt-1">Administre acessos e funções dos membros</p>
                  </div>
                  <button className="bg-[#1C1C1E] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all active:scale-95">
                    <UserPlus className="w-4 h-4" />
                    Novo Membro
                  </button>
                </div>
              </Card>

              <Card className="p-0 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="px-8 py-5 text-[13px] font-black uppercase tracking-widest text-gray-400">Membro do Time</th>
                      <th className="px-8 py-5 text-[13px] font-black uppercase tracking-widest text-gray-400">Nível de Acesso</th>
                      <th className="px-8 py-5 text-[13px] font-black uppercase tracking-widest text-gray-400 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { name: 'Eliezer', role: 'Administrador Global', initial: 'E', email: 'eliezer@mateus.com' },
                      { name: 'Zeca', role: 'Administrador Global', initial: 'Z', email: 'zeca@mateus.com' },
                    ].map((m, i) => (
                      <tr key={i} className="group hover:bg-gray-50/40 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1d7cf9] text-sm font-black">
                              {m.initial}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#111118]">{m.name}</p>
                              <p className="text-xs font-medium text-gray-400 mt-0.5">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-[13px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">
                            {m.role}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-[#1d7cf9] transition-colors"><Smartphone className="w-4 h-4" /></button>
                            <button className="p-2 rounded-xl hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"><Database className="w-4 h-4" /></button>
                            <button className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Shield className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
