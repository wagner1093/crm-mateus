'use client';

import React from 'react';

interface DocumentInputProps {
  type: 'CPF' | 'CNPJ';
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

function formatCPF(digits: string): string {
  const d = digits.slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

function formatCNPJ(digits: string): string {
  const d = digits.slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0,2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
}

export function DocumentInput({ type, value, onChange, className = '', disabled }: DocumentInputProps) {
  const placeholder = type === 'CPF' ? '000.000.000-00' : '00.000.000/0001-00';
  const maxLen = type === 'CPF' ? 14 : 18;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '');
    onChange(type === 'CPF' ? formatCPF(digits) : formatCNPJ(digits));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const allowed = ['Backspace','Delete','Tab','Escape','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
    if (allowed.includes(e.key) || (e.ctrlKey && ['a','c','v','x'].includes(e.key.toLowerCase()))) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      maxLength={maxLen}
    />
  );
}
