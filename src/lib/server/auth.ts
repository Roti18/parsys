import { db } from './db';
import { sessions, users } from './db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';

// Hash password with scrypt
export function hashPassword(password: string): string {
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = crypto.scryptSync(password, salt, 64).toString('hex');
	return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
	const [salt, key] = storedHash.split(':');
	if (!salt || !key) return false;
	const hashBuffer = crypto.scryptSync(password, salt, 64);
	const keyBuffer = Buffer.from(key, 'hex');
	return crypto.timingSafeEqual(hashBuffer, keyBuffer);
}

// Session Management
export async function createSession(userId: string): Promise<string> {
	const sessionId = crypto.randomUUID();
	// Session expires in 30 days
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

	await db.insert(sessions).values({
		id: sessionId,
		user_id: userId,
		expires_at: expiresAt
	});

	return sessionId;
}

export async function validateSession(sessionId: string) {
	const result = await db
		.select({
			user: {
				id: users.id,
				email: users.email
			},
			session: sessions
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.user_id, users.id))
		.where(eq(sessions.id, sessionId));

	if (result.length === 0) {
		return { session: null, user: null };
	}

	const { session, user } = result[0];

	if (Date.now() >= session.expires_at.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, session.id));
		return { session: null, user: null };
	}

	// Extend session if it's close to expiring (optional)
	if (Date.now() >= session.expires_at.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(sessions)
			.set({ expires_at: session.expires_at })
			.where(eq(sessions.id, session.id));
	}

	return { session, user };
}

export async function invalidateSession(sessionId: string) {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}
