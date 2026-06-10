<script lang="ts">
  import type { ComponentType } from 'svelte';
  
  let { title, value, icon, trend = null, trendLabel = '', highlight = false } = $props<{
    title: string;
    value: string | number;
    icon: ComponentType;
    trend?: 'up' | 'down' | 'neutral' | null;
    trendLabel?: string;
    highlight?: boolean;
  }>();
</script>

<div class="rounded-2xl p-5 relative overflow-hidden transition-colors {highlight ? 'bg-[#32ade6]/10 text-white' : 'bg-white dark:bg-white/[0.03] text-slate-900 dark:text-zinc-100'}">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-[13px] font-medium {highlight ? 'text-[#32ade6]' : 'text-slate-500 dark:text-zinc-500'} mb-1">{title}</p>
      <h3 class="text-2xl font-bold {highlight ? 'text-[#32ade6]' : 'text-slate-800 dark:text-zinc-100'}">{value}</h3>
      
      {#if trend}
        <div class="mt-1 flex items-center text-[11px]">
          <span class="font-medium {highlight ? 'text-[#32ade6]/70' : trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-zinc-500'}">
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '-'} {trendLabel}
          </span>
        </div>
      {/if}
    </div>
    <div class="w-10 h-10 flex items-center justify-center {highlight ? 'text-[#32ade6]' : 'text-slate-400 dark:text-zinc-600'}">
      <svelte:component this={icon} strokeWidth={2.5} class="w-5 h-5" />
    </div>
  </div>
</div>
