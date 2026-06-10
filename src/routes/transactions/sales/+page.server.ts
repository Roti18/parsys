import { db } from '$lib/server/db';
import { products, restocks, sales } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { products: [], sales: [] };

	const allProducts = await db.select().from(products).where(eq(products.user_id, locals.user.id)).orderBy(products.nama);
	const allSales = await db
		.select({
			id: sales.id,
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
		products: allProducts,
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

		// Ambil modal terbaru dari restock terakhir
		const latestRestock = await db
			.select()
			.from(restocks)
			.where(and(eq(restocks.product_id, product_id), eq(restocks.user_id, locals.user.id)))
			.orderBy(desc(restocks.tanggal))
			.limit(1);

		const modal = latestRestock.length > 0 ? latestRestock[0].modal : 0;

		await db.insert(sales).values({
			user_id: locals.user.id,
			product_id,
			tanggal,
			harga_jual,
			modal,
			fee,
			channel,
			qty
		});

		return { success: true };
	}
};
