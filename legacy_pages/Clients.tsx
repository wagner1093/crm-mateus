import React, { useState, useEffect } from 'react';
import { Plus, Search, UserPlus, Trash2, Edit2, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nome: '', tipo: 'PJ' });

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('crmmateus_clientes')
      .select('*')
      .order('nome', { ascending: true });
    if (!error) setClients(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('crmmateus_clientes').insert([formData]);
    if (!error) {
      setIsModalOpen(false);
      setFormData({ nome: '', tipo: 'PJ' });
      fetchClients();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este cliente?')) {
      await supabase.from('crmmateus_clientes').delete().eq('id', id);
      fetchClients();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Clientes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gerenciamento da sua base de contatos.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={20} /> Novo Cliente
        </button>
      </header>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou tipo..." 
            style={{ width: '100%', padding: '12px 12px 12px 44px', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {loading ? (
          <p>Carregando...</p>
        ) : clients.filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase())).map(client => (
          <div key={client.id} className="fin-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="fin-icon-box" style={{ background: '#f1f5f9', color: '#64748b' }}>
                  <User size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{client.nome}</h3>
                  <span className={`badge ${client.tipo === 'PJ' ? 'badge-primary' : 'badge-warning'}`}>
                    {client.tipo}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn-icon" style={{ color: '#94a3b8' }}><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(client.id)} className="btn-icon" style={{ color: '#f43f5e' }}><Trash2 size={18} /></button>
              </div>
            </div>
            
            <div style={{ display: 'flex', width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: '12px', justifyContent: 'space-between', fontSize: '0.875rem' }}>
               <span style={{ color: '#94a3b8' }}>Status: <span style={{ color: '#10b981', fontWeight: 600 }}>Ativo</span></span>
               <Link to={`/financeiro?cliente=${client.id}`} style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>Ver Extrato</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Cliente */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel modal-content"
              style={{ maxWidth: '450px' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Novo Cliente</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Nome do Cliente / Empresa</label>
                  <input type="text" placeholder="Ex: João Silva ou Empresa LTDA" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Tipo de Cliente</label>
                  <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} required>
                    <option value="PJ">Pessoa Jurídica (PJ)</option>
                    <option value="PF">Pessoa Física (PF)</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                  Cadastrar Cliente
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
