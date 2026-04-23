import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Search, 
  Plus,
  Filter,
  Calendar,
  Wallet,
  Users,
  Briefcase
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('crmmateus_transacoes')
        .select('*')
        .order('data_lancamento', { ascending: false });
      
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const stats = useMemo(() => {
    const totalEntries = transactions
      .filter(t => t.tipo === 'IN')
      .reduce((acc, curr) => acc + Number(curr.valor_realizado || 0), 0);
    
    const totalExits = transactions
      .filter(t => t.tipo === 'OUT')
      .reduce((acc, curr) => acc + Number(curr.valor_realizado || 0), 0);

    const balance = totalEntries - totalExits;

    return { totalEntries, totalExits, balance };
  }, [transactions]);

  const chartData = useMemo(() => {
    const grouped = transactions.reduce((acc: any, t) => {
      const date = new Date(t.data_lancamento);
      const month = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      if (!acc[month]) acc[month] = { name: month, entries: 0, exits: 0 };
      if (t.tipo === 'IN') acc[month].entries += Number(t.valor_realizado);
      if (t.tipo === 'OUT') acc[month].exits += Number(t.valor_realizado);
      return acc;
    }, {});
    return Object.values(grouped).reverse().slice(-6);
  }, [transactions]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Bem-vindo ao centro de controle do seu negócio.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              style={{ paddingLeft: '40px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', height: '42px', width: '200px' }}
            />
          </div>
          <button className="btn-primary"><Plus size={20} /> Novo Projeto</button>
        </div>
      </header>

      {/* Main Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <div className="fin-stat-card">
          <div className="fin-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Faturamento Total</p>
            <h3 style={{ fontSize: '1.5rem', color: '#1e293b' }}>R$ {stats.totalEntries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="fin-stat-card">
          <div className="fin-icon-box" style={{ background: '#fff1f2', color: '#f43f5e' }}>
            <ArrowDownRight size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Despesas Totais</p>
            <h3 style={{ fontSize: '1.5rem', color: '#1e293b' }}>R$ {stats.totalExits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="fin-stat-card">
          <div className="fin-icon-box" style={{ background: stats.balance >= 0 ? '#eff6ff' : '#fff1f2', color: stats.balance >= 0 ? '#3b82f6' : '#f43f5e' }}>
            <Wallet size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Saldo Atual</p>
            <h3 style={{ fontSize: '1.5rem', color: '#1e293b' }}>R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Chart Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#10b981" /> Desempenho Financeiro
            </h3>
            <select style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 8px', fontSize: '0.875rem' }}>
              <option>Últimos 6 meses</option>
              <option>Últimos 12 meses</option>
            </select>
          </div>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="entries" stroke="#10b981" fillOpacity={1} fill="url(#colorEntries)" strokeWidth={3} />
                <Area type="monotone" dataKey="exits" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExits)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Links Rápidos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/financeiro" className="nav-item">
                <Wallet size={18} /> <span>Ver Financeiro</span>
              </Link>
              <Link to="/projetos" className="nav-item">
                <Briefcase size={18} /> <span>Gerenciar Projetos</span>
              </Link>
              <Link to="/clientes" className="nav-item">
                <Users size={18} /> <span>Base de Clientes</span>
              </Link>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
            <h3 style={{ marginBottom: '16px' }}>Últimas Atividades</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {transactions.slice(0, 5).map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    background: t.tipo === 'IN' ? '#ecfdf5' : '#fff1f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: t.tipo === 'IN' ? '#10b981' : '#f43f5e'
                  }}>
                    {t.tipo === 'IN' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t.descricao}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(t.data_lancamento).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: t.tipo === 'IN' ? '#10b981' : '#f43f5e' }}>
                    {t.tipo === 'OUT' ? '-' : ''} R$ {Number(t.valor_realizado || t.valor_previsto).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
