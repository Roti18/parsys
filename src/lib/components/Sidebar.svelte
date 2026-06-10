<script lang="ts">
  import { fade } from 'svelte/transition';
  import { LayoutDashboard, Package, Truck, ShoppingCart, TrendingUp, X } from 'lucide-svelte';
  import { page } from '$app/stores';

  let { isOpen = $bindable(false) } = $props();

  const menu = [
    { title: 'Dashboard', href: '/', icon: LayoutDashboard, color: 'text-[#32ade6]' },
    { title: 'Produk', href: '/products', icon: Package, color: 'text-[#ffcc00]' },
    { title: 'Restock', href: '/transactions/restocks', icon: Truck, color: 'text-[#ff2d55]' },
    { title: 'Penjualan', href: '/transactions/sales', icon: ShoppingCart, color: 'text-[#34c759]' },
    { title: 'Laporan Profit', href: '/reports/profit', icon: TrendingUp, color: 'text-[#00c7be]' }
  ];

  function close() {
    isOpen = false;
  }
</script>

<!-- Mobile Overlay -->
{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    transition:fade={{ duration: 200 }}
    class="fixed inset-0 bg-black/60 z-40 lg:hidden"
    onclick={close}
  ></div>
{/if}

<aside class="fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#1c1c1e] border-r border-slate-200 dark:border-transparent flex flex-col z-50 transform lg:translate-x-0 {isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
  
  <!-- Mac Window Controls -->
  <div class="h-14 flex items-center px-4 gap-2 pt-2">
    <div class="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
    <div class="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
    <div class="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
    <button onclick={close} class="lg:hidden ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1 rounded-md">
      <X class="w-4 h-4" />
    </button>
  </div>

  <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto mt-2">
    {#each menu as item}
      {@const isActive = $page.url.pathname === item.href || ($page.url.pathname.startsWith(item.href) && item.href !== '/')}
      <a
        href={item.href}
        onclick={close}
        class="flex items-center gap-3 px-3 py-2 rounded-md text-[15px] font-medium transition-colors duration-150 {isActive ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-white/5 dark:hover:text-zinc-200'}"
      >
        <svelte:component this={item.icon} strokeWidth={2.5} class="w-4 h-4 {item.color}" />
        {item.title}
      </a>
    {/each}
  </nav>
</aside>
