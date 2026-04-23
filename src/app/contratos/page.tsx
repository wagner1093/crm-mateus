'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Download, Eye, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const contracts = [
  { id: '1', client: 'Tech Solutions Inc', service: 'Tráfego Pago', value: 'R$ 2.500/mês', status: 'Ativo', start: '10/01/2026', end: '10/01/2027' },
  { id: '2', client: 'Fashion Store', service: 'Social Mídia', value: 'R$ 1.200/mês', status: 'Ativo', start: '05/02/2026', end: '05/02/2027' },
  { id: '3', client: 'Loja Y', service: 'Criação de Site', value: 'R$ 3.500', status: 'Encerrado', start: '01/01/2026', end: '15/02/2026' },
];

export default function ContratosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contratos</h2>
          <p className="text-muted-foreground">Gestão de contratos e termos de serviço.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Gerar Contrato</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {contracts.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-premium flex items-center justify-between group hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-lg">{c.client}</p>
                <div className="flex gap-4 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> {c.service}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.start} até {c.end}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-sm font-bold">{c.value}</p>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                  c.status === 'Ativo' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                )}>
                  {c.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
