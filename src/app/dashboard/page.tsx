'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, DollarSign, Target, Plus, Search, Filter, 
  ChevronUp, ChevronDown, Clock, CheckCircle2, AlertCircle,
  BarChart3, PieChart as PieChartIcon, ArrowRight, UserPlus,
  Zap, Briefcase, FileText
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
  
  const [kpiData, setKpiData] = useState([
    { label: 'Faturamento do Mês', value: 'R$ 0', change: '0%', icon: TrendingUp, color: '#007AFF' },
    { label: 'Novos Leads', value: '0', change: '0%', icon: Target, color: '#34C759' },
    { label: 'Clientes Ativos', value: '0', icon: Users, color: '#FF9500' },
    { label: 'Conversão', value: '0%', icon: Zap, color: '#FF3B30' },
  ]);

  useEffect(() => {
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

      setRecentActivity(activities);

    } catch (err) {
      console.error('Erro no Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Jan', value: 4000 },
    { name: 'Fev', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Abr', value: 4500 },
    { name: 'Mai', value: 6000 },
    { name: 'Jun', value: 5500 },
  ];

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    leadsData.forEach(l => {
      const org = l.origem_lead || 'Não informado';
      counts[org] = (counts[org] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leadsData]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-400 bg-clip-text text-transparent font-heading">
            Dashboard
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">Gerenciamento executivo CRM MATEUS.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-100 px-5 py-3 rounded-2xl font-bold text-xs text-gray-500 flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
          <button 
            onClick={() => setIsLeadModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-gray-100 rounded-[32px] p-7 group hover:shadow-2xl hover:shadow-gray-200/50 hover:translate-y-[-4px] transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 rounded-2xl bg-gray-50 group-hover:bg-white transition-colors shadow-sm">
                <kpi.icon className="w-6 h-6" style={{ color: kpi.color }} />
              </div>
              {kpi.change && (
                <span className={cn(
                  "flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-full uppercase tracking-wider",
                  kpi.change.startsWith('+') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                  {kpi.change.startsWith('+') ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {kpi.change}
                </span>
              )}
            </div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">{kpi.label}</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight font-heading">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* REVENUE CHART */}
          <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-heading">Crescimento de Faturamento</h3>
                <p className="text-xs text-gray-400 font-medium">Evolução mensal consolidada.</p>
              </div>
              <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                <button className="px-4 py-2 rounded-lg bg-white shadow-sm text-[10px] font-black uppercase text-gray-900 transition-all">Mensal</button>
                <button className="px-4 py-2 rounded-lg text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-all">Semanal</button>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#999' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#999' }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '16px' }}
                    itemStyle={{ fontSize: '13px', fontWeight: '900', color: '#007AFF' }}
                    labelStyle={{ fontSize: '11px', fontWeight: '700', color: '#999', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#007AFF" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ORIGIN PIE CHART */}
            <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm">
              <h3 className="text-lg font-bold mb-8 flex items-center gap-3 font-heading">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <PieChartIcon className="w-5 h-5" />
                </div>
                Origem de Leads
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.length > 0 ? pieData : [{ name: 'Sem dados', value: 1 }]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {pieData.slice(0, 4).map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[11px] font-bold text-gray-500 truncate">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PROGRESS METRICS */}
            <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm">
              <h3 className="text-lg font-bold mb-8 flex items-center gap-3 font-heading">
                <div className="p-2 rounded-xl bg-green-50 text-green-600">
                  <Target className="w-5 h-5" />
                </div>
                Metas Atuais
              </h3>
              <div className="space-y-6">
                {[
                  { label: 'Meta Faturamento', progress: 65, color: 'bg-blue-600 shadow-blue-200' },
                  { label: 'Novos Clientes', progress: 40, color: 'bg-green-500 shadow-green-200' },
                  { label: 'Propostas Enviadas', progress: 85, color: 'bg-indigo-500 shadow-indigo-200' }
                ].map((meta, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-400">
                      <span>{meta.label}</span>
                      <span className="text-gray-900">{meta.progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${meta.progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn("h-full rounded-full shadow-lg", meta.color)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* RECENT ACTIVITY */}
          <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold font-heading text-gray-900">Atividade Recente</h3>
              <button className="text-[11px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-all">Ver tudo</button>
            </div>
            <div className="space-y-8">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50" />
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-3 bg-gray-50 rounded-lg w-3/4" />
                      <div className="h-2 bg-gray-50 rounded-lg w-1/2" />
                    </div>
                  </div>
                ))
              ) : recentActivity.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Sem atividades</p>
                </div>
              ) : (
                recentActivity.map((activity, i) => (
                  <div key={i} className="flex gap-5 relative group">
                    {i !== recentActivity.length - 1 && (
                      <div className="absolute left-[23px] top-12 w-[2px] h-10 bg-gray-50 group-hover:bg-blue-50 transition-colors" />
                    )}
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 transition-all duration-300 group-hover:scale-110 shadow-sm", activity.color)}>
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">{activity.title}</p>
                      <p className="text-[10px] font-black text-gray-400 mt-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" /> {format(new Date(activity.time), 'HH:mm • dd MMM', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AD / UPGRADE CARD */}
          <div className="bg-gray-900 rounded-[40px] p-8 text-white border-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full -mr-24 -mt-24 blur-[80px] group-hover:bg-blue-600/30 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/10 rounded-full -ml-16 -mb-16 blur-[60px]" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-[10px] font-black opacity-50 mb-3 uppercase tracking-[0.3em]">Premium Add-on</h4>
              <h3 className="text-2xl font-black mb-4 leading-tight font-heading">Automação de Propostas PDF</h3>
              <p className="text-[13px] opacity-60 font-medium leading-relaxed mb-8">
                Gere propostas comerciais personalizadas e contratos jurídicos com apenas um clique.
              </p>
              <button className="w-full py-4 rounded-2xl bg-white text-gray-900 text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95">
                Ativar Módulo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
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
