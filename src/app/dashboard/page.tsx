'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Wallet, Users, DollarSign, Target, Plus, Search, Filter, 
  ChevronUp, ChevronDown, Clock, CheckCircle2, AlertCircle,
  BarChart3, PieChart as PieChartIcon, ArrowRight, UserPlus,
  Zap, Briefcase, FileText, Share2, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { cn } from '@/lib/utils';
import { LeadModal } from '@/components/LeadModal';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#8B5CF6'];

export default function DashboardPage() {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [leadsData, setLeadsData] = useState<any[]>([]);
  const [clientsData, setClientsData] = useState<any[]>([]);
  const [financeData, setFinanceData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('6m');
  const router = useRouter();

  
  const [kpiData, setKpiData] = useState([
    { label: 'Faturamento do Mês', value: 'R$ 0', change: '0%', icon: TrendingUp, color: '#007AFF' },
    { label: 'Novos Leads', value: '0', change: '0%', icon: Target, color: '#34C759' },
    { label: 'Clientes Ativos', value: '0', icon: Users, color: '#FF9500' },
    { label: 'Conversão', value: '0%', icon: Zap, color: '#FF3B30' },
  ]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [leadsRes, clientsRes, financeRes] = await Promise.all([
        supabase.from('crmmateus_leads').select('*').order('created_at', { ascending: false }),
        supabase.from('crmmateus_clientes').select('*').order('created_at', { ascending: false }),
        supabase.from('crmmateus_financeiro').select('*')
      ]);

      const leads = leadsRes.data || [];
      const clients = clientsRes.data || [];
      const finance = financeRes.data || [];

      setLeadsData(leads);
      setClientsData(clients);
      setFinanceData(finance);

      // Calculations
      const revenue = finance.filter(t => t.tipo === 'Entrada' && t.status === 'Pago').reduce((acc, curr) => acc + curr.valor, 0);
      const fechados = leads.filter(l => l.etapa === 'Fechado').length;
      const conversionRate = leads.length > 0 ? Math.round((fechados / leads.length) * 100) : 0;
      
      setKpiData([
        { label: 'Faturamento Total', value: `R$ ${revenue.toLocaleString('pt-BR')}`, change: '+12.5%', icon: TrendingUp, color: '#007AFF' },
        { label: 'Total de Leads', value: leads.length.toString(), change: `+${leads.filter(l => new Date(l.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}`, icon: Target, color: '#34C759' },
        { label: 'Clientes Ativos', value: clients.length.toString(), icon: Users, color: '#FF9500' },
        { label: 'Conversão', value: `${conversionRate}%`, icon: Zap, color: '#FF3B30' },
      ]);

      const activities = [
        ...(leads.slice(0, 5).map(l => ({ type: 'lead', title: `Novo Lead: ${l.nome}`, time: l.created_at, icon: Target, color: 'bg-green-100 text-green-600' }))),
        ...(clients.slice(0, 5).map(c => ({ type: 'client', title: `Novo Cliente: ${c.nome}`, time: c.created_at, icon: Users, color: 'bg-blue-100 text-blue-600' })))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setRecentActivity(activities.map(a => ({
        ...a,
        timeFormatted: format(new Date(a.time), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })
      })));

    } catch (err) {
      console.error('Erro no Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (timeRange === '12m') {
      return [
        { name: 'Jul', value: 3500, clientes: 2000 },
        { name: 'Ago', value: 4200, clientes: 2500 },
        { name: 'Set', value: 3800, clientes: 2200 },
        { name: 'Out', value: 5000, clientes: 3000 },
        { name: 'Nov', value: 4800, clientes: 2800 },
        { name: 'Dez', value: 6200, clientes: 3500 },
        { name: 'Jan', value: 4000, clientes: 2500 },
        { name: 'Fev', value: 3000, clientes: 2000 },
        { name: 'Mar', value: 5000, clientes: 3200 },
        { name: 'Abr', value: 4500, clientes: 2800 },
        { name: 'Mai', value: 6000, clientes: 3800 },
        { name: 'Jun', value: 5500, clientes: 3400 },
      ];
    }
    return [
      { name: 'Jan', value: 4000, clientes: 2500 },
      { name: 'Fev', value: 3000, clientes: 2000 },
      { name: 'Mar', value: 5000, clientes: 3200 },
      { name: 'Abr', value: 4500, clientes: 2800 },
      { name: 'Mai', value: 6000, clientes: 3800 },
      { name: 'Jun', value: 5500, clientes: 3400 },
    ];
  }, [timeRange]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    leadsData.forEach(l => {
      const org = l.origem_lead || 'Não informado';
      counts[org] = (counts[org] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leadsData]);

  const financialStats = useMemo(() => {
    const receitas = financeData.filter(t => t.tipo === 'Entrada' && t.status === 'Pago').reduce((acc, curr) => acc + curr.valor, 0);
    const aReceber = financeData.filter(t => t.tipo === 'Entrada' && t.status !== 'Pago').reduce((acc, curr) => acc + curr.valor, 0);
    const despesas = financeData.filter(t => t.tipo === 'Saida').reduce((acc, curr) => acc + curr.valor, 0);
    return { receitas, aReceber, despesas, saldo: receitas - despesas };
  }, [financeData]);

  const pipelineStats = useMemo(() => {
    const novos = leadsData.filter(l => l.etapa === 'Novo').length;
    const fechados = leadsData.filter(l => l.etapa === 'Fechado').length;
    const perdidos = leadsData.filter(l => l.etapa === 'Perdido').length;
    const emAndamento = leadsData.length - novos - fechados - perdidos;
    return { novos, emAndamento, fechados, perdidos, total: leadsData.length };
  }, [leadsData]);

  const conversionRate = useMemo(() => {
    return pipelineStats.total > 0 ? Math.round((pipelineStats.fechados / pipelineStats.total) * 100) : 0;
  }, [pipelineStats]);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#111118] tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-[#111118] via-[#111118] to-[#52525B]">
            Dashboard
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Visão executiva e saúde do negócio</p>
        </div>
        <button
          onClick={() => setIsLeadModalOpen(true)}
          className="bg-[#1C1C1E] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          Novo lead
        </button>
      </div>

      {/* ── Top Row: Financial Overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Entradas (Pagas)', value: financialStats.receitas, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
          { label: 'A Receber', value: financialStats.aReceber, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
          { label: 'Despesas', value: financialStats.despesas, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-500' },
          { label: 'Saldo Líquido', value: financialStats.saldo, icon: Wallet, color: 'text-violet-600', bg: 'bg-violet-500/10', border: 'border-violet-500/20', dot: 'bg-violet-500' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <div className={`absolute -top-16 -right-16 w-32 h-32 ${item.bg} rounded-full blur-2xl transition-transform group-hover:scale-150`} />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center border ${item.border}`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.dot} animate-pulse`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Hoje</span>
                </div>
              </div>
              
              <div>
                <p className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-2">{item.label}</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl font-bold tracking-tighter text-[#111118]">
                    R$ {Math.floor(item.value).toLocaleString('pt-BR')}
                  </span>
                  <span className="text-sm font-bold text-gray-400">,{(item.value % 1).toFixed(2).split('.')[1] || '00'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Second Row: Goals & Evolution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Meta de Faturamento (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between min-h-[420px] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-100">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Meta Mensal</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[#111118]">Meta de Faturamento</h3>
            </div>
            <div className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">Faltam {100 - Math.min(Math.round((financialStats.receitas / 50000) * 100), 100)}%</span>
            </div>
          </div>

          <div className="relative z-10 my-6 flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-1">Realizado</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tighter text-[#111118]">R$ {financialStats.receitas.toLocaleString('pt-BR')}</span>
                  <span className="text-sm font-bold text-gray-400">/ R$ 50k</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold tracking-tighter text-gray-200">{Math.min(Math.round((financialStats.receitas / 50000) * 100), 100)}%</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-5 p-1.5 border border-gray-200 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(29,124,249,0.3)]" 
                style={{ width: `${Math.min(Math.round((financialStats.receitas / 50000) * 100), 100)}%` }}
              />
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                Faltam R$ {Math.max(50000 - financialStats.receitas, 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Atualizado agora</p>
          </div>
        </div>

        {/* Main Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col min-h-[420px] relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap justify-between items-start gap-4 mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
                <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Ao Vivo</span>
              </div>
              <h3 className="text-xl font-bold text-[#111118] tracking-tight">Evolução de Receita</h3>
              <p className="text-sm font-medium text-gray-400 mt-0.5">Entradas vs. A Receber — últimos {timeRange === '6m' ? '6' : '12'} meses</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => setTimeRange('6m')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    timeRange === '6m' 
                      ? "bg-[#1d7cf9] text-white" 
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  )}
                >
                  6 Meses
                </button>
                <button 
                  onClick={() => setTimeRange('12m')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    timeRange === '12m' 
                      ? "bg-[#1d7cf9] text-white" 
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  )}
                >
                  12 Meses
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
            {[
              { label: 'Pico Mensal', value: `R$ ${Math.max(...chartData.map(d => d.value)).toLocaleString('pt-BR')}`, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
              { label: 'Média', value: `R$ ${chartData.length ? Math.round(chartData.reduce((s, d) => s + d.value, 0) / chartData.length).toLocaleString('pt-BR') : '0'}`, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
              { label: 'Total', value: `R$ ${chartData.reduce((s, d) => s + d.value, 0).toLocaleString('pt-BR')}`, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
            ].map((kpi, i) => (
              <div key={i} className={`${kpi.bg} border rounded-2xl px-4 py-3`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{kpi.label}</p>
                <p className={`text-lg font-bold tracking-tight ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="flex-1 w-full relative z-10 min-h-[300px]">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 800 }} dy={14} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 800 }} width={45} />
                  <Tooltip cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }} contentStyle={{ borderRadius: '16px', border: '1px solid #E5E7EB', background: '#ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', fontWeight: 700, color: '#111118' }} />
                  <Area type="monotone" dataKey="value" name="Receita" stroke="#1d7cf9" strokeWidth={2.5} fill="transparent" dot={false} activeDot={{ r: 5, fill: '#1d7cf9', stroke: '#fff', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="clientes" name="A Receber" stroke="#0EA5E9" strokeWidth={2} fill="transparent" dot={false} activeDot={{ r: 4, fill: '#0EA5E9', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Third Row: Analytics & Actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Funil de Vendas (1 col) */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col min-h-[280px] relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-8 w-32 h-32 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Pipeline</span>
            </div>
            <h3 className="text-xl font-bold text-[#111118] tracking-tight">Funil de Vendas</h3>
            <p className="text-sm font-medium text-gray-400 mt-0.5">{pipelineStats.total} leads no total</p>
          </div>
          
          <div className="space-y-5 flex-1 flex flex-col justify-center relative z-10">
            {[
              { label: 'Novos', value: pipelineStats.novos, from: 'from-blue-400', to: 'to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', total: pipelineStats.total },
              { label: 'Em Andamento', value: pipelineStats.emAndamento, from: 'from-sky-400', to: 'to-blue-500', bg: 'bg-sky-50', text: 'text-sky-600', total: pipelineStats.total },
              { label: 'Fechados', value: pipelineStats.fechados, from: 'from-emerald-400', to: 'to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600', total: pipelineStats.total },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-[12px] font-black uppercase tracking-widest mb-2">
                  <span className="text-gray-400">{item.label}</span>
                  <span className={`${item.text} font-black`}>{item.value}</span>
                </div>
                <div className={`w-full ${item.bg} rounded-full h-2.5 overflow-hidden`}>
                  <div className={`h-full rounded-full bg-gradient-to-r ${item.from} ${item.to} transition-all duration-1000 shadow-sm`} style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversão (1 col) */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between min-h-[280px] relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-8 w-32 h-32 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Conversão</span>
            </div>
            <h3 className="text-xl font-bold text-[#111118] tracking-tight">Taxa de Sucesso</h3>
          </div>
          
          <div className="flex flex-col items-center justify-center flex-1 my-4 relative z-10">
            <div className="relative flex items-center justify-center w-[120px] h-[120px]">
              <svg className="w-full h-full transform -rotate-90">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1d7cf9" />
                    <stop offset="100%" stopColor="#60A5FA" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="50" stroke="#f0f7ff" strokeWidth="10" fill="none" />
                <circle cx="60" cy="60" r="50" stroke="url(#ringGrad)" strokeWidth="10" fill="none" strokeDasharray={`${2 * Math.PI * 50}`} strokeDashoffset={`${2 * Math.PI * 50 * (1 - conversionRate / 100)}`} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black tracking-tighter bg-gradient-to-br from-blue-600 to-sky-600 bg-clip-text text-transparent">{conversionRate}%</span>
              </div>
            </div>
          </div>
          <div className="text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full">
              <span className="text-sm font-black text-blue-700">{clientsData.length}</span>
              <span className="text-[12px] font-black uppercase tracking-widest text-blue-400">Clientes Ativos</span>
            </div>
          </div>
        </div>

        {/* Origens (1 col) */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col min-h-[280px]">
          <div className="flex items-start gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100">
              <PieChartIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#111118] tracking-tight">Origens</h3>
              <p className="text-sm font-medium text-gray-400 mt-0.5">Vem seus leads</p>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[160px]">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData.length > 0 ? pieData : [{ name: 'Sem dados', value: 1 }]} innerRadius={40} outerRadius={65} paddingAngle={6} dataKey="value">
                    {pieData.map((entry, index) => {
                      const pieColors = ['#1d7cf9', '#60A5FA', '#93C5FD', '#34D399', '#3b82f6'];
                      return <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px rgba(0,0,0,0.06)', fontSize: '13px', fontWeight: 600, background: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Actions (1 col) */}
        <div className="bg-gradient-to-br from-[#1d7cf9] to-[#0b5ed7] rounded-[32px] p-8 shadow-[0_20px_50px_rgba(29,124,249,0.3)] flex flex-col justify-between text-white relative overflow-hidden min-h-[280px]">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">Ações Rápidas</h3>
            </div>
            <p className="text-white text-sm mb-6 font-medium">Gerenciar negócio</p>
            
            <div className="space-y-3">
              <button onClick={() => setIsLeadModalOpen(true)} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 transition-all duration-300 p-3.5 rounded-[20px] flex items-center gap-3 text-sm font-bold group shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors border border-white/10">
                  <Target className="w-4 h-4 text-white" />
                </div>
                Cadastrar Lead
              </button>
              
              <button onClick={() => router.push('/clientes')} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 transition-all duration-300 p-3.5 rounded-[20px] flex items-center gap-3 text-sm font-bold group shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors border border-white/10">
                  <Users className="w-4 h-4 text-white" />
                </div>
                Novo Cliente
              </button>
              
              <button onClick={() => router.push('/financeiro')} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 transition-all duration-300 p-3.5 rounded-[20px] flex items-center gap-3 text-sm font-bold group shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors border border-white/10">
                  <DollarSign className="w-4 h-4 text-sky-200" />
                </div>
                Financeiro
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fourth Row: Activity ── */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Activity (Full width) */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Recente</span>
              </div>
              <h3 className="text-xl font-bold text-[#111118] tracking-tight">Atividade Recente</h3>
            </div>
            <button onClick={() => router.push('/pipeline')} className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">Ver tudo</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 border border-gray-50 rounded-[24px]">
                  <div className="w-12 h-12 rounded-[16px] bg-gray-50 border border-gray-100 animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/4 animate-pulse" />
                  </div>
                </div>
              ))
            ) : (
              recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between group p-4 border border-transparent hover:border-blue-50 hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-transparent rounded-[24px] transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl border shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform", activity.color.split(' ')[0])}>
                      <activity.icon className={cn("w-5 h-5", activity.color.split(' ')[1])} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111118] tracking-tight leading-tight">{activity.title}</p>
                      <p className="text-[12px] font-medium text-gray-400 mt-1 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {activity.timeFormatted || format(new Date(activity.time), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-all">
                    <div className="bg-blue-50 border border-blue-100 rounded-full p-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <LeadModal 
        isOpen={isLeadModalOpen} 
        onClose={() => setIsLeadModalOpen(false)} 
        onSuccess={() => fetchDashboardData()}
      />
    </div>
  );
}
