<script lang="ts">
  import { enhance } from '$app/forms';
  import { Package, Loader2 } from 'lucide-svelte';

  let { form } = $props();
  let loading = $state(false);
</script>

<svelte:head>
  <title>Parsys | Login</title>
</svelte:head>

<div class="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#f5f5f7] dark:bg-black overflow-hidden transition-colors duration-300">
  
  <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
    <div class="flex justify-center text-slate-900 dark:text-white">
      <Package class="w-12 h-12 stroke-[1.5]" />
    </div>
    <h2 class="mt-6 text-center text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
      Masuk ke Parsys
    </h2>
    <p class="mt-2 text-center text-sm text-slate-500 dark:text-zinc-400">
      Atau
      <a href="/register" class="font-medium text-blue-500 hover:text-blue-400 transition-colors">
        daftar akun baru
      </a>
    </p>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
    <div class="bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-2xl py-8 px-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/80 dark:border-white/[0.05] rounded-3xl">
      <form class="space-y-5" method="POST" use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          loading = false;
          update();
        };
      }}>
        {#if form?.message}
          <div class="p-3 bg-rose-50/80 backdrop-blur-md text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 text-sm rounded-xl border border-rose-200/50 dark:border-rose-500/20">
            {form.message}
          </div>
        {/if}

        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 dark:text-zinc-300 ml-1">
            Email address
          </label>
          <div class="mt-1.5">
            <input id="email" name="email" type="email" autocomplete="email" required disabled={loading} class="appearance-none block w-full px-4 py-3 border border-slate-200/50 dark:border-white/[0.05] rounded-xl  placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white disabled:opacity-50 transition-colors">
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-700 dark:text-zinc-300 ml-1">
            Password
          </label>
          <div class="mt-1.5">
            <input id="password" name="password" type="password" autocomplete="current-password" required disabled={loading} class="appearance-none block w-full px-4 py-3 border border-slate-200/50 dark:border-white/[0.05] rounded-xl  placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white disabled:opacity-50 transition-colors">
          </div>
        </div>

        <div class="flex items-center justify-between pt-1">
          <div class="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" disabled={loading} class="h-4 w-4 text-blue-500 focus:ring-blue-500 border-slate-300 dark:border-white/[0.1] rounded bg-white dark:bg-black/20 disabled:opacity-50">
            <label for="remember-me" class="ml-2 block text-sm text-slate-700 dark:text-zinc-300">
              Ingat saya
            </label>
          </div>
        </div>

        <div class="pt-3">
          <button type="submit" disabled={loading} class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl  text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-white disabled:opacity-70 transition-colors">
            {#if loading}
              <Loader2 class="w-4 h-4 animate-spin" />
            {/if}
            Masuk
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
