'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Building2, Bell, Shield, Smartphone, Globe,
  Save, AlertCircle, Terminal, Database, CheckCircle2, UserPlus,
  Pencil, X, Check, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { PhoneInput } from '@/components/PhoneInput';
import { DocumentInput } from '@/components/DocumentInput';

const sections = [
  { id: 'geral', label: 'Geral', desc: 'Perfil e empresa', icon: Building2 },
  { id: 'notificacoes', label: 'Notificações', desc: 'Canais e alertas', icon: Bell },
  { id: 'seguranca', label: 'Segurança', desc: 'Proteção e acessos', icon: Shield },
  { id: 'equipe', label: 'Equipe', desc: 'Membros do time', icon: User },
];

type TeamMember = { id: string; name: string; role: string; email: string; status: string; permissions: string; access_level: string; };

export default function ConfigPage() {
  const [activeSection, setActiveSection] = useState('geral');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editForm, setEditForm] = useState<Partial<TeamMember>>({});
  const [savingMember, setSavingMember] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', email: '', role: '', access_level: 'Administrador Global', status: 'Ativo' });
  const [savingNew, setSavingNew] = useState(false);

  useEffect(() => { if (activeSection === 'equipe') fetchMembers(); }, [activeSection]);

  const fetchMembers = async () => {
    const { data } = await supabase.from('crmmateus_equipe').select('*').order('created_at');
    setMembers(data || []);
  };

  const openEdit = (m: TeamMember) => { setEditingMember(m); setEditForm({ name: m.name, role: m.role, email: m.email, access_level: m.access_level, status: m.status }); };

  const handleSaveMember = async () => {
    if (!editingMember) return;
    setSavingMember(true);
    const { error } = await supabase.from('crmmateus_equipe').update(editForm).eq('id', editingMember.id);
    if (error) { toast.error('Erro ao salvar.'); } else { toast.success('Membro atualizado!'); fetchMembers(); setEditingMember(null); }
    setSavingMember(false);
  };

  const handleCreateMember = async () => {
    if (!newForm.name || !newForm.email) { toast.error('Nome e e-mail são obrigatórios.'); return; }
    setSavingNew(true);
    const { error } = await supabase.from('crmmateus_equipe').insert(newForm);
    if (error) { toast.error('Erro ao criar membro: ' + error.message); } else { toast.success('Membro adicionado!'); fetchMembers(); setShowNewModal(false); setNewForm({ name: '', email: '', role: '', access_level: 'Administrador Global', status: 'Ativo' }); }
    setSavingNew(false);
  };
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
                  <div>
                    <label className="block text-[13px] font-black uppercase tracking-widest text-gray-400 mb-2">Telefone / WhatsApp</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <PhoneInput
                        className={cn("w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-base font-medium text-[#111118] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1d7cf9]/20 focus:border-[#1d7cf9] transition-all")}
                        value={formData.phone}
                        onChange={v => setFormData({ ...formData, phone: v })}
                      />
                    </div>
                  </div>
                  <Field icon={Shield} label="Função" value={formData.role} disabled />
                </div>
              </Card>

              {/* Empresa */}
              <Card>
                <SectionHeader icon={Building2} label="Informações da Empresa" sub="Dados cadastrais do seu negócio" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field icon={Building2} label="Nome / Razão Social" placeholder="Ex: Tech Solutions Ltda" value={formData.nome_empresa} onChange={(e: any) => setFormData({ ...formData, nome_empresa: e.target.value })} />
                  <div>
                    <label className="block text-[13px] font-black uppercase tracking-widest text-gray-400 mb-2">CNPJ / Documento</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <DocumentInput
                        type="CNPJ"
                        className={cn("w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-base font-medium text-[#111118] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1d7cf9]/20 focus:border-[#1d7cf9] transition-all")}
                        value={formData.cnpj}
                        onChange={v => setFormData({ ...formData, cnpj: v })}
                      />
                    </div>
                  </div>
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
                  <button onClick={() => setShowNewModal(true)} className="bg-[#1C1C1E] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all active:scale-95">
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
                      <th className="px-8 py-5 text-[13px] font-black uppercase tracking-widest text-gray-400">Status</th>
                      <th className="px-8 py-5 text-[13px] font-black uppercase tracking-widest text-gray-400 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {members.length === 0 ? (
                      <tr><td colSpan={4} className="px-8 py-12 text-center text-sm font-medium text-gray-400">Nenhum membro cadastrado.</td></tr>
                    ) : members.map((m) => (
                      <tr key={m.id} className="group hover:bg-gray-50/40 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1d7cf9] text-sm font-black">
                              {m.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#111118]">{m.name}</p>
                              <p className="text-xs font-medium text-gray-400 mt-0.5">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                            {m.access_level || m.role || '—'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border",
                            m.status === 'Ativo' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-100 text-gray-400 border-gray-200"
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", m.status === 'Ativo' ? "bg-emerald-500" : "bg-gray-400")} />
                            {m.status || 'Ativo'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => openEdit(m)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-[#1d7cf9] hover:border-blue-100 transition-all text-xs font-bold"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              {/* Edit Modal */}
              <AnimatePresence>
                {editingMember && (
                  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingMember(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl z-[10000] overflow-hidden">
                      <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-[#111118]">Editar Membro</h3>
                          <p className="text-xs text-gray-400 mt-0.5">Atualize os dados do membro da equipe</p>
                        </div>
                        <button onClick={() => setEditingMember(null)} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-8 space-y-4">
                        {[
                          { label: 'Nome', key: 'name', placeholder: 'Ex: João Silva' },
                          { label: 'E-mail', key: 'email', placeholder: 'joao@empresa.com' },
                          { label: 'Cargo / Função', key: 'role', placeholder: 'Ex: Vendedor' },
                        ].map(({ label, key, placeholder }) => (
                          <div key={key}>
                            <label className="block text-[12px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</label>
                            <input
                              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-[#111118] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1d7cf9]/20 focus:border-[#1d7cf9] transition-all"
                              placeholder={placeholder}
                              value={(editForm as any)[key] || ''}
                              onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                            />
                          </div>
                        ))}
                        <div>
                          <label className="block text-[12px] font-black uppercase tracking-widest text-gray-400 mb-2">Nível de Acesso</label>
                          <select
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-[#111118] focus:outline-none focus:ring-2 focus:ring-[#1d7cf9]/20 focus:border-[#1d7cf9] transition-all appearance-none"
                            value={editForm.access_level || ''}
                            onChange={e => setEditForm({ ...editForm, access_level: e.target.value })}
                          >
                            <option value="">Selecione...</option>
                            <option value="Administrador Global">Administrador Global</option>
                            <option value="Financeiro">Financeiro</option>
                            <option value="Vendedor">Vendedor</option>
                            <option value="Visualizador">Visualizador</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[12px] font-black uppercase tracking-widest text-gray-400 mb-2">Status</label>
                          <select
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-[#111118] focus:outline-none focus:ring-2 focus:ring-[#1d7cf9]/20 focus:border-[#1d7cf9] transition-all appearance-none"
                            value={editForm.status || 'Ativo'}
                            onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                          >
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                          </select>
                        </div>
                      </div>
                      <div className="px-8 pb-8 flex gap-3">
                        <button onClick={() => setEditingMember(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">
                          Cancelar
                        </button>
                        <button onClick={handleSaveMember} disabled={savingMember} className="flex-[2] py-3 rounded-2xl bg-[#1C1C1E] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50">
                          {savingMember ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" />Salvar Alterações</>}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* New Member Modal */}
              <AnimatePresence>
                {showNewModal && (
                  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewModal(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl z-[10000] overflow-hidden">
                      <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-[#111118]">Novo Membro</h3>
                          <p className="text-xs text-gray-400 mt-0.5">Adicione um novo membro à equipe</p>
                        </div>
                        <button onClick={() => setShowNewModal(false)} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-8 space-y-4">
                        {[
                          { label: 'Nome *', key: 'name', placeholder: 'Ex: João Silva' },
                          { label: 'E-mail *', key: 'email', placeholder: 'joao@empresa.com' },
                          { label: 'Cargo / Função', key: 'role', placeholder: 'Ex: Vendedor' },
                        ].map(({ label, key, placeholder }) => (
                          <div key={key}>
                            <label className="block text-[12px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</label>
                            <input
                              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-[#111118] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1d7cf9]/20 focus:border-[#1d7cf9] transition-all"
                              placeholder={placeholder}
                              value={(newForm as any)[key]}
                              onChange={e => setNewForm({ ...newForm, [key]: e.target.value })}
                            />
                          </div>
                        ))}
                        <div>
                          <label className="block text-[12px] font-black uppercase tracking-widest text-gray-400 mb-2">Nível de Acesso</label>
                          <select className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-[#111118] focus:outline-none focus:ring-2 focus:ring-[#1d7cf9]/20 focus:border-[#1d7cf9] transition-all appearance-none"
                            value={newForm.access_level} onChange={e => setNewForm({ ...newForm, access_level: e.target.value })}>
                            <option value="Administrador Global">Administrador Global</option>
                            <option value="Financeiro">Financeiro</option>
                            <option value="Vendedor">Vendedor</option>
                            <option value="Visualizador">Visualizador</option>
                          </select>
                        </div>
                      </div>
                      <div className="px-8 pb-8 flex gap-3">
                        <button onClick={() => setShowNewModal(false)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">
                          Cancelar
                        </button>
                        <button onClick={handleCreateMember} disabled={savingNew} className="flex-[2] py-3 rounded-2xl bg-[#1C1C1E] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50">
                          {savingNew ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus className="w-4 h-4" />Adicionar Membro</>}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
