<script lang="ts">
  import { Wallet, TrendingUp, Package, Box, ShoppingCart, Plus, Truck, ArrowRight, Activity } from 'lucide-svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  import { formatIDR } from '$lib/utils/currency';
  import { page } from '$app/stores';

  let { data } = $props();

  let user = $derived($page.data.user);

  let greeting = $derived(() => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  });
</script>

<div class="space-y-10 pb-12 pt-2">
  <!-- Welcome Area -->
  <div>
    <h2 class="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">{greeting()}, {user?.email.split('@')[0]}</h2>
    <p class="text-slate-500 dark:text-zinc-500 mt-1">Pantau performa penjualan parfummu hari ini.</p>
  </div>

  <!-- Key Metrics -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard 
      title="Total Profit Bersih" 
      value={formatIDR(data.totalProfit)} 
      icon={TrendingUp} 
      highlight={true}
    />
    <StatCard 
      title="Total Omset Kotor" 
      value={formatIDR(data.totalOmset)} 
      icon={Wallet} 
    />
    <StatCard 
      title="Barang Terjual" 
      value="{data.barangTerjual} pcs" 
      icon={Package} 
    />
    <StatCard 
      title="Stok Tersisa" 
      value="{data.stokTersisa} pcs" 
      icon={Box} 
    />
  </div>

  <!-- Quick Actions -->
  <div>
    <h3 class="text-sm font-semibold text-slate-900 dark:text-zinc-400 mb-4 uppercase tracking-wider">Aksi Cepat</h3>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <a href="/transactions/sales" class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.03] hover:dark:bg-white/[0.06] transition-colors">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-[#34c759]">
          <ShoppingCart class="w-4 h-4" strokeWidth={2.5} />
        </div>
        <div>
          <h3 class="font-medium text-sm text-slate-900 dark:text-zinc-200">Input Penjualan</h3>
        </div>
      </a>
      
      <a href="/transactions/restocks" class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.03] hover:dark:bg-white/[0.06] transition-colors">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-[#ff2d55]">
          <Truck class="w-4 h-4" strokeWidth={2.5} />
        </div>
        <div>
          <h3 class="font-medium text-sm text-slate-900 dark:text-zinc-200">Restock Barang</h3>
        </div>
      </a>

      <a href="/products" class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.03] hover:dark:bg-white/[0.06] transition-colors">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-[#ffcc00]">
          <Package class="w-4 h-4" strokeWidth={2.5} />
        </div>
        <div>
          <h3 class="font-medium text-sm text-slate-900 dark:text-zinc-200">Kelola Produk</h3>
        </div>
      </a>
    </div>
  </div>

  <!-- Recent Activity -->
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-sm font-semibold text-slate-900 dark:text-zinc-400 uppercase tracking-wider">Penjualan Terakhir</h3>
      <a href="/transactions/sales" class="text-xs font-medium text-[#32ade6] hover:text-[#32ade6]/80 flex items-center gap-1">
        Lihat Semua <ArrowRight class="w-3 h-3" />
      </a>
    </div>
    
    <div class="rounded-2xl bg-white dark:bg-white/[0.02] overflow-hidden">
      {#if data.recentSales.length === 0}
        <div class="p-8 text-center">
          <p class="text-slate-500 dark:text-zinc-500 text-sm">Belum ada penjualan tercatat</p>
        </div>
      {/if}
      
      <div class="divide-y divide-slate-100 dark:divide-white/[0.05]">
        {#each data.recentSales as sale}
          <div class="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-[#32ade6]">
                <Package class="w-4 h-4" />
              </div>
              <div>
                <p class="font-medium text-sm text-slate-900 dark:text-zinc-200">{sale.product.nama}</p>
                <p class="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">{new Date(sale.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})} • {sale.channel} • {sale.qty} pcs</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-medium text-sm text-slate-900 dark:text-zinc-300">+{formatIDR(sale.harga_jual * sale.qty)}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
