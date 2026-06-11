<script lang="ts">
  import { ChevronDown } from 'lucide-svelte';
  
  let { 
    id,
    name,
    value = $bindable(),
    options = [],
    required = false,
    placeholder = 'Pilih salah satu...'
  } = $props();
</script>

<div class="relative group">
  <select
    {id}
    {name}
    bind:value
    {required}
    class="w-full appearance-none rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#1c1c1e] px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-white transition-all duration-200 focus:border-blue-500 focus:bg-white dark:focus:bg-[#2c2c2e] focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 dark:hover:border-white/[0.12] cursor-pointer"
  >
    <option value="" disabled>{placeholder}</option>
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 group-hover:text-slate-500 dark:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
    <ChevronDown class="w-4 h-4" />
  </div>
</div>
