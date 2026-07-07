import { db } from '$lib/server/db';
import { products, restocks, sales } from '$lib/server/db/schema';
import { sum, sql, eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return {
			omzet: 0,
			pendapatanSetelahFee: 0,
			totalHPP: 0,
			profitBersih: 0,
			nilaiStok: 0,
			barangTerjual: 0,
			recentSales: []
		};
	}

	// Omzet = Σ Harga Jual (total seluruh penjualan sebelum dikurangi biaya apa pun)
	const omzetResult = await db.select({ value: sum(sales.harga_jual) }).from(sales).where(eq(sales.user_id, locals.user.id));
	const omzet = Number(omzetResult[0]?.value) || 0;

	// Pendapatan Setelah Fee = Σ (Harga Jual - Admin Fee) = Omzet - Total Admin Fee
	const pendapatanResult = await db.select({
		value: sum(sql`${sales.harga_jual} - ${sales.fee}`)
	}).from(sales).where(eq(sales.user_id, locals.user.id));
	const pendapatanSetelahFee = Number(pendapatanResult[0]?.value) || 0;

	// Total HPP = Σ (Modal × Qty) — total modal barang yang sudah terjual
	const hppResult = await db.select({
		value: sum(sql`${sales.modal} * ${sales.qty}`)
	}).from(sales).where(eq(sales.user_id, locals.user.id));
	const totalHPP = Number(hppResult[0]?.value) || 0;

	// Profit Bersih = Pendapatan Setelah Fee - Total HPP
	const profitBersih = pendapatanSetelahFee - totalHPP;

	// Barang Terjual (dalam satuan pcs)
	const soldResult = await db.select({ value: sum(sales.qty) }).from(sales).where(eq(sales.user_id, locals.user.id));
	const barangTerjual = Number(soldResult[0]?.value) || 0;

	// Nilai Stok = Σ (Sisa_qty × Modal) dari seluruh batch restok yang masih tersisa
	const stokResult = await db.select({
		value: sum(sql`${restocks.sisa_qty} * ${restocks.modal}`)
	}).from(restocks).where(eq(restocks.user_id, locals.user.id));
	const nilaiStok = Number(stokResult[0]?.value) || 0;

	// Recent Sales
	const recentSales = await db.select({
		id: sales.id,
		tanggal: sales.tanggal,
		harga_jual: sales.harga_jual,
		fee: sales.fee,
		qty: sales.qty,
		channel: sales.channel,
		product: {
			nama: products.nama
		}
	})
	.from(sales)
	.innerJoin(products, eq(sales.product_id, products.id))
	.where(eq(sales.user_id, locals.user.id))
	.orderBy(desc(sales.tanggal))
	.limit(5);

	return {
		omzet,
		pendapatanSetelahFee,
		totalHPP,
		profitBersih,
		nilaiStok,
		barangTerjual,
		recentSales
	};
};
