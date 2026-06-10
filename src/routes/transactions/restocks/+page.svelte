<script lang="ts">
  import { enhance } from '$app/forms';
  import { Plus, ArrowDownToLine } from 'lucide-svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { formatIDR } from '$lib/utils/currency';

  let { data } = $props();
  
  let showModal = $state(false);

  function getTodayDate() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0,16);
  }

  let currentRestock = $state({ product_id: '', tanggal: getTodayDate(), modal: 0, qty: 1 });

  function openAdd() {
    currentRestock = { product_id: '', tanggal: getTodayDate(), modal: 0, qty: 1 };
    showModal = true;
  }
</script>

<div class="bg-white dark:bg-white/[0.02] rounded-2xl  border border-slate-200 dark:border-white/[0.05] overflow-hidden transition-colors duration-300">
  <div class="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-white/[0.05] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent dark:bg-white/[0.01]">
    <div>
      <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Histori Restock</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Catat penambahan stok dan modal barang masuk.</p>
    </div>
    <button onclick={openAdd} class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors  w-full sm:w-auto justify-center">
      <Plus class="w-4 h-4" /> Tambah Restock
    </button>
  </div>

  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
      <thead class="bg-slate-50 dark:bg-transparent text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-white/[0.05]">
        <tr>
          <th class="px-4 sm:px-6 py-4">Tanggal</th>
          <th class="px-4 sm:px-6 py-4">Produk</th>
          <th class="px-4 sm:px-6 py-4">Harga Modal / pcs</th>
          <th class="px-4 sm:px-6 py-4">Qty</th>
          <th class="px-4 sm:px-6 py-4">Total Modal</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
        {#if data.restocks.length === 0}
          <tr>
            <td colspan="5" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
              Belum ada data restock.
            </td>
          </tr>
        {/if}
        {#each data.restocks as item}
          <tr class="hover:bg-transparent dark:hover:bg-white/[0.04] transition-colors">
            <td class="px-4 sm:px-6 py-4">{new Date(item.tanggal).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short'})}</td>
            <td class="px-4 sm:px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
              {item.product.nama} <span class="text-slate-400 dark:text-slate-500 font-normal text-xs ml-1">({item.product.ukuran_ml}ml)</span>
            </td>
            <td class="px-4 sm:px-6 py-4 text-emerald-600 dark:text-emerald-400 font-medium">{formatIDR(item.modal)}</td>
            <td class="px-4 sm:px-6 py-4">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold text-xs border border-blue-100 dark:border-blue-500/20">
                <ArrowDownToLine class="w-3 h-3" /> {item.qty}
              </span>
            </td>
            <td class="px-4 sm:px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{formatIDR(item.modal * item.qty)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<Modal bind:show={showModal} title="Input Restock">
  <form action="?/create" method="POST" use:enhance={() => {
    return async ({ update }) => {
      await update();
      showModal = false;
    };
  }} class="space-y-4">
    
    <div>
      <label for="product_id" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Produk</label>
      <select id="product_id" name="product_id" bind:value={currentRestock.product_id} required class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white  focus:border-blue-500 focus:ring-blue-500 text-sm">
        <option value="" disabled>Pilih Produk...</option>
        {#each data.products as product}
          <option value={product.id}>{product.nama} ({product.ukuran_ml}ml) - {product.sku}</option>
        {/each}
      </select>
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
      <button type="button" onclick={() => showModal = false} class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
        Batal
      </button>
      <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors ">
        Simpan Restock
      </button>
    </div>
  </form>
</Modal>
