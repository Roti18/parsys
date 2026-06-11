<script lang="ts">
  import { enhance } from '$app/forms';
  import { Plus, ArrowDownToLine, Pencil, Trash2, Loader2 } from 'lucide-svelte';
  import Modal from '$lib/components/Modal.svelte';
  import ConfirmDeleteModal from '$lib/components/ConfirmDeleteModal.svelte';
  import Select from '$lib/components/Select.svelte';
  import { formatIDR } from '$lib/utils/currency';

  let { data } = $props();
  
  let showModal = $state(false);
  let isEditing = $state(false);
  let showDeleteModal = $state(false);
  let deleteTargetId = $state('');
  let isSubmitting = $state(false);
  let searchQuery = $state('');

  let filteredRestocks = $derived(
    data.restocks.filter(r => 
      r.product.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  function getTodayDate() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0,16);
  }

  let currentRestock = $state({ id: '', product_id: '', tanggal: getTodayDate(), modal: 0, qty: 1 });

  function openAdd() {
    isEditing = false;
    currentRestock = { id: '', product_id: '', tanggal: getTodayDate(), modal: 0, qty: 1 };
    showModal = true;
  }

  function openEdit(restock: any) {
    isEditing = true;
    const d = new Date(restock.tanggal);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    currentRestock = {
      id: restock.id,
      product_id: restock.product_id,
      tanggal: d.toISOString().slice(0,16),
      modal: restock.modal,
      qty: restock.qty
    };
    showModal = true;
  }
</script>

<svelte:head>
  <title>Parsys | Restock</title>
</svelte:head>

<div class="bg-white dark:bg-white/[0.02] rounded-2xl  border border-slate-200 dark:border-white/[0.05] overflow-hidden transition-colors duration-300 w-full">
  <div class="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-white/[0.05] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent dark:bg-white/[0.01]">
    <div class="w-full sm:max-w-xs">
      <input type="search" bind:value={searchQuery} placeholder="Cari produk atau SKU..." class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-sm" />
    </div>
    <button onclick={openAdd} class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors w-full sm:w-auto justify-center">
      <Plus class="w-4 h-4" /> Tambah Restock
    </button>
  </div>

  <div class="overflow-x-auto w-full">
    <table class="w-full text-left text-sm text-slate-600 dark:text-slate-300">
      <thead class="bg-slate-50 dark:bg-transparent text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-white/[0.05]">
        <tr>
          <th class="px-4 sm:px-6 py-4 whitespace-nowrap">Tanggal</th>
          <th class="px-4 sm:px-6 py-4 whitespace-nowrap">Produk</th>
          <th class="px-4 sm:px-6 py-4 whitespace-nowrap">Harga Modal / pcs</th>
          <th class="px-4 sm:px-6 py-4 whitespace-nowrap">Sisa / Total Qty</th>
          <th class="px-4 sm:px-6 py-4 text-right whitespace-nowrap">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
        {#if filteredRestocks.length === 0}
          <tr>
            <td colspan="5" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
              Belum ada data restock.
            </td>
          </tr>
        {/if}
        {#each filteredRestocks as item}
          <tr class="hover:bg-transparent dark:hover:bg-white/[0.04] transition-colors">
            <td class="px-4 sm:px-6 py-4 whitespace-nowrap">{new Date(item.tanggal).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short'})}</td>
            <td class="px-4 sm:px-6 py-4 font-medium text-slate-900 dark:text-slate-200 whitespace-nowrap">
              {item.product.nama} <span class="text-slate-400 dark:text-slate-500 font-normal text-xs ml-1">({item.product.ukuran_ml}ml)</span>
            </td>
            <td class="px-4 sm:px-6 py-4 font-medium whitespace-nowrap">{formatIDR(item.modal)}</td>
            <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-1.5">
                <span class="font-semibold {item.sisa_qty > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">{item.sisa_qty}</span>
                <span class="text-slate-400 dark:text-slate-500">/</span>
                <span class="text-slate-600 dark:text-slate-300">{item.qty}</span>
              </div>
            </td>
            <td class="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-2">
                <button onclick={() => openEdit(item)} class="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Edit">
                  <Pencil class="w-4 h-4" />
                </button>
                <button onclick={() => { deleteTargetId = item.id; showDeleteModal = true; }} class="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors" title="Hapus">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<Modal bind:show={showModal} title={isEditing ? "Edit Restock" : "Input Restock"}>
  <form action={isEditing ? "?/update" : "?/create"} method="POST" use:enhance={() => {
    isSubmitting = true;
    return async ({ update }) => {
      await update();
      isSubmitting = false;
      showModal = false;
    };
  }} class="space-y-4">
    {#if isEditing}
      <input type="hidden" name="id" value={currentRestock.id} />
    {/if}
    
    <div>
      <label for="product_id" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Produk</label>
      <Select 
        id="product_id" 
        name="product_id" 
        bind:value={currentRestock.product_id} 
        required 
        placeholder="Pilih Produk"
        options={data.products.map(p => ({ value: p.id, label: `${p.sku} - ${p.nama} (${p.ukuran_ml}ml)` }))}
      />
    </div>

    <div>
      <label for="tanggal" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Waktu Restock</label>
      <input type="datetime-local" id="tanggal" name="tanggal" bind:value={currentRestock.tanggal} required class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white  focus:border-blue-500 focus:ring-blue-500 text-sm" />
    </div>

    <div>
      <label for="modal" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Harga Modal / pcs</label>
      <div class="relative">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span class="text-slate-500 dark:text-slate-400 sm:text-sm">Rp</span>
        </div>
        <input type="number" id="modal" name="modal" bind:value={currentRestock.modal} required min="0" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white pl-9  focus:border-blue-500 focus:ring-blue-500 text-sm" />
      </div>
      <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Harga beli satuan dari supplier.</p>
    </div>

    <div>
      <label for="qty" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jumlah Masuk (Qty)</label>
      <input type="number" id="qty" name="qty" bind:value={currentRestock.qty} required min="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white  focus:border-blue-500 focus:ring-blue-500 text-sm" />
    </div>

    <div class="pt-4 flex justify-end gap-3">
      <button type="button" disabled={isSubmitting} onclick={() => showModal = false} class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50">
        Batal
      </button>
      <button type="submit" disabled={isSubmitting} class="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 relative">
        {#if isSubmitting}
          <div class="absolute inset-0 flex items-center justify-center">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <span class="opacity-0">Simpan Restock</span>
        {:else}
          Simpan Restock
        {/if}
      </button>
    </div>
  </form>
</Modal>

<ConfirmDeleteModal 
  bind:show={showDeleteModal} 
  action="?/delete" 
  id={deleteTargetId} 
  message="Apakah Anda yakin ingin menghapus data restock ini? Tindakan ini tidak dapat dibatalkan." 
/>
