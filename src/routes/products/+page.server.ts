import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { products: [], nextSku: 'PRF-001' };

	const allProducts = await db.select().from(products).where(eq(products.user_id, locals.user.id)).orderBy(products.created_at);
	
	let nextSku = 'PRF-001';
	const prfProducts = allProducts.filter(p => /^PRF-\d+$/.test(p.sku));
	if (prfProducts.length > 0) {
		const maxNum = Math.max(...prfProducts.map(p => parseInt(p.sku.split('-')[1])));
		nextSku = `PRF-${String(maxNum + 1).padStart(3, '0')}`;
	}

	return {
		products: allProducts,
		nextSku
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const sku = (formData.get('sku') as string)?.trim();
		const nama = (formData.get('nama') as string)?.trim();
		const ukuran_ml = parseInt(formData.get('ukuran_ml') as string);
		const status = formData.get('status') === 'habis' ? 'habis' : 'ready';

		if (!sku || !nama || isNaN(ukuran_ml) || ukuran_ml <= 0) {
			return fail(400, { message: 'Data produk tidak valid' });
		}

		await db.insert(products).values({
			user_id: locals.user.id,
			sku,
			nama,
			ukuran_ml,
			status
		});

		return { success: true };
	},
	update: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const sku = (formData.get('sku') as string)?.trim();
		const nama = (formData.get('nama') as string)?.trim();
		const ukuran_ml = parseInt(formData.get('ukuran_ml') as string);
		const status = formData.get('status') === 'habis' ? 'habis' : 'ready';

		if (!id || !sku || !nama || isNaN(ukuran_ml) || ukuran_ml <= 0) {
			return fail(400, { message: 'Data produk tidak valid' });
		}

		const existing = await db.select().from(products).where(and(eq(products.id, id), eq(products.user_id, locals.user.id)));
		if (existing.length === 0) return fail(403, { message: 'Forbidden' });

		await db.update(products).set({
			sku,
			nama,
			ukuran_ml,
			status
		}).where(and(eq(products.id, id), eq(products.user_id, locals.user.id)));

		return { success: true };
	},
	delete: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) return fail(400, { message: 'ID tidak valid' });

		const existing = await db.select().from(products).where(and(eq(products.id, id), eq(products.user_id, locals.user.id)));
		if (existing.length === 0) return fail(403, { message: 'Forbidden' });

		await db.delete(products).where(and(eq(products.id, id), eq(products.user_id, locals.user.id)));

		return { success: true };
	}
};
