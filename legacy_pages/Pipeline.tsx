import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, X, Trash2, 
  Briefcase, DollarSign, MoreVertical, Check, Filter, Calendar, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const STAGES = [
  { id: 'LEAD', title: 'Novos Leads', color: '#6366f1' },
  { id: 'CONTATO', title: 'Em Contato', color: '#3b82f6' },
  { id: 'PROPOSTA', title: 'Proposta Enviada', color: '#8b5cf6' },
  { id: 'NEGOCIACAO', title: 'Negociação', color: '#f59e0b' },
  { id: 'FECHADO', title: 'Ganho', color: '#10b981' }
];

export default function Pipeline() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [movingLeadId, setMovingLeadId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome_lead: '',
    empresa: '',
    valor_estimado: '',
    estagio: 'LEAD',
    prioridade: 'MEDIA',
    contato: '',
    observacoes: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('crmmateus_pipeline')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setLeads(data || []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('crmmateus_pipeline').insert([{
      ...formData,
      valor_estimado: parseFloat(formData.valor_estimado) || 0
    }]);

    if (!error) {
      setIsModalOpen(false);
      fetchLeads();
      setFormData({
        nome_lead: '',
        empresa: '',
        valor_estimado: '',
        estagio: 'LEAD',
        prioridade: 'MEDIA',
        contato: '',
        observacoes: ''
      });
    }
    setSaving(false);
  };

  const moveLead = async (id: string, newStage: string) => {
    const { error } = await supabase
      .from('crmmateus_pipeline')
      .update({ estagio: newStage, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (!error) fetchLeads();
    setMovingLeadId(null);
  };

  const deleteLead = async (id: string) => {
    if (window.confirm('Excluir este lead definitivamente?')) {
      await supabase.from('crmmateus_pipeline').delete().eq('id', id);
      fetchLeads();
    }
  };

  const stats = useMemo(() => {
    const total = leads.reduce((acc, curr) => acc + (Number(curr.valor_estimado) || 0), 0);
    const count = leads.length;
    const won = leads.filter(l => l.estagio === 'FECHADO').reduce((acc, curr) => acc + (Number(curr.valor_estimado) || 0), 0);
    return { total, count, won };
  }, [leads]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Pipeline de Vendas</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Acompanhe suas oportunidades de negócio.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} color="#10b981" />
              <span style={{ fontWeight: 700, color: '#1e293b' }}>Total: R$ {stats.total.toLocaleString('pt-BR')}</span>
           </div>
           <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
             <Plus size={20} /> Adicionar Lead
           </button>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="kanban-container" style={{ 
        display: 'flex', 
        gap: '24px', 
        overflowX: 'auto', 
        paddingBottom: '24px',
        minHeight: 'calc(100vh - 250px)'
      }}>
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.estagio === stage.id && 
            (l.nome_lead.toLowerCase().includes(searchTerm.toLowerCase()) || 
             l.empresa.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          const stageValue = stageLeads.reduce((acc, curr) => acc + (Number(curr.valor_estimado) || 0), 0);

          return (
            <div key={stage.id} className="kanban-column" style={{ 
              minWidth: '320px', 
              flex: 1, 
              background: '#f8fafc', 
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingInline: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color }}></div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>{stage.title}</h3>
                  <span style={{ background: '#e2e8f0', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {stageLeads.length}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  R$ {stageValue.toLocaleString('pt-BR')}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stageLeads.map(lead => (
                  <motion.div 
                    layoutId={lead.id}
                    key={lead.id} 
                    className="fin-item" 
                    style={{ 
                      flexDirection: 'column', 
                      alignItems: 'stretch', 
                      padding: '16px', 
                      cursor: 'grab',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                       <span style={{ fontSize: '0.7rem', fontWeight: 700, color: lead.prioridade === 'ALTA' ? '#f43f5e' : '#64748b', background: lead.prioridade === 'ALTA' ? '#fff1f2' : '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                         {lead.prioridade}
                       </span>
                       <div style={{ position: 'relative' }}>
                          <button onClick={() => setMovingLeadId(movingLeadId === lead.id ? null : lead.id)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                             <MoreVertical size={16} />
                          </button>
                          <AnimatePresence>
                            {movingLeadId === lead.id && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                style={{ position: 'absolute', top: '100%', right: 0, zIndex: 10, background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', minWidth: '180px', overflow: 'hidden' }}
                              >
                                <div style={{ padding: '8px', borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Mover para:</div>
                                {STAGES.filter(s => s.id !== stage.id).map(s => (
                                  <button key={s.id} onClick={() => moveLead(lead.id, s.id)} style={{ width: '100%', padding: '10px 16px', textAlign: 'left', background: 'transparent', border: 'none', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color }}></div>
                                    {s.title}
                                  </button>
                                ))}
                                <button onClick={() => deleteLead(lead.id)} style={{ width: '100%', padding: '10px 16px', textAlign: 'left', background: 'transparent', border: 'none', fontSize: '0.875rem', cursor: 'pointer', color: '#f43f5e', borderTop: '1px solid #f1f5f9' }}>
                                  Excluir Lead
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                       </div>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{lead.nome_lead}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '12px' }}>{lead.empresa}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 700, fontSize: '0.875rem' }}>
                        <DollarSign size={14} /> {Number(lead.valor_estimado).toLocaleString('pt-BR')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.75rem' }}>
                         <Calendar size={12} /> {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {stageLeads.length === 0 && (
                  <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                    Arraste aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Lead */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel modal-content"
              style={{ maxWidth: '600px' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Novo Lead / Oportunidade</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Nome do Contato</label>
                  <input type="text" placeholder="Nome completo..." value={formData.nome_lead} onChange={e => setFormData({...formData, nome_lead: e.target.value})} required />
                </div>

                <div className="form-group">
                  <label>Empresa</label>
                  <input type="text" placeholder="Nome da empresa..." value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} required />
                </div>

                <div className="form-group">
                  <label>Valor Estimado (R$)</label>
                  <input type="number" step="0.01" placeholder="0,00" value={formData.valor_estimado} onChange={e => setFormData({...formData, valor_estimado: e.target.value})} required />
                </div>

                <div className="form-group">
                  <label>Prioridade</label>
                  <select value={formData.prioridade} onChange={e => setFormData({...formData, prioridade: e.target.value})}>
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Canal de Contato</label>
                  <input type="text" placeholder="WhatsApp, Email, etc..." value={formData.contato} onChange={e => setFormData({...formData, contato: e.target.value})} />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Observações</label>
                  <textarea rows={3} placeholder="Detalhes da oportunidade..." value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}></textarea>
                </div>

                <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1', marginTop: '10px' }} disabled={saving}>
                  {saving ? 'Salvando...' : 'Cadastrar Oportunidade'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
