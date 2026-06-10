<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { X } from 'lucide-svelte';

  let { show = $bindable(false), title, children } = $props();

  function close() {
    show = false;
  }
</script>

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      transition:fade={{ duration: 250, easing: quintOut }}
      class="absolute inset-0 bg-black/60"
      onclick={close}
    ></div>

    <!-- Modal Panel -->
    <div 
      transition:scale={{ duration: 300, start: 0.95, easing: quintOut }}
      class="relative bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh] border border-slate-200 dark:border-white/[0.05]"
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.05]">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-zinc-100">{title}</h3>
        <button 
          onclick={close}
          class="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-full transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      <div class="p-6 overflow-y-auto">
        {@render children()}
      </div>
    </div>
  </div>
{/if}
