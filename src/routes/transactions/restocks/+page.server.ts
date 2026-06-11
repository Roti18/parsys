import { db } from '$lib/server/db';
import { products, restocks } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { products: [], restocks: [] };

	const allProducts = await db.select().from(products).where(eq(products.user_id, locals.user.id)).orderBy(products.nama);
	const allRestocks = await db
		.select({
			id: restocks.id,
			product_id: restocks.product_id,
			tanggal: restocks.tanggal,
			modal: restocks.modal,
			qty: restocks.qty,
			sisa_qty: restocks.sisa_qty,
			product: {
				nama: products.nama,
				sku: products.sku,
        ukuran_ml: products.ukuran_ml
			}
		})
		.from(restocks)
		.innerJoin(products, eq(restocks.product_id, products.id))
		.where(eq(restocks.user_id, locals.user.id))
		.orderBy(desc(restocks.tanggal));

	return {
		products: allProducts,
		restocks: allRestocks
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const product_id = formData.get('product_id') as string;
		const tanggal_str = formData.get('tanggal') as string;
		const modal = parseInt(formData.get('modal') as string);
		const qty = parseInt(formData.get('qty') as string);

		const tanggal = new Date(tanggal_str);

		// Verify product belongs to user
		const productOwner = await db.select().from(products).where(and(eq(products.id, product_id), eq(products.user_id, locals.user.id)));
		if (productOwner.length === 0) return fail(403, { message: 'Forbidden' });

		await db.insert(restocks).values({
			user_id: locals.user.id,
			product_id,
			tanggal,
			modal,
			qty,
			sisa_qty: qty // Set awal sisa = qty
		});

		// If product was "habis", we should ideally mark it "ready"
		await db.update(products).set({ status: 'ready' }).where(and(eq(products.id, product_id), eq(products.user_id, locals.user.id)));

		return { success: true };
	},
	update: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const product_id = formData.get('product_id') as string;
		const tanggal_str = formData.get('tanggal') as string;
		const modal = parseInt(formData.get('modal') as string);
		const qty = parseInt(formData.get('qty') as string);

		const tanggal = new Date(tanggal_str);

		const restockOwner = await db.select().from(restocks).where(and(eq(restocks.id, id), eq(restocks.user_id, locals.user.id)));
		if (restockOwner.length === 0) return fail(403, { message: 'Forbidden' });

		// Jika qty diubah, kita harus menyesuaikan sisa_qty juga (qty_baru - qty_lama)
		const selisih = qty - restockOwner[0].qty;
		const newSisa = Math.max(0, restockOwner[0].sisa_qty + selisih);

		await db.update(restocks).set({
			product_id,
			tanggal,
			modal,
			qty,
			sisa_qty: newSisa
		}).where(and(eq(restocks.id, id), eq(restocks.user_id, locals.user.id)));

		return { success: true };
	},
	delete: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const id = formData.get('id') as string;

		const restockOwner = await db.select().from(restocks).where(and(eq(restocks.id, id), eq(restocks.user_id, locals.user.id)));
		if (restockOwner.length === 0) return fail(403, { message: 'Forbidden' });

		await db.delete(restocks).where(and(eq(restocks.id, id), eq(restocks.user_id, locals.user.id)));
		
		return { success: true };
	}
};
