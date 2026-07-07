import { db } from '$lib/server/db';
import { sales } from '$lib/server/db/schema';
import { sql, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { profitByMonth: [], overallProfit: 0, currentMonthProfit: 0, lastMonthProfit: 0, overallOmzet: 0, overallPendapatanSetelahFee: 0 };
	}

	const allSales = await db.select({
		tanggal: sales.tanggal,
		omset: sales.harga_jual,
		pendapatanSetelahFee: sql<number>`${sales.harga_jual} - ${sales.fee}`,
		hpp: sql<number>`${sales.modal} * ${sales.qty}`,
		profit: sql<number>`${sales.harga_jual} - (${sales.modal} * ${sales.qty}) - ${sales.fee}`,
		qty: sales.qty,
		fee: sales.fee
	}).from(sales).where(eq(sales.user_id, locals.user.id));

	// Group by year-month in JS
	const grouped = new Map<string, any>();

	for (const sale of allSales) {
		const d = new Date(sale.tanggal);
		const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

		if (!grouped.has(monthStr)) {
			grouped.set(monthStr, { month: monthStr, omset: 0, pendapatanSetelahFee: 0, hpp: 0, profit: 0, qty: 0, fee: 0 });
		}

		const g = grouped.get(monthStr);
		g.omset += Number(sale.omset) || 0;
		g.pendapatanSetelahFee += Number(sale.pendapatanSetelahFee) || 0;
		g.hpp += Number(sale.hpp) || 0;
		g.profit += Number(sale.profit) || 0;
		g.qty += Number(sale.qty) || 0;
		g.fee += Number(sale.fee) || 0;
	}

	const profitByMonth = Array.from(grouped.values()).sort((a, b) => b.month.localeCompare(a.month));

	// Overall totals
	const overallOmzet = profitByMonth.reduce((acc, curr) => acc + (curr.omset || 0), 0);
	const overallPendapatanSetelahFee = profitByMonth.reduce((acc, curr) => acc + (curr.pendapatanSetelahFee || 0), 0);
	const overallProfit = profitByMonth.reduce((acc, curr) => acc + (curr.profit || 0), 0);

	// Get current month and last month profit specifically
	const now = new Date();
	const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

	const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

	const currentMonthProfit = profitByMonth.find(p => p.month === currentMonthStr)?.profit || 0;
	const lastMonthProfit = profitByMonth.find(p => p.month === lastMonthStr)?.profit || 0;

	return {
		profitByMonth,
		overallProfit,
		overallOmzet,
		overallPendapatanSetelahFee,
		currentMonthProfit,
		lastMonthProfit
	};
};
