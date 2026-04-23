import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, Calendar, CheckCircle2, Clock, X, DollarSign, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    cliente_id: '',
    valor_total: '',
    status: 'EM ANDAMENTO'
  });

  const fetchData = async () => {
    setLoading(true);
    const [projRes, cliRes] = await Promise.all([
      supabase.from('crmmateus_projetos').select('*, crmmateus_clientes(nome)').order('created_at', { ascending: false }),
      supabase.from('crmmateus_clientes').select('id, nome').order('nome', { ascending: true })
    ]);
    
    if (!projRes.error) setProjects(projRes.data || []);
    if (!cliRes.error) setClients(cliRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('crmmateus_projetos').insert([{
      ...formData,
      valor_total: Number(formData.valor_total)
    }]);
    
    if (!error) {
      setIsModalOpen(false);
      setFormData({ nome: '', cliente_id: '', valor_total: '', status: 'EM ANDAMENTO' });
      fetchData();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Projetos</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Controle de cronogramas e orçamentos.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Novo Projeto
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {loading ? (
          <p>Carregando...</p>
        ) : projects.map(project => (
          <div key={project.id} className="fin-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="fin-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{project.nome}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.875rem' }}>
                    <User size={14} /> {project.crmmateus_clientes?.nome || 'Cliente não vinculado'}
                  </div>
                </div>
              </div>
              <span className={`badge ${project.status === 'FINALIZADO' ? 'badge-success' : 'badge-warning'}`}>
                {project.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                 <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Valor do Contrato</p>
                 <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>
                   R$ {Number(project.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                 </p>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Calendar size={18} color="#94a3b8" />
                 <div>
                   <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Criado em</p>
                   <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{new Date(project.created_at).toLocaleDateString('pt-BR')}</p>
                 </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
               <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem' }}>Ver Detalhes</button>
               <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem', color: '#10b981' }}>Financeiro</button>
            </div>
          </div>
        ))}

        {projects.length === 0 && !loading && (
          <div className="glass-panel" style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center' }}>
            <Briefcase size={48} style={{ color: '#e2e8f0', marginBottom: '16px' }} />
            <h3 style={{ color: '#64748b' }}>Nenhum projeto encontrado</h3>
            <p style={{ color: '#94a3b8' }}>Comece criando seu primeiro projeto para gerenciar suas entregas.</p>
            <button className="btn-primary" style={{ marginTop: '24px', marginInline: 'auto' }} onClick={() => setIsModalOpen(true)}>
              Criar Projeto
            </button>
          </div>
        )}
      </div>

      {/* Modal Novo Projeto */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel modal-content"
              style={{ maxWidth: '500px' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Novo Projeto</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Nome do Projeto</label>
                  <input type="text" placeholder="Ex: Reforma Residencial..." value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Cliente</label>
                  <select value={formData.cliente_id} onChange={e => setFormData({...formData, cliente_id: e.target.value})} required>
                    <option value="">Selecione um cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Valor Total (R$)</label>
                  <input type="number" step="0.01" placeholder="0,00" value={formData.valor_total} onChange={e => setFormData({...formData, valor_total: e.target.value})} required />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                  Criar Projeto
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
