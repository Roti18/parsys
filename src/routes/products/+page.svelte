<script lang="ts">
  import { enhance } from '$app/forms';
  import { Plus, Edit2, Trash2 } from 'lucide-svelte';
  import Modal from '$lib/components/Modal.svelte';
  import ConfirmDeleteModal from '$lib/components/ConfirmDeleteModal.svelte';
  import Select from '$lib/components/Select.svelte';

  let { data } = $props();
  
  let showModal = $state(false);
  let editMode = $state(false);
  let showDeleteModal = $state(false);
  let deleteTargetId = $state('');
  let currentProduct = $state({ id: '', sku: '', nama: '', ukuran_ml: 30, status: 'ready' });
  let searchQuery = $state('');

  let filteredProducts = $derived(
    data.products.filter(p => 
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  function openAdd() {
    editMode = false;
    currentProduct = { id: '', sku: data.nextSku, nama: '', ukuran_ml: 30, status: 'ready' };
    showModal = true;
  }

  function openEdit(product: any) {
    editMode = true;
    currentProduct = { ...product };
    showModal = true;
  }
</script>

<svelte:head>
  <title>Parsys | Produk</title>
</svelte:head>

<div class="bg-white dark:bg-white/[0.02] rounded-2xl  border border-slate-200 dark:border-white/[0.05] overflow-hidden transition-colors duration-300">
  <div class="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-white/[0.05] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent dark:bg-white/[0.01]">
    <div class="w-full sm:max-w-xs">
      <input type="search" bind:value={searchQuery} placeholder="Cari nama atau SKU produk..." class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-sm" />
    </div>
    <button onclick={openAdd} class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors w-full sm:w-auto justify-center">
      <Plus class="w-4 h-4" /> Tambah Produk
    </button>
  </div>

  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
      <thead class="bg-slate-50 dark:bg-transparent text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-white/[0.05]">
        <tr>
          <th class="px-4 sm:px-6 py-4">SKU</th>
          <th class="px-4 sm:px-6 py-4">Nama Produk</th>
          <th class="px-4 sm:px-6 py-4">Ukuran (ml)</th>
          <th class="px-4 sm:px-6 py-4">Status</th>
          <th class="px-4 sm:px-6 py-4 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
        {#if filteredProducts.length === 0}
          <tr>
            <td colspan="5" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
              Belum ada produk. Tambahkan produk pertama Anda.
            </td>
          </tr>
        {/if}
        {#each filteredProducts as product}
          <tr class="hover:bg-transparent dark:hover:bg-white/[0.04] transition-colors">
            <td class="px-4 sm:px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{product.sku}</td>
            <td class="px-4 sm:px-6 py-4">{product.nama}</td>
            <td class="px-4 sm:px-6 py-4">{product.ukuran_ml} ml</td>
            <td class="px-4 sm:px-6 py-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {product.status === 'ready' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400'}">
                {product.status === 'ready' ? 'Ready' : 'Habis'}
              </span>
            </td>
            <td class="px-4 sm:px-6 py-4 text-right space-x-2">
              <button onclick={() => openEdit(product)} class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors">
                <Edit2 class="w-4 h-4" />
              </button>
              <button onclick={() => { deleteTargetId = product.id; showDeleteModal = true; }} class="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors">
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<Modal bind:show={showModal} title={editMode ? 'Edit Produk' : 'Tambah Produk'}>
  <form action={editMode ? '?/update' : '?/create'} method="POST" use:enhance={() => {
    return async ({ update }) => {
      await update();
      showModal = false;
    };
  }} class="space-y-4">
    {#if editMode}
      <input type="hidden" name="id" value={currentProduct.id} />
    {/if}
    
    <div>
      <label for="sku" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
      <input type="text" id="sku" name="sku" bind:value={currentProduct.sku} required class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white  focus:border-blue-500 focus:ring-blue-500 text-sm" placeholder="Contoh: PRF-001" />
    </div>

    <div>
      <label for="nama" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Parfum</label>
      <input type="text" id="nama" name="nama" bind:value={currentProduct.nama} required class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white  focus:border-blue-500 focus:ring-blue-500 text-sm" />
    </div>

    <div>
      <label for="ukuran_ml" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ukuran (ml)</label>
      <input type="number" id="ukuran_ml" name="ukuran_ml" bind:value={currentProduct.ukuran_ml} required min="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white  focus:border-blue-500 focus:ring-blue-500 text-sm" />
    </div>

    <div>
      <label for="status" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
      <Select 
        id="status" 
        name="status" 
        bind:value={currentProduct.status} 
        options={[
          { value: 'ready', label: 'Ready' },
          { value: 'habis', label: 'Habis' }
        ]} 
      />
    </div>

    <div class="pt-4 flex justify-end gap-3">
      <button type="button" onclick={() => showModal = false} class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
        Batal
      </button>
      <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors ">
        Simpan
      </button>
    </div>
  </form>
</Modal>

<ConfirmDeleteModal 
  bind:show={showDeleteModal} 
  action="?/delete" 
  id={deleteTargetId} 
  message="Apakah Anda yakin ingin menghapus data produk ini? Tindakan ini tidak dapat dibatalkan." 
/>
