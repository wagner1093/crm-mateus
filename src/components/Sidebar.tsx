'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Kanban, 
  Users, 
  DollarSign, 
  Briefcase, 
  FileText, 
  Send, 
  LifeBuoy, 
  Sparkles, 
  Settings,
  LogOut,
  UserPlus2,
  Box,
  ClipboardList,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Kanban, label: 'Pipeline', href: '/pipeline' },
  { icon: Send, label: 'Propostas', href: '/propostas' },
  { icon: Briefcase, label: 'Serviços', href: '/servicos' },
  { icon: Box, label: 'Estoque', href: '/estoque' },
  { icon: DollarSign, label: 'Financeiro', href: '/financeiro' },
  { icon: UserCheck, label: 'Clientes', href: '/clientes' },
  { icon: UserPlus2, label: 'Equipe', href: '/equipe' },
  { icon: ClipboardList, label: 'Contratos', href: '/contratos' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={false}
      animate={{ width: isHovered ? 240 : 70 }}
      transition={{ duration: 0.20, ease: "easeOut" }}
      className="fixed left-4 top-4 bottom-4 bg-[#111111] rounded-[1.5rem] flex flex-col py-6 z-50 shadow-2xl overflow-hidden"
    >
      {/* Brand / Logo */}
      <div className="px-4 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg shrink-0">
          <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
            <Sparkles className="text-white w-4 h-4" />
          </div>
        </div>
        <AnimatePresence mode="wait">
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.1 }}
              className="text-white font-bold text-lg whitespace-nowrap"
            >
              Mateus
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 h-11 w-full rounded-xl transition-all duration-200 justify-start",
                  isActive 
                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                )}
              >
                <div className="min-w-[54px] flex items-center justify-center shrink-0">
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-200 group-hover:scale-110", 
                    isActive ? "text-black" : "text-zinc-500 group-hover:text-zinc-300"
                  )} />
                </div>
                <AnimatePresence mode="wait">
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.1 }}
                      className="text-[13px] font-semibold whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer / Profile */}
      <div className="mt-auto w-full flex flex-col gap-1 px-2 pb-2">
        <div className="h-px bg-zinc-800/50 my-4 mx-2" />
        
        <motion.div 
          whileHover={{ x: 4 }}
          className="flex items-center gap-3 h-12 w-full rounded-xl transition-all cursor-pointer hover:bg-zinc-800/50"
        >
          <div className="min-w-[54px] flex items-center justify-center shrink-0">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-zinc-800 font-bold text-black text-xs shadow-lg"
            >
              M
            </motion.div>
          </div>
          <AnimatePresence mode="wait">
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.1 }}
                className="flex flex-col overflow-hidden whitespace-nowrap"
              >
                <p className="text-white text-[13px] font-bold">Mateus Wagner</p>
                <p className="text-zinc-500 text-[11px]">Administrador</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div whileHover={{ x: 4 }}>
          <Link 
            href="/suporte"
            className="flex items-center gap-3 h-11 w-full text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all"
          >
            <div className="min-w-[54px] flex items-center justify-center shrink-0">
              <LifeBuoy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </div>
            <AnimatePresence mode="wait">
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.1 }}
                  className="text-[13px] font-semibold whitespace-nowrap"
                >
                  Suporte
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </motion.div>

        <motion.div whileHover={{ x: 4 }}>
          <button className="flex items-center gap-3 h-11 w-full text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
            <div className="min-w-[54px] flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <AnimatePresence mode="wait">
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.1 }}
                  className="text-[13px] font-semibold whitespace-nowrap"
                >
                  Sair da conta
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      </div>
    </motion.aside>
  );
}
