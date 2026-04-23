'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  ArrowUpRight, ArrowDownRight, Filter, Download,
  Search, Plus, MoreHorizontal, Calendar, Tag, Clock,
  Trash2, Pencil
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionModal } from '@/components/TransactionModal';
import { toast } from 'react-hot-toast';

export default function FinanceiroClient() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [summary, setSummary] = useState({
    receita: 0,
    despesas: 0,
    lucro: 0,
    pendente: 0
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crmmateus_financeiro')
        .select(`
          *,
          cliente:crmmateus_clientes(nome)
        `)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;
      
      const txs = data || [];
      setTransactions(txs);

      const receita = txs.filter(t => t.tipo === 'Entrada' && t.status === 'Pago').reduce((acc, t) => acc + t.valor, 0);
      const despesas = txs.filter(t => t.tipo === 'Saída' && t.status === 'Pago').reduce((acc, t) => acc + t.valor, 0);
      const pendente = txs.filter(t => t.status === 'Pendente').reduce((acc, t) => acc + t.valor, 0);

      setSummary({
        receita,
        despesas,
        lucro: receita - despesas,
        pendente
      });

    } catch (err) {
      console.error('Error fetching financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta transação?')) return;
    try {
      const { error } = await supabase.from('crmmateus_financeiro').delete().eq('id', id);
      if (error) throw error;
      toast.success('Lançamento removido');
      fetchFinancialData();
    } catch (err) {
      toast.error('Erro ao excluir');
    }
  };

  const stats = [
    { label: 'Receita Total', value: `R$ ${summary.receita.toLocaleString('pt-BR')}`, icon: TrendingUp, color: '#34C759', bg: 'bg-green-50' },
    { label: 'Despesas Totais', value: `R$ ${summary.despesas.toLocaleString('pt-BR')}`, icon: TrendingDown, color: '#FF3B30', bg: 'bg-red-50' },
    { label: 'Lucro Líquido', value: `R$ ${summary.lucro.toLocaleString('pt-BR')}`, icon: Wallet, color: '#007AFF', bg: 'bg-blue-50' },
    { label: 'A Receber', value: `R$ ${summary.pendente.toLocaleString('pt-BR')}`, icon: Clock, color: '#FF9500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-400 bg-clip-text text-transparent font-heading">
            Financeiro
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">Controle seu fluxo de caixa e métricas de rentabilidade.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-100 px-5 py-3 rounded-2xl font-bold text-xs text-gray-500 flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            <span>Relatório</span>
          </button>
          <button 
            onClick={() => { setSelectedTx(null); setIsModalOpen(true); }}
            className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-gray-100 rounded-[32px] p-7 group hover:shadow-2xl hover:shadow-gray-200/50 hover:translate-y-[-4px] transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-4 rounded-2xl transition-colors shadow-sm", s.bg)}>
                <s.icon className="w-6 h-6" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">{s.label}</p>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight font-heading">{s.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900 font-heading">Últimas Transações</h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Buscar..." className="pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border-none text-xs focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                ))
              ) : transactions.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Nenhuma transação</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-5 rounded-[24px] hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group relative">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                        tx.tipo === 'Entrada' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      )}>
                        {tx.tipo === 'Entrada' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-bold text-base text-gray-900">{tx.descricao}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                            <Tag className="w-3 h-3" /> {tx.categoria}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {format(new Date(tx.data_vencimento), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={cn("font-black text-base", tx.tipo === 'Entrada' ? "text-green-600" : "text-red-600")}>
                          {tx.tipo === 'Entrada' ? '+' : '-'} R$ {tx.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md",
                          tx.status === 'Pago' ? "bg-green-50 text-green-500" : "bg-orange-50 text-orange-500"
                        )}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={() => { setSelectedTx(tx); setIsModalOpen(true); }}
                          className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
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
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm">
            <h3 className="text-lg font-bold mb-8 font-heading">Distribuição Mensal</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactions.slice(0, 6)}>
                  <XAxis dataKey="categoria" hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="valor" radius={[10, 10, 0, 0]}>
                    {transactions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.tipo === 'Entrada' ? '#34C759' : '#FF3B30'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4 italic">Dados baseados nos lançamentos recentes</p>
          </div>

          <div className="bg-primary rounded-[40px] p-8 text-white border-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <h4 className="text-[10px] font-black opacity-60 mb-2 uppercase tracking-[0.3em]">Meta de Faturamento</h4>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-black font-heading">R$ {summary.receita.toLocaleString('pt-BR')}</span>
              <span className="text-xs opacity-50 font-bold">/ R$ 50.000</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((summary.receita / 50000) * 100, 100)}%` }}
                className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)]" 
              />
            </div>
            <p className="text-[10px] mt-4 opacity-70 font-bold uppercase tracking-wider">
              {Math.round((summary.receita / 50000) * 100)}% da meta atingida
            </p>
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
