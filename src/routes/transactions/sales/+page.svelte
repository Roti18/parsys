<script lang="ts">
  import { enhance } from '$app/forms';
  import { Plus, ArrowUpFromLine, Pencil, Trash2 } from 'lucide-svelte';
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

  let filteredSales = $derived(
    data.sales.filter(s => 
      s.product.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.channel.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  function getTodayDate() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0,16);
  }

  let currentSale = $state({ id: '', product_id: '', tanggal: getTodayDate(), harga_jual: 0, fee: 0, channel: 'Shopee', qty: 1 });

  function openAdd() {
    isEditing = false;
    currentSale = { id: '', product_id: '', tanggal: getTodayDate(), harga_jual: 0, fee: 0, channel: 'Shopee', qty: 1 };
    showModal = true;
  }

  function openEdit(sale: any) {
    isEditing = true;
    const d = new Date(sale.tanggal);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    currentSale = {
      id: sale.id,
      product_id: sale.product_id,
      tanggal: d.toISOString().slice(0,16),
      harga_jual: sale.harga_jual,
      fee: sale.fee,
      channel: sale.channel,
      qty: sale.qty
    };
    showModal = true;
  }
</script>

<svelte:head>
  <title>Parsys | Penjualan</title>
</svelte:head>

<div class="bg-white dark:bg-white/[0.02] rounded-2xl  border border-slate-200 dark:border-white/[0.05] overflow-hidden transition-colors duration-300 w-full">
  <div class="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-white/[0.05] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent dark:bg-white/[0.01]">
    <div class="w-full sm:max-w-xs">
      <input type="search" bind:value={searchQuery} placeholder="Cari produk atau channel..." class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-sm" />
    </div>
    <button onclick={openAdd} class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors w-full sm:w-auto justify-center">
      <Plus class="w-4 h-4" /> Input Penjualan
    </button>
  </div>

  <div class="overflow-x-auto w-full">
    <table class="w-full text-left text-sm text-slate-600 dark:text-slate-300">
      <thead class="bg-slate-50 dark:bg-transparent text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-white/[0.05]">
        <tr>
          <th class="px-4 sm:px-6 py-4 whitespace-nowrap">Tanggal</th>
          <th class="px-4 sm:px-6 py-4 whitespace-nowrap">Produk</th>
          <th class="px-4 sm:px-6 py-4 whitespace-nowrap">Channel</th>
          <th class="px-4 sm:px-6 py-4 whitespace-nowrap">Harga Jual & Qty</th>
          <th class="px-4 sm:px-6 py-4 whitespace-nowrap">Modal / pcs</th>
          <th class="px-4 sm:px-6 py-4 whitespace-nowrap">Admin Fee</th>
          <th class="px-4 sm:px-6 py-4 whitespace-nowrap">Profit Bersih</th>
          <th class="px-4 sm:px-6 py-4 text-right whitespace-nowrap">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
        {#if filteredSales.length === 0}
          <tr>
            <td colspan="8" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
              Belum ada data penjualan.
            </td>
          </tr>
        {/if}
        {#each filteredSales as item}
          {@const gross = item.harga_jual * item.qty}
          {@const totalModal = item.modal * item.qty}
          {@const profit = gross - totalModal - item.fee}
          <tr class="hover:bg-transparent dark:hover:bg-white/[0.04] transition-colors">
            <td class="px-4 sm:px-6 py-4 whitespace-nowrap">{new Date(item.tanggal).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short'})}</td>
            <td class="px-4 sm:px-6 py-4 font-medium text-slate-900 dark:text-slate-200 whitespace-nowrap">
              {item.product.nama} <span class="text-slate-400 dark:text-slate-500 font-normal text-xs ml-1">({item.product.ukuran_ml}ml)</span>
            </td>
            <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                {item.channel === 'Shopee' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' : 
                 item.channel === 'Tokopedia' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' : 
                 item.channel === 'Offline' ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600' : 
                 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'}">
                {item.channel}
              </span>
            </td>
            <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
              <div class="flex flex-col">
                <span class="font-medium text-slate-900 dark:text-slate-200">{formatIDR(item.harga_jual)} <span class="text-xs text-slate-500 dark:text-slate-400 font-normal">/pcs</span></span>
                <span class="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                  <ArrowUpFromLine class="w-3 h-3" /> Qty: {item.qty}
                </span>
              </div>
            </td>
            <td class="px-4 sm:px-6 py-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatIDR(item.modal)}</td>
            <td class="px-4 sm:px-6 py-4 text-rose-600 dark:text-rose-400 whitespace-nowrap">{formatIDR(item.fee)}</td>
            <td class="px-4 sm:px-6 py-4 font-bold whitespace-nowrap {profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
              {formatIDR(profit)}
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

<Modal bind:show={showModal} title={isEditing ? "Edit Penjualan" : "Input Penjualan"}>
  <form action={isEditing ? "?/update" : "?/create"} method="POST" use:enhance={() => {
    isSubmitting = true;
    return async ({ update }) => {
      await update();
      isSubmitting = false;
      showModal = false;
    };
  }} class="space-y-4">
    {#if isEditing}
      <input type="hidden" name="id" value={currentSale.id} />
    {/if}
    
    <div>
      <label for="product_id" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Produk</label>
      <Select 
        id="product_id" 
        name="product_id" 
        bind:value={currentSale.product_id} 
        required 
        placeholder="Pilih Produk"
        options={data.products.map(p => ({ value: p.id, label: `${p.sku} - ${p.nama} (${p.ukuran_ml}ml)` }))}
      />
    </div>

    <div>
      <label for="tanggal" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Waktu Transaksi</label>
      <input type="datetime-local" id="tanggal" name="tanggal" bind:value={currentSale.tanggal} required class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white  focus:border-blue-500 focus:ring-blue-500 text-sm" />
    </div>

    <div>
      <label for="channel" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Channel Penjualan</label>
      <Select 
        id="channel" 
        name="channel" 
        bind:value={currentSale.channel} 
        placeholder="Pilih Channel"
        options={[
          { value: 'Shopee', label: 'Shopee' },
          { value: 'Tokopedia', label: 'Tokopedia' },
          { value: 'Tiktok Shop', label: 'TikTok Shop' },
          { value: 'WhatsApp', label: 'WhatsApp (Direct)' },
          { value: 'Offline', label: 'Toko Offline' },
          { value: 'Lainnya', label: 'Lainnya' }
        ]}
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="harga_jual" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Harga Jual / pcs</label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span class="text-slate-500 dark:text-slate-400 sm:text-sm">Rp</span>
          </div>
          <input type="number" id="harga_jual" name="harga_jual" bind:value={currentSale.harga_jual} required min="0" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white pl-9  focus:border-blue-500 focus:ring-blue-500 text-sm" />
        </div>
      </div>
      <div>
        <label for="qty" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jumlah Terjual (Qty)</label>
        <input type="number" id="qty" name="qty" bind:value={currentSale.qty} required min="1" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white  focus:border-blue-500 focus:ring-blue-500 text-sm" />
      </div>
    </div>

    <div>
      <label for="fee" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Admin Fee / Potongan Marketplace</label>
      <div class="relative">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span class="text-slate-500 dark:text-slate-400 sm:text-sm">Rp</span>
        </div>
        <input type="number" id="fee" name="fee" bind:value={currentSale.fee} required min="0" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white pl-9  focus:border-blue-500 focus:ring-blue-500 text-sm" />
      </div>
      <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Biaya admin dari marketplace (total untuk transaksi ini).</p>
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
          <span class="opacity-0">Simpan Penjualan</span>
        {:else}
          Simpan Penjualan
        {/if}
      </button>
    </div>
  </form>
</Modal>

<ConfirmDeleteModal 
  bind:show={showDeleteModal} 
  action="?/delete" 
  id={deleteTargetId} 
  message="Apakah Anda yakin ingin menghapus data penjualan ini? Tindakan ini tidak dapat dibatalkan." 
/>
