'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Command, Paperclip, Mic, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou seu assistente CRM Mateus. Estou processando os dados da sua agência para te dar os melhores insights...',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agencyContext, setAgencyContext] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAgencyContext();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchAgencyContext = async () => {
    try {
      const [leads, clients, finance, support] = await Promise.all([
        supabase.from('crmmateus_leads').select('*'),
        supabase.from('crmmateus_clientes').select('*'),
        supabase.from('crmmateus_financeiro').select('*'),
        supabase.from('support_tickets').select('*')
      ]);

      const context = {
        leads_count: leads.data?.length || 0,
        clients_count: clients.data?.length || 0,
        total_revenue: finance.data?.filter(t => t.tipo === 'Entrada' && t.status === 'Pago').reduce((acc, t) => acc + t.valor, 0) || 0,
        pending_revenue: finance.data?.filter(t => t.status === 'Pendente').reduce((acc, t) => acc + t.valor, 0) || 0,
        open_tickets: support.data?.filter(t => t.status === 'aberto').length || 0,
        recent_leads: leads.data?.slice(0, 5) || [],
        recent_transactions: finance.data?.slice(0, 5) || []
      };

      setAgencyContext(context);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Olá! Sou seu assistente CRM Mateus. Já carreguei os dados da sua agência. Atualmente você tem ${context.leads_count} leads e um faturamento total de R$ ${context.total_revenue.toLocaleString('pt-BR')}. Como posso ajudar hoje?`,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error fetching context:', error);
      toast.error('Erro ao carregar contexto da agência');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMsg).map(m => ({ role: m.role, content: m.content })),
          context: agencyContext
        })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      const aiMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error('AI Error:', error);
      toast.error('Erro na resposta da IA. Verifique se a chave API está correta.');
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Desculpe, tive um problema ao processar sua solicitação. Por favor, tente novamente em instantes.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Qual o faturamento total?',
    'Quantos leads temos?',
    'Resuma a saúde da agência',
    'Preciso de uma estratégia de lucro'
  ];

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">IA Assistant</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Bot className="w-3 h-3" /> Inteligência treinada na sua agência
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-md rounded-[32px] border border-white/20 shadow-xl shadow-gray-200/50 overflow-hidden relative">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex items-start gap-4 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm",
                    msg.role === 'assistant' ? "bg-primary" : "bg-gray-800"
                  )}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-[20px] text-sm leading-relaxed",
                    msg.role === 'assistant' 
                      ? "bg-white text-gray-800 shadow-sm border border-gray-100" 
                      : "bg-primary text-white"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium ml-12">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
                IA está processando...
              </div>
            )}
          </div>

          <div className="p-6 bg-white/60 border-t border-gray-100/50">
            <div className="relative">
              <input
                type="text"
                placeholder="Pergunte qualquer coisa sobre sua agência..."
                className="w-full bg-white pl-6 pr-24 py-4 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 shadow-sm text-sm"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleSend}
                  className="p-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="whitespace-nowrap px-4 py-2 rounded-full bg-white border border-gray-100 text-[10px] font-bold text-gray-500 hover:text-primary hover:border-primary/20 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-80 space-y-6 hidden xl:block">
          <div className="card-premium p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Command className="w-4 h-4 text-primary" />
              Recursos da IA
            </h3>
            <ul className="space-y-4">
              {[
                { title: 'Análise de Churn', desc: 'Previsão de cancelamento.' },
                { title: 'Geração de Cópias', desc: 'Textos para landing pages.' },
                { title: 'Insights Financeiros', desc: 'Dicas para aumentar lucro.' }
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-1 h-8 bg-primary/20 rounded-full flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-premium p-6 bg-gray-900 text-white border-none">
            <p className="text-xs font-bold opacity-60 mb-2 uppercase tracking-widest">Upgrade de IA</p>
            <h4 className="text-lg font-bold mb-4">Conecte com sua equipe</h4>
            <p className="text-xs opacity-80 leading-relaxed mb-6">
              Integre o assistente com Slack ou WhatsApp para gerenciar leads diretamente por chat.
            </p>
            <button className="w-full py-3 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-2">
              Saber mais <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
