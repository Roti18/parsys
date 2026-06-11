import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	password_hash: text('password_hash').notNull(),
	created_at: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	user_id: text('user_id')
		.notNull()
		.references(() => users.id),
	expires_at: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const products = sqliteTable('products', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	user_id: text('user_id')
		.notNull()
		.references(() => users.id),
	sku: text('sku').notNull(),
	nama: text('nama').notNull(),
	ukuran_ml: integer('ukuran_ml').notNull(),
	status: text('status').notNull().default('ready'), // 'ready' | 'habis'
	created_at: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const restocks = sqliteTable('restocks', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	user_id: text('user_id')
		.notNull()
		.references(() => users.id),
	product_id: text('product_id')
		.notNull()
		.references(() => products.id),
	tanggal: integer('tanggal', { mode: 'timestamp' }).notNull(),
	modal: integer('modal').notNull(),
	qty: integer('qty').notNull(),
	sisa_qty: integer('sisa_qty').notNull().default(0),
	created_at: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const sales = sqliteTable('sales', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	user_id: text('user_id')
		.notNull()
		.references(() => users.id),
	product_id: text('product_id')
		.notNull()
		.references(() => products.id),
	tanggal: integer('tanggal', { mode: 'timestamp' }).notNull(),
	harga_jual: integer('harga_jual').notNull(),
	modal: integer('modal').notNull(),
	fee: integer('fee').notNull().default(0),
	channel: text('channel').notNull(),
	qty: integer('qty').notNull().default(1),
	created_at: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const sale_restocks = sqliteTable('sale_restocks', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sale_id: text('sale_id')
		.notNull()
		.references(() => sales.id, { onDelete: 'cascade' }),
	restock_id: text('restock_id')
		.notNull()
		.references(() => restocks.id, { onDelete: 'cascade' }),
	qty: integer('qty').notNull(),
	created_at: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});
