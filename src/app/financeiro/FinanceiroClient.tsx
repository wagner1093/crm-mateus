'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  ArrowUpRight, ArrowDownRight, Filter, Download,
  Search, Plus, MoreHorizontal, Calendar, Tag, Clock,
  Trash2, Pencil, ChevronRight, PieChart as PieChartIcon,
  Target, Zap, Briefcase, FileText, ShieldCheck, ListCheck
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
  PieChart, Pie
} from 'recharts';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionModal } from '@/components/TransactionModal';
import { toast } from 'react-hot-toast';

export default function FinanceiroClient() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('6m');
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDRE, setShowDRE] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const { data: allData, error } = await supabase
        .from('crmmateus_financeiro')
        .select(`
          *,
          cliente:crmmateus_clientes(nome)
        `)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;

      // Logic to sync Fixed Expenses
      const templates = allData?.filter(t => t.is_fixo && !t.template_id) || [];
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);

      const missingInstances = [];

      for (const template of templates) {
        const hasInstanceThisMonth = allData?.some(t => 
          t.template_id === template.id && 
          isWithinInterval(new Date(t.data_vencimento), { start: startOfCurrentMonth, end: endOfCurrentMonth })
        );

        // If the template itself is from a previous month and has no instance this month
        if (!hasInstanceThisMonth && new Date(template.data_vencimento) < startOfCurrentMonth) {
          missingInstances.push({
            descricao: template.descricao,
            valor: template.valor,
            tipo: template.tipo,
            categoria: template.categoria,
            status: 'Pendente',
            is_fixo: true,
            template_id: template.id,
            data_vencimento: format(startOfCurrentMonth, 'yyyy-MM-dd'),
            cliente_id: template.cliente_id
          });
        }
      }

      if (missingInstances.length > 0) {
        const { error: insertError } = await supabase
          .from('crmmateus_financeiro')
          .insert(missingInstances);
        
        if (!insertError) {
          // Re-fetch to get updated list with new instances
          return fetchFinancialData();
        }
      }

      setTransactions(allData || []);
    } catch (err) {
      console.error('Error fetching financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch = !searchTerm || tx.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) || tx.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = !filterStatus || tx.status === filterStatus;
      const matchType = !filterType || tx.tipo === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [transactions, searchTerm, filterStatus, filterType]);

  const financialStats = useMemo(() => {
    const receitasPagas = transactions
      .filter((t) => t.tipo === 'Entrada' && t.status === 'Pago')
      .reduce((acc, curr) => acc + (curr.valor || 0), 0);
    const despesasPagas = transactions
      .filter((t) => t.tipo === 'Saída' && t.status === 'Pago')
      .reduce((acc, curr) => acc + (curr.valor || 0), 0);
    const aReceber = transactions
      .filter((t) => t.tipo === 'Entrada' && t.status !== 'Pago')
      .reduce((acc, curr) => acc + (curr.valor || 0), 0);
    const aPagar = transactions
      .filter((t) => t.tipo === 'Saída' && t.status !== 'Pago')
      .reduce((acc, curr) => acc + (curr.valor || 0), 0);
    
    const saldoTotal = receitasPagas - despesasPagas;
    const projetadoFinalMes = saldoTotal + aReceber - aPagar;

    const receitaMes = transactions
      .filter((t) => {
        const date = new Date(t.data_vencimento);
        return t.tipo === 'Entrada' && t.status === 'Pago' && date.getMonth() === new Date().getMonth();
      })
      .reduce((acc, curr) => acc + (curr.valor || 0), 0);

    return {
      receitasTotal: receitasPagas,
      despesasTotal: despesasPagas,
      aReceber,
      aPagar,
      saldoTotal,
      projetadoFinalMes,
      receitaMes,
      taxaCrescimento: '+12.5%'
    };
  }, [transactions]);

  const advancedStats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const txsMes = transactions.filter(t => {
      const d = new Date(t.data_vencimento);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const fatAteAgora = txsMes.filter(t => t.tipo === 'Entrada' && t.status === 'Pago').reduce((acc, t) => acc + (t.valor || 0), 0);
    const custosAteAgora = txsMes.filter(t => t.tipo === 'Saída' && t.status === 'Pago').reduce((acc, t) => acc + (t.valor || 0), 0);
    const caixaAgora = fatAteAgora - custosAteAgora;

    const aReceberMes = txsMes.filter(t => t.tipo === 'Entrada' && t.status !== 'Pago').reduce((acc, t) => acc + (t.valor || 0), 0);
    const aPagarMes = txsMes.filter(t => t.tipo === 'Saída' && t.status !== 'Pago').reduce((acc, t) => acc + (t.valor || 0), 0);
    const aLucrarMes = aReceberMes - aPagarMes;

    const projFaturamento = fatAteAgora + aReceberMes;
    const projCustos = custosAteAgora + aPagarMes;
    const projLucro = projFaturamento - projCustos;

    const entradasList = txsMes.filter(t => t.tipo === 'Entrada');
    const qtdVendas = entradasList.length || 1;
    
    const ticketMedio = projFaturamento / qtdVendas;
    const custoOp = txsMes.filter(t => t.tipo === 'Saída' && t.is_fixo).reduce((acc, t) => acc + (t.valor || 0), 0);
    const custoOpMedio = custoOp / qtdVendas;
    
    const lucroMedio = projLucro / qtdVendas;
    const margemLucro = projFaturamento > 0 ? (projLucro / projFaturamento) * 100 : 0;

    return {
      projFaturamento, projCustos, projLucro,
      aReceberMes, aPagarMes, aLucrarMes,
      fatAteAgora, custosAteAgora, caixaAgora,
      ticketMedio, custoOp, custoOpMedio,
      lucroMedio, margemLucro
    };
  }, [transactions]);

  const topAnalysis = useMemo(() => {
    // Top fontes de receita
    const sourcesMap: any = {};
    transactions
      .filter(t => t.tipo === 'Entrada' && t.status === 'Pago')
      .forEach(t => {
        sourcesMap[t.descricao] = (sourcesMap[t.descricao] || 0) + t.valor;
      });
    
    const topSources = Object.entries(sourcesMap)
      .map(([name, value]: any) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Custos fixos ativos
    const fixedCosts = transactions.filter(t => t.is_fixo && !t.template_id);

    return { topSources, fixedCosts };
  }, [transactions]);

  const chartData = useMemo(() => {
    const months = timeRange === '6m' ? 6 : 12;
    const data = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthName = format(monthDate, 'MMM', { locale: ptBR });
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const entradas = transactions
        .filter(t => t.tipo === 'Entrada' && t.status === 'Pago' && isWithinInterval(new Date(t.data_vencimento), { start: monthStart, end: monthEnd }))
        .reduce((acc, t) => acc + t.valor, 0);

      const saidas = transactions
        .filter(t => t.tipo === 'Saída' && t.status === 'Pago' && isWithinInterval(new Date(t.data_vencimento), { start: monthStart, end: monthEnd }))
        .reduce((acc, t) => acc + t.valor, 0);

      data.push({
        name: monthName,
        entradas,
        saidas,
        lucro: entradas - saidas
      });
    }
    return data;
  }, [transactions, timeRange]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.filter(t => t.tipo === 'Saída').forEach(t => {
      counts[t.categoria] = (counts[t.categoria] || 0) + t.valor;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  const handleDelete = async (tx: any) => {
    const isTemplate = tx.is_fixo && !tx.template_id;
    const isInstance = tx.is_fixo && tx.template_id;

    let message = 'Excluir esta transação?';
    if (isTemplate) message = 'Esta é uma despesa fixa TEMPLATE. Excluí-la removerá todos os lançamentos futuros vinculados a ela. Confirmar?';
    if (isInstance) message = 'Esta é uma instância de uma despesa fixa. Se excluir, ela será gerada novamente no próximo acesso. Deseja excluir o TEMPLATE principal para parar a recorrência?';

    if (isInstance) {
      if (confirm(message)) {
        // Delete template
        try {
          const { error } = await supabase.from('crmmateus_financeiro').delete().eq('id', tx.template_id);
          if (error) throw error;
          toast.success('Recorrência removida');
          fetchFinancialData();
        } catch (err) {
          toast.error('Erro ao excluir recorrência');
        }
      } else if (confirm('Deseja excluir APENAS este lançamento deste mês? (Nota: ele voltará se você atualizar a página)')) {
        // Delete only instance
        try {
          const { error } = await supabase.from('crmmateus_financeiro').delete().eq('id', tx.id);
          if (error) throw error;
          toast.success('Lançamento removido');
          fetchFinancialData();
        } catch (err) {
          toast.error('Erro ao excluir');
        }
      }
      return;
    }

    if (!confirm(message)) return;
    
    try {
      const { error } = await supabase.from('crmmateus_financeiro').delete().eq('id', tx.id);
      if (error) throw error;
      toast.success('Lançamento removido');
      fetchFinancialData();
    } catch (err) {
      toast.error('Erro ao excluir');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#111118] tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-[#111118] via-[#111118] to-[#52525B]">
            Financeiro
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Gestão de caixa e saúde financeira</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDRE(!showDRE)}
            className={cn("px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm border", showDRE ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50")}
          >
            <PieChartIcon className="w-4 h-4" />
            {showDRE ? 'Ocultar DRE' : 'Painel DRE'}
          </button>
          <button className="bg-white border border-gray-100 px-5 py-2.5 rounded-2xl text-sm font-bold text-gray-500 flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Relatório
          </button>
          <button
            onClick={() => { setSelectedTx(null); setIsModalOpen(true); }}
            className="bg-[#1C1C1E] text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Novo lançamento
          </button>
        </div>
      </div>

      {/* ── Top Row: Financial KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Entradas (Pagas)', value: financialStats.receitasTotal, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
          { label: 'Saídas (Pagas)', value: financialStats.despesasTotal, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-500' },
          { label: 'Saldo Atual', value: financialStats.saldoTotal, icon: Wallet, color: 'text-violet-600', bg: 'bg-violet-500/10', border: 'border-violet-500/20', dot: 'bg-violet-500' },
          { label: 'Projetado Final', value: financialStats.projetadoFinalMes, icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
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
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Mês Atual</span>
                </div>
              </div>
              
              <div>
                <p className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-2">{item.label}</p>
                <div className="flex items-baseline gap-0.5">
                  <span className={cn("text-3xl font-bold tracking-tighter", item.color)}>
                    R$ {Math.floor(item.value).toLocaleString('pt-BR')}
                  </span>
                  <span className={cn("text-sm font-bold opacity-60", item.color)}>,{(item.value % 1).toFixed(2).split('.')[1] || '00'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── PAINEL GERENCIAL (DRE SINTÉTICO MENSAL) ── */}
      <AnimatePresence>
      {showDRE && (
        <motion.div
          key="dre-panel"
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          {/* Padding interno fixo para a sombra não ser cortada quando aberto */}
          <div className="py-2 px-1">
            <div className="p-[1px] bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-emerald-500/30 rounded-[32px] shadow-xl shadow-indigo-900/10">
            <div className="bg-[#0a0a0f] rounded-[31px] p-8 relative overflow-hidden">
              {/* Ambient glows */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"
              />
              
              <div className="relative z-10">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
                  className="flex items-center gap-3 mb-8"
                >
                  <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                    <PieChartIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-white">Painel Gerencial</h3>
                    <p className="text-[12px] font-black uppercase tracking-widest text-gray-500 mt-0.5">Visão Analítica Mensal</p>
                  </div>
                </motion.div>

                {/* 3 Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* FATURAMENTO */}
                  <motion.div
                    initial={{ opacity: 0, y: 30, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                      <div className="p-1.5 bg-orange-500/20 text-orange-400 rounded-lg">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-white">Faturamento</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 transition-all duration-300 hover:bg-orange-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-400/80 block mb-1">Total Projetado</span>
                        <span className="text-2xl font-black text-orange-400">R$ {advancedStats.projFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Até Agora</span>
                        <span className="text-lg font-black text-white">R$ {advancedStats.fatAteAgora.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">A Receber</span>
                        <span className="text-lg font-black text-gray-400">R$ {advancedStats.aReceberMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* CUSTOS */}
                  <motion.div
                    initial={{ opacity: 0, y: 30, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                      <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-white">Custos</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 transition-all duration-300 hover:bg-rose-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400/80 block mb-1">Total Projetado</span>
                        <span className="text-2xl font-black text-rose-400">R$ {advancedStats.projCustos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Até Agora</span>
                        <span className="text-lg font-black text-white">R$ {advancedStats.custosAteAgora.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">A Pagar</span>
                        <span className="text-lg font-black text-gray-400">R$ {advancedStats.aPagarMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* LUCRO */}
                  <motion.div
                    initial={{ opacity: 0, y: 30, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                      <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-white">Lucro & Caixa</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 bg-emerald-500 border border-emerald-400 rounded-2xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-white/20 to-emerald-400/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100 block mb-1 relative z-10">Lucro Projetado</span>
                        <span className="text-2xl font-black relative z-10">R$ {advancedStats.projLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden transition-all duration-300 hover:bg-white/10">
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Caixa Agora</span>
                        <span className="text-lg font-black text-white">R$ {advancedStats.caixaAgora.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Pendente</span>
                        <span className="text-lg font-black text-gray-400">R$ {advancedStats.aLucrarMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* INDICADORES OPERACIONAIS */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.6 }}
                  className="mt-8 pt-8 border-t border-white/5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-gray-500" />
                    <h4 className="font-bold text-gray-500 text-xs uppercase tracking-widest">Indicadores Operacionais</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: 'Ticket Médio', value: `R$ ${advancedStats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-white', cls: 'bg-white/5 border-white/10' },
                      { label: 'Custo Op Fixo', value: `R$ ${advancedStats.custoOp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-rose-400', cls: 'bg-white/5 border-white/10' },
                      { label: 'Custo por Venda', value: `R$ ${advancedStats.custoOpMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-rose-400', cls: 'bg-white/5 border-white/10' },
                      { label: 'Lucro Médio/Venda', value: `R$ ${advancedStats.lucroMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-emerald-400', cls: 'bg-white/5 border-white/10' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.7 + i * 0.1 }}
                        className={`${item.cls} border rounded-2xl p-4 flex flex-col justify-center transition-all duration-300 hover:scale-[1.02] hover:bg-white/10`}
                      >
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</span>
                        <span className={`text-lg font-black ${item.color}`}>{item.value}</span>
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20, delay: 1.1 }}
                      className="bg-indigo-500/10 border border-indigo-500/20 text-white rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.15)] group"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl -mr-4 -mt-4 transition-all duration-500 group-hover:scale-150 group-hover:bg-indigo-400/30" />
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-1 relative z-10">Margem de Lucro</span>
                      <span className="text-3xl font-black text-indigo-400 relative z-10">{advancedStats.margemLucro.toFixed(0)}%</span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ── Second Row: Evolution & Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Fluxo de Caixa (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col min-h-[420px] relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap justify-between items-start gap-4 mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Análise</span>
              </div>
              <h3 className="text-xl font-bold text-[#111118] tracking-tight">Fluxo de Caixa</h3>
              <p className="text-sm font-medium text-gray-400 mt-0.5">Entradas vs. Saídas — últimos {timeRange === '6m' ? '6' : '12'} meses</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setTimeRange('6m')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300",
                  timeRange === '6m' ? "bg-[#1d7cf9] text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                )}
              >
                6 Meses
              </button>
              <button 
                onClick={() => setTimeRange('12m')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300",
                  timeRange === '12m' ? "bg-[#1d7cf9] text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                )}
              >
                12 Meses
              </button>
            </div>
          </div>

          <div className="flex-1 w-full relative z-10 min-h-[300px]">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 800 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 800 }} width={45} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', fontWeight: 700 }} />
                  <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorEntradas)" />
                  <Area type="monotone" dataKey="saidas" name="Saídas" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#colorSaidas)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Distribuição por Categoria (1 col) */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col min-h-[420px] relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Despesas</span>
          </div>
          <h3 className="text-xl font-bold text-[#111118] tracking-tight mb-6">Categorias</h3>
          
          <div className="flex-1 w-full relative z-10 flex flex-col justify-center">
            <div className="h-[200px] mb-8">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.length > 0 ? categoryData : [{ name: 'Sem dados', value: 1 }]}
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="space-y-3">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'][i % 5] }} />
                    <span className="text-xs font-bold text-gray-600 truncate max-w-[120px]">{cat.name}</span>
                  </div>
                  <span className="text-xs font-black text-[#111118]">R$ {cat.value.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Meta de Faturamento (1 col) */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between min-h-[420px] relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-100">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Meta Mensal</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-[#111118]">Progresso</h3>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center flex-1">
            <div className="relative flex items-center justify-center w-[160px] h-[160px] mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#f0f7ff" strokeWidth="12" fill="none" />
                <circle 
                  cx="80" cy="80" r="70" stroke="#3b82f6" strokeWidth="12" fill="none" 
                  strokeDasharray={`${2 * Math.PI * 70}`} 
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - Math.min(financialStats.receitaMes / 50000, 1))}`} 
                  strokeLinecap="round" 
                  className="transition-all duration-1000" 
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black tracking-tighter text-[#111118]">
                  {Math.round((financialStats.receitaMes / 50000) * 100)}%
                </span>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Atingido</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Realizado</span>
                <span className="text-sm font-black text-[#111118]">R$ {financialStats.receitaMes.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Faltam</span>
                <span className="text-sm font-black text-emerald-600">R$ {Math.max(50000 - financialStats.receitaMes, 0).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Meta: R$ 50k</p>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
              <TrendingUp className="w-3 h-3" />
              {financialStats.taxaCrescimento}
            </div>
          </div>
        </div>
      </div>

      {/* ── Third Row: Transactions & Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lançamentos (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Histórico</span>
              </div>
              <h3 className="text-xl font-bold text-[#111118] tracking-tight">Últimos Lançamentos</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-dmsans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-[180px] outline-none" 
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowFilter(p => !p)}
                  className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm',
                    showFilter || filterStatus || filterType ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                  )}>
                  <Filter className="w-4 h-4" />
                </button>
                {showFilter && (
                  <div className="absolute top-full mt-2 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50 flex flex-col gap-1 w-44">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 px-2">Tipo</p>
                    {['Todos', 'Entrada', 'Saída'].map(s => (
                      <button key={s}
                        onClick={() => { setFilterType(s === 'Todos' ? null : s); setShowFilter(false); }}
                        className={cn('text-left px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all',
                          filterType === s || (s === 'Todos' && !filterType) ? 'bg-gray-900 text-white' : 'hover:bg-gray-50 text-gray-600'
                        )}>
                        {s}
                      </button>
                    ))}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2 mb-1 px-2">Status</p>
                    {['Todos', 'Pago', 'Pendente'].map(s => (
                      <button key={s}
                        onClick={() => { setFilterStatus(s === 'Todos' ? null : s); setShowFilter(false); }}
                        className={cn('text-left px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all',
                          filterStatus === s || (s === 'Todos' && !filterStatus) ? 'bg-gray-900 text-white' : 'hover:bg-gray-50 text-gray-600'
                        )}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />
              ))
            ) : transactions.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[15px]">Nenhuma transação encontrada</p>
              </div>
            ) : (
              filteredTransactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between group p-4 border border-transparent hover:border-blue-50 hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-transparent rounded-[24px] transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl border shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform",
                      tx.tipo === 'Entrada' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                    )}>
                      {tx.tipo === 'Entrada' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111118] tracking-tight leading-tight">{tx.descricao}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[12px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {tx.categoria}
                        </span>
                        <span className="text-[12px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {format(new Date(tx.data_vencimento), 'dd/MM/yyyy')}
                        </span>
                        {tx.is_fixo && (
                          <span className="text-[12px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-blue-50 text-blue-500 rounded-md border border-blue-100 flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" /> Fixo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={cn("text-sm font-black tracking-tight", tx.tipo === 'Entrada' ? "text-emerald-600" : "text-rose-600")}>
                        {tx.tipo === 'Entrada' ? '+' : '-'} R$ {tx.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <div className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-black uppercase tracking-widest mt-1",
                        tx.status === 'Pago' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {tx.status}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => { setSelectedTx(tx); setIsModalOpen(true); }}
                        className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(tx)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analytics Sidebar (1 col) */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-[#1d7cf9] rounded-[32px] p-6 shadow-[0_20px_50px_rgba(29,124,249,0.2)] text-white relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Ações Rápidas
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => { setSelectedTx(null); setIsModalOpen(true); }}
                  className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-2xl border border-white/20 transition-all text-[15px] font-bold flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg"><ArrowUpRight className="w-4 h-4" /></div>
                    Nova Receita
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                </button>
                <button 
                  onClick={() => { setSelectedTx(null); setIsModalOpen(true); }}
                  className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-2xl border border-white/20 transition-all text-[15px] font-bold flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/20 rounded-lg"><ArrowDownRight className="w-4 h-4" /></div>
                    Nova Despesa
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                </button>
              </div>
            </div>
          </div>

          {/* Custos Fixos Panel */}
          <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="p-1.5 bg-orange-50 rounded-lg border border-orange-100">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Recorrências</span>
            </div>
            <h3 className="text-base font-bold text-[#111118] mb-4">Fixos Ativos</h3>
            
            <div className="space-y-2">
              {topAnalysis.fixedCosts.length === 0 ? (
                <p className="text-[10px] text-gray-400 font-medium py-4 text-center italic">Sem custos fixos</p>
              ) : (
                topAnalysis.fixedCosts.slice(0, 4).map((cost: any) => (
                  <div key={cost.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div className="truncate pr-2">
                      <p className="text-[15px] font-bold text-[#111118] truncate">{cost.descricao}</p>
                      <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{cost.categoria}</p>
                    </div>
                    <p className="text-[15px] font-black text-rose-600 shrink-0">R$ {cost.valor.toLocaleString('pt-BR')}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Sources Analytics */}
          <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Desempenho</span>
            </div>
            <h3 className="text-base font-bold text-[#111118] mb-4">Top Fontes</h3>
            
            <div className="space-y-4">
              {topAnalysis.topSources.length === 0 ? (
                <p className="text-[10px] text-gray-400 font-medium py-4 text-center italic">Sem dados</p>
              ) : (
                topAnalysis.topSources.map((source: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-[15px] font-bold text-gray-600 truncate max-w-[140px]">{source.name}</span>
                      <span className="text-[15px] font-black text-[#111118]">R$ {source.value.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${(source.value / (topAnalysis.topSources[0]?.value || 1)) * 100}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchFinancialData} 
        transaction={selectedTx}
      />
    </div>
  );
}
