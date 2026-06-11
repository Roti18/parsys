<script lang="ts">
  import { enhance } from '$app/forms';
  import Modal from '$lib/components/Modal.svelte';
  
  let { 
    show = $bindable(false), 
    action, 
    id, 
    title = "Konfirmasi Hapus", 
    message = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan." 
  } = $props();
</script>

<Modal bind:show={show} title={title}>
  <form action={action} method="POST" use:enhance={() => {
    return async ({ update }) => {
      await update();
      show = false;
    };
  }}>
    <input type="hidden" name="id" value={id} />
    <div class="text-slate-600 dark:text-slate-300 mb-6">
      {message}
    </div>
    <div class="flex justify-end gap-3">
      <button type="button" onclick={() => show = false} class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
        Batal
      </button>
      <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors">
        Ya, Hapus
      </button>
    </div>
  </form>
</Modal>
