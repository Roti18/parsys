<script lang="ts">
  import { ChevronDown, Check } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  
  let { 
    id,
    name,
    value = $bindable(),
    options = [],
    required = false,
    placeholder = 'Pilih salah satu...'
  } = $props();

  let isOpen = $state(false);
  let selectContainer: HTMLElement;

  let selectedLabel = $derived(
    options.find((opt: any) => opt.value === value)?.label || placeholder
  );

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function selectOption(val: string) {
    value = val;
    isOpen = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (selectContainer && !selectContainer.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="relative w-full" bind:this={selectContainer}>
  <!-- Hidden input agar tetap bisa disubmit form-nya -->
  <input type="hidden" {name} {id} bind:value {required} />

  <button
    type="button"
    onclick={toggleDropdown}
    class="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#1c1c1e] px-4 py-2.5 text-sm transition-all duration-200 focus:border-blue-500 focus:bg-white dark:focus:bg-[#2c2c2e] focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 dark:hover:border-white/[0.12] cursor-pointer {value ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-zinc-500'}"
  >
    <span class="truncate pr-4">{selectedLabel}</span>
    <ChevronDown class="w-4 h-4 shrink-0 transition-transform duration-200 {isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400 dark:text-zinc-500'}" />
  </button>

  {#if isOpen}
    <div 
      transition:slide={{ duration: 150 }}
      class="absolute z-50 w-full mt-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#1c1c1e] shadow-xl shadow-black/5 dark:shadow-black/20 py-1.5 overflow-auto max-h-60"
    >
      {#if options.length === 0}
        <div class="px-4 py-3 text-sm text-slate-500 dark:text-zinc-500 text-center">
          Tidak ada opsi tersedia
        </div>
      {:else}
        {#each options as option}
          <button
            type="button"
            onclick={() => selectOption(option.value)}
            class="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04] {value === option.value ? 'bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'}"
          >
            <span class="truncate">{option.label}</span>
            {#if value === option.value}
              <Check class="w-4 h-4 shrink-0" />
            {/if}
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>
