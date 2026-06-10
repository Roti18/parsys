import { db } from '$lib/server/db';
import { products, restocks, sales } from '$lib/server/db/schema';
import { sum, sql, eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { totalOmset: 0, totalProfit: 0, barangTerjual: 0, stokTersisa: 0, recentSales: [] };
	}

	// Total Omset (Gross Revenue)
	const omsetResult = await db.select({ value: sum(sql`${sales.harga_jual} * ${sales.qty}`) }).from(sales).where(eq(sales.user_id, locals.user.id));
	const totalOmset = Number(omsetResult[0]?.value) || 0;

	// Total Profit: (Harga Jual * Qty) - (Modal * Qty) - Fee
	const profitResult = await db.select({
		value: sum(sql`(${sales.harga_jual} * ${sales.qty}) - (${sales.modal} * ${sales.qty}) - ${sales.fee}`)
	}).from(sales).where(eq(sales.user_id, locals.user.id));
	const totalProfit = Number(profitResult[0]?.value) || 0;

	// Barang Terjual
	const soldResult = await db.select({ value: sum(sales.qty) }).from(sales).where(eq(sales.user_id, locals.user.id));
	const barangTerjual = Number(soldResult[0]?.value) || 0;

	// Stok Tersisa (Total Restock Qty - Total Sales Qty)
	const totalRestockResult = await db.select({ value: sum(restocks.qty) }).from(restocks).where(eq(restocks.user_id, locals.user.id));
	const totalRestock = Number(totalRestockResult[0]?.value) || 0;
	const stokTersisa = totalRestock - barangTerjual;

	// Recent Sales
	const recentSales = await db.select({
		id: sales.id,
		tanggal: sales.tanggal,
		harga_jual: sales.harga_jual,
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
		totalOmset,
		totalProfit,
		barangTerjual,
		stokTersisa,
		recentSales
	};
};
