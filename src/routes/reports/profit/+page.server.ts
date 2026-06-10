import { db } from '$lib/server/db';
import { sales } from '$lib/server/db/schema';
import { sql, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { profitByMonth: [], overallProfit: 0, currentMonthProfit: 0, lastMonthProfit: 0 };
	}

	// Simple SQLite queries to group by year-month
	// Format of created_at/tanggal in SQLite timestamp is epoch ms
	// We can use strftime on datetime(tanggal/1000, 'unixepoch')

	const profitByMonth = await db.select({
		month: sql<string>`strftime('%Y-%m', datetime(${sales.tanggal}/1000, 'unixepoch'))`,
		omset: sql<number>`SUM(${sales.harga_jual} * ${sales.qty})`,
		profit: sql<number>`SUM((${sales.harga_jual} * ${sales.qty}) - (${sales.modal} * ${sales.qty}) - ${sales.fee})`,
		qty: sql<number>`SUM(${sales.qty})`,
		fee: sql<number>`SUM(${sales.fee})`
	}).from(sales).where(eq(sales.user_id, locals.user.id)).groupBy(sql`strftime('%Y-%m', datetime(${sales.tanggal}/1000, 'unixepoch'))`).orderBy(sql`strftime('%Y-%m', datetime(${sales.tanggal}/1000, 'unixepoch')) DESC`);

	// Calculate overall total profit
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
		currentMonthProfit,
		lastMonthProfit
	};
};
