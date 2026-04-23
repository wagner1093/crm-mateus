import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, TrendingUp, TrendingDown, Trash2, Calendar, 
  Filter, CheckCircle2, AlertCircle, FileText, Download, X,
  PieChart as PieIcon, BarChart as BarIcon, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, Edit2, Wallet, CreditCard, Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

export default function Transactions() {
  const [activeTab, setActiveTab] = useState<'Todos' | 'Receitas' | 'Despesas' | 'Relatórios'>('Todos');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    tipo: 'IN' as 'IN' | 'OUT',
    descricao: '',
    valor_previsto: '',
    data_lancamento: new Date().toISOString().split('T')[0],
    status: 'PENDENTE',
    categoria: 'PJ',
    cliente_id: '',
    projeto_id: '',
    payment_method: 'PIX',
    parcelas: '1'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [transRes, clientRes, projRes] = await Promise.all([
      supabase.from('crmmateus_transacoes').select('*, crmmateus_clientes(nome), crmmateus_projetos(nome)').order('data_lancamento', { ascending: false }),
      supabase.from('crmmateus_clientes').select('*').order('nome'),
      supabase.from('crmmateus_projetos').select('*').order('nome')
    ]);

    if (transRes.data) setTransactions(transRes.data);
    if (clientRes.data) setClients(clientRes.data);
    if (projRes.data) setProjects(projRes.data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const numParcelas = parseInt(formData.parcelas) || 1;
    const valorTotal = parseFloat(formData.valor_previsto);
    const valorParcela = valorTotal / numParcelas;
    const baseDate = new Date(formData.data_lancamento);
    
    const inserts = [];
    for (let i = 0; i < numParcelas; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      inserts.push({
        tipo: formData.tipo,
        descricao: numParcelas > 1 ? `${formData.descricao} (${i + 1}/${numParcelas})` : formData.descricao,
        valor_previsto: valorParcela,
        valor_realizado: formData.status === 'RECEBIDO' || formData.status === 'PAGO' ? valorParcela : 0,
        data_lancamento: dueDate.toISOString().split('T')[0],
        status: formData.status,
        categoria: formData.categoria,
        cliente_id: formData.cliente_id || null,
        projeto_id: formData.projeto_id || null,
        payment_method: formData.payment_method,
        installment_number: i + 1,
        total_installments: numParcelas
      });
    }

    const { error } = await supabase.from('crmmateus_transacoes').insert(inserts);
    
    if (!error) {
      setIsModalOpen(false);
      fetchData();
      setFormData({
        tipo: 'IN',
        descricao: '',
        valor_previsto: '',
        data_lancamento: new Date().toISOString().split('T')[0],
        status: 'PENDENTE',
        categoria: 'PJ',
        cliente_id: '',
        projeto_id: '',
        payment_method: 'PIX',
        parcelas: '1'
      });
    }
    setSaving(false);
  };

  const deleteTransaction = async (id: string) => {
    if (window.confirm('Excluir este lançamento?')) {
      await supabase.from('crmmateus_transacoes').delete().eq('id', id);
      fetchData();
    }
  };

  const updateStatus = async (id: string, currentStatus: string, tipo: string, valor: number) => {
    let newStatus = '';
    let valor_realizado = 0;
    
    if (tipo === 'IN') {
      newStatus = currentStatus === 'RECEBIDO' ? 'PENDENTE' : 'RECEBIDO';
      valor_realizado = newStatus === 'RECEBIDO' ? valor : 0;
    } else {
      newStatus = currentStatus === 'PAGO' ? 'PENDENTE' : 'PAGO';
      valor_realizado = newStatus === 'PAGO' ? valor : 0;
    }
    
    await supabase.from('crmmateus_transacoes')
      .update({ status: newStatus, valor_realizado })
      .eq('id', id);
    fetchData();
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesTab = 
      activeTab === 'Todos' || 
      (activeTab === 'Receitas' && t.tipo === 'IN') || 
      (activeTab === 'Despesas' && t.tipo === 'OUT');
    
    const matchesSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    return activeTab === 'Relatórios' ? true : (matchesTab && matchesSearch);
  });

  const stats = {
    totalIn: transactions.filter(t => t.tipo === 'IN').reduce((s, t) => s + Number(t.valor_previsto), 0),
    totalOut: transactions.filter(t => t.tipo === 'OUT').reduce((s, t) => s + Number(t.valor_previsto), 0),
    paidIn: transactions.filter(t => t.tipo === 'IN' && t.status === 'RECEBIDO').reduce((s, t) => s + Number(t.valor_realizado), 0),
    paidOut: transactions.filter(t => t.tipo === 'OUT' && t.status === 'PAGO').reduce((s, t) => s + Number(t.valor_realizado), 0),
  };

  const liquidResult = stats.totalIn - stats.totalOut;

  // Data for Charts
  const chartDataRaw = transactions.reduce((acc: any, t) => {
    const date = new Date(t.data_lancamento).toLocaleDateString('pt-BR', { month: 'short' });
    if (!acc[date]) acc[date] = { name: date, receita: 0, despesa: 0 };
    if (t.tipo === 'IN') acc[date].receita += Number(t.valor_previsto);
    else acc[date].despesa += Number(t.valor_previsto);
    return acc;
  }, {});
  
  const chartData = Object.values(chartDataRaw).slice(-12);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Financeiro</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gestão inteligente de fluxo de caixa e resultados</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={20} /> Novo Lançamento
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div className="fin-stat-card">
          <div className="fin-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Total Receitas</p>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b' }}>R$ {stats.totalIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="fin-stat-card">
          <div className="fin-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Recebido</p>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b' }}>R$ {stats.paidIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="fin-stat-card">
          <div className="fin-icon-box" style={{ background: '#fff1f2', color: '#f43f5e' }}>
            <TrendingDown size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Total Despesas</p>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b' }}>R$ {stats.totalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="fin-stat-card">
          <div className="fin-icon-box" style={{ background: liquidResult >= 0 ? '#ecfdf5' : '#fff1f2', color: liquidResult >= 0 ? '#10b981' : '#f43f5e' }}>
            <Wallet size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Resultado Líquido</p>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b' }}>R$ {liquidResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="fin-tab-container">
          {(['Todos', 'Receitas', 'Despesas', 'Relatórios'] as const).map(tab => (
            <button 
              key={tab}
              className={`fin-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab !== 'Relatórios' && (
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Buscar descrição ou categoria..." 
              className="form-group"
              style={{ width: '100%', paddingLeft: '40px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'Relatórios' ? (
          <motion.div 
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}
          >
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarIcon size={20} color="var(--success)" /> Fluxo de Caixa Mensal
              </h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                      itemStyle={{ fontWeight: 600 }}
                    />
                    <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="despesa" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '24px' }}>Status dos Recebíveis</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Em Dia</span>
                  <span style={{ fontWeight: 700 }}>{transactions.filter(t => t.tipo === 'IN' && t.status === 'RECEBIDO').length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Pendentes</span>
                  <span style={{ fontWeight: 700 }}>{transactions.filter(t => t.tipo === 'IN' && t.status === 'PENDENTE').length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Atrasados</span>
                  <span style={{ fontWeight: 700 }}>{transactions.filter(t => t.tipo === 'IN' && t.status === 'ATRASADO').length}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '24px' }}>DRE Simplificado</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 0', color: '#64748b' }}>Receita Bruta</td>
                    <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>R$ {stats.totalIn.toLocaleString('pt-BR')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 0', color: '#64748b' }}>(-) Despesas</td>
                    <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 700, color: '#f43f5e' }}>- R$ {stats.totalOut.toLocaleString('pt-BR')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '16px 0', fontWeight: 700 }}>Resultado Líquido</td>
                    <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 700, color: liquidResult >= 0 ? '#10b981' : '#f43f5e' }}>R$ {liquidResult.toLocaleString('pt-BR')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {filteredTransactions.map(t => (
              <div key={t.id} className="fin-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="fin-icon-box" style={{ background: t.tipo === 'IN' ? '#ecfdf5' : '#fff1f2', color: t.tipo === 'IN' ? '#10b981' : '#f43f5e' }}>
                    {t.tipo === 'IN' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {t.descricao}
                      {t.status === 'ATRASADO' && <span className="badge badge-danger">ATRASADO</span>}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '8px' }}>
                      <span>{t.categoria}</span> • <span>{t.payment_method}</span> • <span>Vence {new Date(t.data_lancamento).toLocaleDateString('pt-BR')}</span>
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: t.tipo === 'IN' ? '#10b981' : '#f43f5e' }}>
                      {t.tipo === 'OUT' ? '-' : ''} R$ {Number(t.valor_previsto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => updateStatus(t.id, t.status, t.tipo, Number(t.valor_previsto))}
                      className={`badge ${t.status === 'RECEBIDO' || t.status === 'PAGO' ? 'badge-success' : 'badge-warning'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {t.status === 'RECEBIDO' || t.status === 'PAGO' ? 'PAGO' : 'PENDENTE'}
                    </button>
                    <button onClick={() => deleteTransaction(t.id)} className="btn-icon" style={{ color: '#94a3b8' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <Receipt size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                <p>Nenhum lançamento encontrado para os filtros selecionados.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Novo Lançamento */}
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
                <h2 style={{ fontSize: '1.5rem' }}>Novo Lançamento</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Tipo de Lançamento</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, tipo: 'IN'})}
                      style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: formData.tipo === 'IN' ? '#ecfdf5' : 'white', color: formData.tipo === 'IN' ? '#10b981' : '#64748b', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Receita
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, tipo: 'OUT'})}
                      style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: formData.tipo === 'OUT' ? '#fff1f2' : 'white', color: formData.tipo === 'OUT' ? '#f43f5e' : '#64748b', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Despesa
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Descrição</label>
                  <input 
                    required
                    type="text" 
                    value={formData.descricao}
                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Ex: Pagamento Mensalidade"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Valor Total</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={formData.valor_previsto}
                      onChange={e => setFormData({...formData, valor_previsto: e.target.value})}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Data</label>
                    <input 
                      required
                      type="date" 
                      value={formData.data_lancamento}
                      onChange={e => setFormData({...formData, data_lancamento: e.target.value})}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Categoria</label>
                    <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                      <option value="PJ">PJ</option>
                      <option value="MÃO DE OBRA">Mão de Obra</option>
                      <option value="MATERIAL">Material</option>
                      <option value="ALUGUEL">Aluguel</option>
                      <option value="OUTROS">Outros</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Método</label>
                    <select value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
                      <option value="PIX">PIX</option>
                      <option value="BOLETO">Boleto</option>
                      <option value="CARTÃO">Cartão</option>
                      <option value="DINHEIRO">Dinheiro</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Cliente (Opcional)</label>
                    <select value={formData.cliente_id} onChange={e => setFormData({...formData, cliente_id: e.target.value})}>
                      <option value="">Nenhum</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Projeto (Opcional)</label>
                    <select value={formData.projeto_id} onChange={e => setFormData({...formData, projeto_id: e.target.value})}>
                      <option value="">Nenhum</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  {saving ? 'Salvando...' : 'Salvar Lançamento'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
