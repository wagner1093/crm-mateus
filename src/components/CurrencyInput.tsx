'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * CurrencyInput — Formata automaticamente como moeda brasileira (1.234,56)
 * enquanto o utilizador digita. Armazena e emite sempre um número puro (float).
 */
export function CurrencyInput({ value, onChange, className = '', placeholder = '0,00', disabled }: CurrencyInputProps) {
  const [display, setDisplay] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincroniza display quando o valor externo muda (ex.: ao abrir modal com dado existente)
  useEffect(() => {
    if (value === 0 || value == null) {
      setDisplay('');
    } else {
      setDisplay(formatDisplay(value));
    }
  }, [value]);

  function formatDisplay(num: number): string {
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Remove tudo que não for dígito
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) { setDisplay(''); onChange(0); return; }

    // Interpreta os últimos 2 dígitos como centavos
    const cents = parseInt(raw, 10);
    const num = cents / 100;

    setDisplay(formatDisplay(num));
    onChange(num);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Permite: backspace, delete, tab, escape, setas
    const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (allowed.includes(e.key) || (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))) return;
    // Bloqueia qualquer tecla não numérica
    if (!/^\d$/.test(e.key)) e.preventDefault();
  }

  function handleFocus() {
    // Move o cursor para o final
    setTimeout(() => {
      if (inputRef.current) {
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }, 0);
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      value={display}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
    />
  );
}
