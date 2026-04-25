'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Mail, Phone, Shield, MoreHorizontal, 
  CheckCircle2, X, Plus, Search, Filter, Trash2,
  Lock, Globe, ShieldCheck, MailPlus, User, Clock,
  Check, ShieldAlert, Briefcase, Pencil, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { createPortal } from 'react-dom';

// ── MemberModal (Create) ──────────────────────────────────────────────────────
function MemberModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Vendedor',
    permissions: 'Acesso Padrão',
    status: 'Offline',
    access_level: 'user'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('crmmateus_equipe')
        .insert([{ ...formData, created_at: new Date().toISOString() }]);

      if (error) throw error;
      toast.success('Membro convidado com sucesso!');
      onSuccess();
      onClose();
      setFormData({ name: '', email: '', role: 'Vendedor', permissions: 'Acesso Padrão', status: 'Offline', access_level: 'user' });
    } catch (err) {
      toast.error('Erro ao convidar membro.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const lbl = "text-[13px] font-bold text-[#64748B] mb-2 block font-dmsans uppercase tracking-wide";
  const inI = "w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-dmsans placeholder:text-gray-400";

  if (typeof window === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[640px] bg-white shadow-2xl rounded-[40px] overflow-hidden z-[10000] flex flex-col p-2"
            style={{ maxHeight: '95vh' }}
          >
            <div className="px-10 py-10 flex items-center justify-between bg-white">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Novo Membro</h3>
                  <p className="text-sm text-gray-400 font-medium mt-1">Convide um novo membro para sua equipe.</p>
                </div>
              </div>
              <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-10 pb-10 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={lbl}>Nome Completo *</label>
                  <div className="relative group">
                    <input required type="text" className={inI + " pl-14"} placeholder="Ex: Pedro Santos"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className={lbl}>E-mail de Acesso *</label>
                  <div className="relative group">
                    <input required type="email" className={inI + " pl-14"} placeholder="email@empresa.com"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Cargo / Função</label>
                  <div className="relative group">
                    <input type="text" className={inI + " pl-14"} placeholder="Ex: Vendedor"
                      value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                    <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Nível de Acesso</label>
                  <select className={inI + " appearance-none cursor-pointer"}
                    value={formData.access_level} onChange={e => setFormData({...formData, access_level: e.target.value})}>
                    <option value="user">Usuário Padrão</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={lbl}>Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Online', 'Offline'].map(s => (
                      <button key={s} type="button"
                        onClick={() => setFormData({...formData, status: s})}
                        className={cn('py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2',
                          formData.status === s
                            ? s === 'Online' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-gray-800 text-white border-gray-800'
                            : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'
                        )}>
                        <div className={cn('w-2 h-2 rounded-full', s === 'Online' ? 'bg-white' : 'bg-gray-400')} />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-10">
                <button type="button" onClick={onClose}
                  className="px-10 py-5 rounded-[24px] bg-gray-50 text-gray-500 text-[13px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="px-10 py-5 rounded-[24px] bg-[#007AFF] text-white text-[13px] font-bold uppercase tracking-widest hover:bg-[#0066EE] shadow-xl shadow-blue-100 transition-all disabled:opacity-50 flex-[2] flex items-center justify-center gap-3">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-5 h-5" /><span>Enviar Convite</span></>}
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

// ── ManageAccessModal ─────────────────────────────────────────────────────────
function ManageAccessModal({ member, onClose, onSuccess }: { member: any; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: member.name || '',
    role: member.role || '',
    access_level: member.access_level || 'user',
    status: member.status || 'Offline',
    permissions: member.permissions || 'Acesso Padrão',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('crmmateus_equipe').update(formData).eq('id', member.id);
      if (error) throw error;
      toast.success('Membro atualizado!');
      onSuccess();
      onClose();
    } catch {
      toast.error('Erro ao atualizar membro.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Remover ${member.name} da equipe?`)) return;
    try {
      const { error } = await supabase.from('crmmateus_equipe').delete().eq('id', member.id);
      if (error) throw error;
      toast.success('Membro removido!');
      onSuccess();
      onClose();
    } catch {
      toast.error('Erro ao remover membro.');
    }
  };

  const lbl = "text-[13px] font-bold text-[#64748B] mb-2 block font-dmsans uppercase tracking-wide";
  const inI = "w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-dmsans placeholder:text-gray-400";

  if (typeof window === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[560px] bg-white shadow-2xl rounded-[40px] overflow-hidden z-[10000] flex flex-col p-2"
        style={{ maxHeight: '90vh' }}
      >
        <div className="px-10 py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
              className="w-14 h-14 rounded-2xl border-2 border-gray-100" alt={member.name} />
            <div>
              <h3 className="text-xl font-black text-gray-900">{member.name}</h3>
              <p className="text-xs text-gray-400 font-medium">{member.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="px-10 pb-10 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Nome</label>
              <input type="text" className={inI} value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} />
            </div>
            <div>
              <label className={lbl}>Cargo</label>
              <input type="text" className={inI} value={formData.role} onChange={e => setFormData(f => ({...f, role: e.target.value}))} />
            </div>
          </div>

          <div>
            <label className={lbl}>Nível de Acesso</label>
            <div className="grid grid-cols-2 gap-3">
              {[{ val: 'user', label: 'Usuário Padrão', icon: User }, { val: 'admin', label: 'Administrador', icon: ShieldCheck }].map(opt => (
                <button key={opt.val} type="button"
                  onClick={() => setFormData(f => ({...f, access_level: opt.val}))}
                  className={cn('py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2',
                    formData.access_level === opt.val ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'
                  )}>
                  <opt.icon className="w-3.5 h-3.5" />{opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={lbl}>Status</label>
            <div className="grid grid-cols-2 gap-3">
              {['Online', 'Offline'].map(s => (
                <button key={s} type="button"
                  onClick={() => setFormData(f => ({...f, status: s}))}
                  className={cn('py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2',
                    formData.status === s
                      ? s === 'Online' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-gray-700 text-white border-gray-700'
                      : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'
                  )}>
                  <div className={cn('w-2 h-2 rounded-full', s === 'Online' ? 'bg-white' : 'bg-gray-400')} />
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleDelete}
              className="px-6 py-4 rounded-2xl bg-rose-50 text-rose-500 text-[12px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Remover
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-4 rounded-2xl bg-gray-900 text-white text-[12px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Salvar Alterações</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}

export default function EquipePage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [managingMember, setManagingMember] = useState<any>(null);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crmmateus_equipe')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMembers(data || []);
    } catch {
      toast.error('Erro ao carregar equipe.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [...new Set(members.map(m => m.role).filter(Boolean))];

  const filteredMembers = members.filter(m =>
    (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filterRole || m.role === filterRole)
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-400 bg-clip-text text-transparent font-heading">
            Equipe
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">Gerencie os membros da sua agência e suas permissões.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1C1C1E] text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Convidar Membro</span>
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white/50 p-2 rounded-[2rem] border border-white/20">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome, cargo ou e-mail..." 
            className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] bg-white border-none text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/10 shadow-sm placeholder:text-gray-300 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilter(p => !p)}
            className={cn('flex items-center gap-2 px-6 py-4 rounded-[1.5rem] border text-[12px] font-black uppercase tracking-widest transition-all shadow-sm',
              showFilter || filterRole ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-100 text-gray-400 hover:text-gray-900'
            )}>
            <Filter className="w-4 h-4" />
            <span>Filtros{filterRole ? ` (${filterRole})` : ''}</span>
          </button>
          {showFilter && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50 flex flex-col gap-1 min-w-[160px]">
              <button onClick={() => { setFilterRole(null); setShowFilter(false); }}
                className={cn('text-left px-4 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all', !filterRole ? 'bg-gray-900 text-white' : 'hover:bg-gray-50 text-gray-600')}>
                Todos
              </button>
              {roles.map(r => (
                <button key={r} onClick={() => { setFilterRole(r); setShowFilter(false); }}
                  className={cn('text-left px-4 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all', filterRole === r ? 'bg-gray-900 text-white' : 'hover:bg-gray-50 text-gray-600')}>
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-50 rounded-[3rem] animate-pulse" />
          ))
        ) : filteredMembers.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[3rem] flex items-center justify-center mx-auto mb-6">
              <UserPlus className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em]">Nenhum membro encontrado</p>
          </div>
        ) : (
          filteredMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-gray-100 rounded-[3rem] p-10 group hover:shadow-2xl hover:shadow-gray-200/50 hover:translate-y-[-8px] transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gray-50 rounded-full -mr-20 -mt-20 group-hover:bg-blue-50/50 transition-colors duration-500" />
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="relative">
                  <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-100 group-hover:scale-110 transition-transform duration-700 ease-out">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt={member.name} />
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-colors duration-300",
                    member.status === 'Online' ? "bg-green-500" : "bg-gray-300"
                  )}>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
                <button
                  onClick={() => setManagingMember(member)}
                  className="p-3 rounded-2xl hover:bg-gray-50 text-gray-300 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                  title="Gerenciar Acessos"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 relative z-10">
                <h3 className="text-2xl font-black text-gray-900 font-heading leading-tight group-hover:text-blue-600 transition-colors">{member.name}</h3>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-[0.2em] border border-blue-100/50">
                    {member.role}
                  </span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-gray-300" /> {member.access_level === 'admin' ? 'Admin' : 'Usuário'}
                  </span>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-gray-50 space-y-4 relative z-10">
                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors cursor-pointer group/item">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 group-hover/item:bg-blue-50 transition-colors flex items-center justify-center">
                    <Mail className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                  </div>
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>Desde {new Date(member.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <button
                onClick={() => setManagingMember(member)}
                className="w-full mt-10 py-5 rounded-[2rem] bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3 group/btn"
              >
                <span>Gerenciar Acessos</span>
                <Globe className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <MemberModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={fetchMembers} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {managingMember && (
          <ManageAccessModal
            member={managingMember}
            onClose={() => setManagingMember(null)}
            onSuccess={fetchMembers}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
