'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LifeBuoy, Search, Filter, Plus, MessageCircle, 
  Clock, CheckCircle2, AlertCircle, User, ArrowRight,
  MoreHorizontal, Phone, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tickets = [
  { id: '1', subject: 'Problema no acesso ao painel', client: 'Empresa Alpha', status: 'Aberto', priority: 'Alta', time: '2h atrás' },
  { id: '2', subject: 'Dúvida sobre fatura de Março', client: 'João Silva', status: 'Em Atendimento', priority: 'Média', time: '5h atrás' },
  { id: '3', subject: 'Solicitação de novo serviço', client: 'Beta Group', status: 'Resolvido', priority: 'Baixa', time: '1 dia atrás' },
];

export default function SuporteClient() {
  const [activeTab, setActiveTab] = useState('Todos');

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Suporte</h2>
          <p className="text-muted-foreground">Gerencie tickets e atendimento ao cliente.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>WhatsApp Central</span>
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Abrir Ticket</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Tickets Abertos', value: '12', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Em Atendimento', value: '5', icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Resolvidos (Mês)', value: '48', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className="card-premium p-6 flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl border border-white/20">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Buscar ticket ou cliente..." className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border-none text-sm focus:ring-2 focus:ring-primary/20 shadow-sm" />
            </div>
            <div className="flex gap-1 bg-gray-100/50 p-1 rounded-xl">
              {['Todos', 'Abertos', 'Fechados'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    activeTab === tab ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-premium p-6 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                      ticket.status === 'Aberto' ? "bg-orange-100 text-orange-600" : 
                      ticket.status === 'Resolvido' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                    )}>
                      <LifeBuoy className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{ticket.subject}</h4>
                        <span className={cn(
                          "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider",
                          ticket.priority === 'Alta' ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                        )}>
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {ticket.client}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ticket.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-xs font-bold text-gray-900">{ticket.status}</p>
                      <p className="text-[10px] text-muted-foreground">ID: #TK-{ticket.id}294</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="w-80 space-y-6 hidden lg:block">
          <div className="card-premium p-6">
            <h3 className="font-bold mb-4">Métricas de Suporte</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Tempo Médio de Resposta</span>
                  <span className="text-primary">15 min</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[85%] rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Satisfação do Cliente</span>
                  <span className="text-green-500">98.5%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[98%] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="card-premium p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none shadow-xl">
            <h4 className="font-bold mb-4">Precisa de Ajuda?</h4>
            <p className="text-xs opacity-70 leading-relaxed mb-6">
              Nossa equipe técnica está disponível para suporte avançado de Segunda a Sexta.
            </p>
            <div className="space-y-3">
              <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs font-bold flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" /> Enviar E-mail
              </button>
              <button className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 transition-all text-xs font-bold flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
