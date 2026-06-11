<script lang="ts">
  import { page } from '$app/stores';
  import { Menu, Sun, Moon, LogOut } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';

  let { sidebarOpen = $bindable(false), user = null } = $props();

  let isDark = $state(false);

  onMount(() => {
    isDark = document.documentElement.classList.contains('dark');
  });

  function toggleTheme() {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }

  let title = $derived(() => {
    const path = $page.url.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/products')) return 'Produk';
    if (path.startsWith('/transactions/restocks')) return 'Restock';
    if (path.startsWith('/transactions/sales')) return 'Penjualan';
    if (path.startsWith('/reports/profit')) return 'Laporan Profit';
    return 'Parsys';
  });
</script>

<header class="h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 bg-slate-50/80 dark:bg-[#141414]/80 backdrop-blur-xl">
  <div class="flex items-center gap-3">
    <button 
      onclick={() => sidebarOpen = true}
      class="lg:hidden text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 p-1 rounded-md"
    >
      <Menu class="w-6 h-6" />
    </button>
    <h1 class="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{title()}</h1>
  </div>
  <div class="flex items-center gap-2 sm:gap-4">
    <button 
      onclick={toggleTheme}
      class="text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 p-2 rounded-full transition-colors"
      aria-label="Toggle dark mode"
    >
      {#if isDark}
        <Sun class="w-5 h-5" />
      {:else}
        <Moon class="w-5 h-5" />
      {/if}
    </button>
    
    {#if user}
      <div class="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200 dark:border-white/[0.08]">
        <span class="text-sm font-medium text-slate-700 dark:text-zinc-300 hidden sm:block">
          {user.email.split('@')[0]}
        </span>
        <form action="/logout" method="POST">
          <button type="submit" class="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-md transition-colors" title="Logout">
            <LogOut class="w-4 h-4" />
          </button>
        </form>
      </div>
    {/if}
  </div>
</header>
