import { db } from '$lib/server/db';
import { products, restocks, sales, sale_restocks } from '$lib/server/db/schema';
import { eq, desc, and, sum } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { products: [], sales: [] };

	const allProducts = await db.select().from(products).where(eq(products.user_id, locals.user.id)).orderBy(products.nama);
	
	const availableStockQuery = await db.select({
		product_id: restocks.product_id,
		total_sisa: sum(restocks.sisa_qty)
	}).from(restocks).where(eq(restocks.user_id, locals.user.id)).groupBy(restocks.product_id);

	const productsWithStock = allProducts.filter(p => {
		const stock = availableStockQuery.find(r => r.product_id === p.id);
		return stock && Number(stock.total_sisa) > 0;
	});
	const allSales = await db
		.select({
			id: sales.id,
			product_id: sales.product_id,
			tanggal: sales.tanggal,
			harga_jual: sales.harga_jual,
			modal: sales.modal,
			fee: sales.fee,
			channel: sales.channel,
			qty: sales.qty,
			product: {
				nama: products.nama,
				sku: products.sku,
        ukuran_ml: products.ukuran_ml
			}
		})
		.from(sales)
		.innerJoin(products, eq(sales.product_id, products.id))
		.where(eq(sales.user_id, locals.user.id))
		.orderBy(desc(sales.tanggal));

	return {
		products: productsWithStock,
		sales: allSales
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const product_id = formData.get('product_id') as string;
		const tanggal_str = formData.get('tanggal') as string;
		const harga_jual = parseInt(formData.get('harga_jual') as string);
		const fee = parseInt(formData.get('fee') as string);
		const channel = formData.get('channel') as string;
		const qty = parseInt(formData.get('qty') as string);

		const tanggal = new Date(tanggal_str);

		// Verify product belongs to user
		const productOwner = await db.select().from(products).where(and(eq(products.id, product_id), eq(products.user_id, locals.user.id)));
		if (productOwner.length === 0) return fail(403, { message: 'Forbidden' });

		await db.transaction(async (tx) => {
			const sale_id = crypto.randomUUID();
			
			// Ambil restock yang masih ada sisa, urutkan dari paling lama (FIFO)
			const availableRestocks = await tx
				.select()
				.from(restocks)
				.where(and(eq(restocks.product_id, product_id), eq(restocks.user_id, locals.user.id)))
				.orderBy(restocks.tanggal);

			let saleQtyNeeded = qty;
			let totalModalConsumed = 0;
			let totalQtyConsumed = 0;

			const restocksToConsume = [];

			for (const r of availableRestocks) {
				if (saleQtyNeeded <= 0) break;
				if (r.sisa_qty > 0) {
					const take = Math.min(saleQtyNeeded, r.sisa_qty);
					const newSisa = r.sisa_qty - take;
					saleQtyNeeded -= take;

					totalModalConsumed += take * r.modal;
					totalQtyConsumed += take;

					// Update sisa_qty di restock
					await tx.update(restocks).set({ sisa_qty: newSisa }).where(eq(restocks.id, r.id));

					restocksToConsume.push({
						sale_id,
						restock_id: r.id,
						qty: take
					});
				}
			}

			// Calculate rata-rata modal
			const modal = totalQtyConsumed > 0 ? Math.floor(totalModalConsumed / totalQtyConsumed) : 0;

			// Insert sale record PERTAMA agar foreign key tidak gagal
			await tx.insert(sales).values({
				id: sale_id,
				user_id: locals.user.id,
				product_id,
				tanggal,
				harga_jual,
				modal,
				fee,
				channel,
				qty
			});

			// Insert ke sale_restocks SETELAH sales dibuat
			if (restocksToConsume.length > 0) {
				await tx.insert(sale_restocks).values(restocksToConsume);
			}
		});

		return { success: true };
	},
	update: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const product_id = formData.get('product_id') as string;
		const tanggal_str = formData.get('tanggal') as string;
		const harga_jual = parseInt(formData.get('harga_jual') as string);
		const fee = parseInt(formData.get('fee') as string);
		const channel = formData.get('channel') as string;
		const qty = parseInt(formData.get('qty') as string);

		const tanggal = new Date(tanggal_str);

		// Verify sale belongs to user
		const saleOwner = await db.select().from(sales).where(and(eq(sales.id, id), eq(sales.user_id, locals.user.id)));
		if (saleOwner.length === 0) return fail(403, { message: 'Forbidden' });

		await db.transaction(async (tx) => {
			// REVERT OLD SALE DEDUCTIONS
			const oldConsumptions = await tx.select().from(sale_restocks).where(eq(sale_restocks.sale_id, id));
			for (const sc of oldConsumptions) {
				const r = await tx.select().from(restocks).where(eq(restocks.id, sc.restock_id));
				if (r.length > 0) {
					await tx.update(restocks).set({ sisa_qty: r[0].sisa_qty + sc.qty }).where(eq(restocks.id, sc.restock_id));
				}
			}
			await tx.delete(sale_restocks).where(eq(sale_restocks.sale_id, id));

			// RUN FIFO FOR NEW QTY / PRODUCT
			const availableRestocks = await tx
				.select()
				.from(restocks)
				.where(and(eq(restocks.product_id, product_id), eq(restocks.user_id, locals.user.id)))
				.orderBy(restocks.tanggal);

			let saleQtyNeeded = qty;
			let totalModalConsumed = 0;
			let totalQtyConsumed = 0;

			const restocksToConsume = [];

			for (const r of availableRestocks) {
				if (saleQtyNeeded <= 0) break;
				if (r.sisa_qty > 0) {
					const take = Math.min(saleQtyNeeded, r.sisa_qty);
					const newSisa = r.sisa_qty - take;
					saleQtyNeeded -= take;

					totalModalConsumed += take * r.modal;
					totalQtyConsumed += take;

					await tx.update(restocks).set({ sisa_qty: newSisa }).where(eq(restocks.id, r.id));

					restocksToConsume.push({
						sale_id: id,
						restock_id: r.id,
						qty: take
					});
				}
			}

			const modal = totalQtyConsumed > 0 ? Math.floor(totalModalConsumed / totalQtyConsumed) : 0;

			await tx.update(sales).set({
				product_id,
				tanggal,
				harga_jual,
				modal,
				fee,
				channel,
				qty
			}).where(eq(sales.id, id));

			// Insert ke sale_restocks SETELAH sales diupdate/ada
			if (restocksToConsume.length > 0) {
				await tx.insert(sale_restocks).values(restocksToConsume);
			}
		});

		return { success: true };
	},
	delete: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		
		const formData = await request.formData();
		const id = formData.get('id') as string;

		const saleOwner = await db.select().from(sales).where(and(eq(sales.id, id), eq(sales.user_id, locals.user.id)));
		if (saleOwner.length === 0) return fail(403, { message: 'Forbidden' });

		await db.transaction(async (tx) => {
			// REVERT OLD SALE DEDUCTIONS
			const oldConsumptions = await tx.select().from(sale_restocks).where(eq(sale_restocks.sale_id, id));
			for (const sc of oldConsumptions) {
				const r = await tx.select().from(restocks).where(eq(restocks.id, sc.restock_id));
				if (r.length > 0) {
					await tx.update(restocks).set({ sisa_qty: r[0].sisa_qty + sc.qty }).where(eq(restocks.id, sc.restock_id));
				}
			}
			
			// Deleting sales will cascade delete sale_restocks, but we do it manually anyway
			await tx.delete(sale_restocks).where(eq(sale_restocks.sale_id, id));
			await tx.delete(sales).where(eq(sales.id, id));
		});
		
		return { success: true };
	}
};
