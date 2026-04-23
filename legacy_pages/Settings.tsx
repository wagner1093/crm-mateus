import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Palette, Save, Moon, Sun, User, Laptop } from 'lucide-react';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <header>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Configurações</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Personalize seu ambiente de trabalho e preferências do sistema.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {/* Notificações */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div className="fin-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <Bell size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b' }}>Notificações</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, color: '#1e293b' }}>Alertas de Vencimento</p>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Avisar quando uma fatura estiver próxima.</p>
              </div>
              <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, color: '#1e293b' }}>Relatórios Semanais</p>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Receber resumo financeiro por e-mail.</p>
              </div>
              <input type="checkbox" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }} />
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div className="fin-icon-box" style={{ background: '#fefce8', color: '#ca8a04' }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b' }}>Segurança</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <User size={18} /> Alterar Senha Administrativa
            </button>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <Laptop size={18} /> Gerenciar Dispositivos
            </button>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', color: '#f43f5e' }}>
              Limpar Cache do Sistema
            </button>
          </div>
        </div>

        {/* Aparência */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div className="fin-icon-box" style={{ background: '#fdf2f8', color: '#db2777' }}>
              <Palette size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b' }}>Aparência</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '4px' }}>Tema do Sistema</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
               <button 
                 onClick={() => setDarkMode(false)}
                 style={{ 
                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', 
                   borderRadius: '12px', border: !darkMode ? '2px solid var(--accent-primary)' : '1px solid #e2e8f0',
                   background: !darkMode ? '#eff6ff' : 'white', cursor: 'pointer'
                 }}
               >
                 <Sun size={20} color={!darkMode ? 'var(--accent-primary)' : '#64748b'} />
                 <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Claro (Padrão)</span>
               </button>
               <button 
                 onClick={() => setDarkMode(true)}
                 style={{ 
                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', 
                   borderRadius: '12px', border: darkMode ? '2px solid var(--accent-primary)' : '1px solid #e2e8f0',
                   background: darkMode ? '#eff6ff' : 'white', cursor: 'pointer'
                 }}
               >
                 <Moon size={20} color={darkMode ? 'var(--accent-primary)' : '#64748b'} />
                 <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Escuro</span>
               </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
        <button className="btn-secondary">Cancelar</button>
        <button className="btn-primary">
          <Save size={20} /> Salvar Preferências
        </button>
      </div>
    </motion.div>
  );
}
