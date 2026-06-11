<script lang="ts">
  import { Wallet, TrendingUp, CalendarDays } from 'lucide-svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  import { formatIDR } from '$lib/utils/currency';

  let { data } = $props();

  function formatMonth(monthStr: string) {
    if (!monthStr) return '-';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  }
</script>

<svelte:head>
  <title>Parsys | Laporan Profit</title>
</svelte:head>

<div class="space-y-6 pt-2">

  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
    <StatCard 
      title="Profit Bulan Ini" 
      value={formatIDR(data.currentMonthProfit)} 
      icon={TrendingUp} 
    />
    <StatCard 
      title="Profit Bulan Lalu" 
      value={formatIDR(data.lastMonthProfit)} 
      icon={CalendarDays} 
    />
    <StatCard 
      title="Total Keseluruhan" 
      value={formatIDR(data.overallProfit)} 
      icon={Wallet} 
    />
  </div>

  <div class="bg-white dark:bg-white/[0.02] rounded-2xl  border border-slate-200 dark:border-white/[0.05] overflow-hidden transition-colors duration-300">
    <div class="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-white/[0.05] bg-transparent dark:bg-white/[0.01]">
      <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Rincian Per Bulan</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
        <thead class="bg-slate-50 dark:bg-transparent text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-white/[0.05]">
          <tr>
            <th class="px-4 sm:px-6 py-4">Bulan</th>
            <th class="px-4 sm:px-6 py-4 text-right">Barang Terjual</th>
            <th class="px-4 sm:px-6 py-4 text-right">Omset (Kotor)</th>
            <th class="px-4 sm:px-6 py-4 text-right">Total Fee Admin</th>
            <th class="px-4 sm:px-6 py-4 text-right">Profit Bersih</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          {#if data.profitByMonth.length === 0}
            <tr>
              <td colspan="5" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                Belum ada data profit.
              </td>
            </tr>
          {/if}
          {#each data.profitByMonth as row}
            <tr class="hover:bg-transparent dark:hover:bg-white/[0.04] transition-colors">
              <td class="px-4 sm:px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{formatMonth(row.month)}</td>
              <td class="px-4 sm:px-6 py-4 text-right">{row.qty} pcs</td>
              <td class="px-4 sm:px-6 py-4 text-right font-medium">{formatIDR(row.omset || 0)}</td>
              <td class="px-4 sm:px-6 py-4 text-right text-rose-600 dark:text-rose-400 font-medium">{formatIDR(row.fee || 0)}</td>
              <td class="px-4 sm:px-6 py-4 text-right font-bold {row.profit && row.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
                {formatIDR(row.profit || 0)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
