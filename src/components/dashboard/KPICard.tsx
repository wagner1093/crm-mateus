'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from "@/lib/utils"

interface KPICardProps {
  label: string
  value: string | number
  trend?: string
  trendType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  color: string
  subtitle?: string
  className?: string
}

export function KPICard({
  label,
  value,
  trend,
  trendType = 'neutral',
  icon: Icon,
  color,
  subtitle,
  className
}: KPICardProps) {
  return (
    <div 
      className={cn(
        "bg-white/80 backdrop-blur-xl rounded-2xl relative overflow-hidden flex flex-col p-6 shadow-sm border border-white/40 group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      {/* Colored Left Border */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-[4px]" 
        style={{ backgroundColor: color }}
      />

      <div className="flex justify-between items-start w-full mb-4">
        <p className="text-[13px] font-medium text-slate-500">
          {label}
        </p>
        <div 
          className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" 
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-3xl font-semibold text-slate-900 tracking-tight leading-none">
          {value}
        </h3>
        
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={cn(
              "text-[12px] font-semibold",
              trendType === 'positive' && "text-emerald-500",
              trendType === 'negative' && "text-rose-500",
              trendType === 'neutral' && "text-slate-400"
            )}>
              {trend}
            </span>
            {subtitle && (
              <span className="text-[12px] text-slate-400 font-medium">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
