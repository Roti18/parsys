import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { createSession, verifyPassword } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { eq } from 'drizzle-orm';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (typeof email !== 'string' || typeof password !== 'string') {
			return fail(400, { message: 'Invalid credentials' });
		}

		const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
		if (userResult.length === 0) {
			return fail(400, { message: 'Email atau password salah' });
		}

		const user = userResult[0];
		const isPasswordValid = verifyPassword(password, user.password_hash);

		if (!isPasswordValid) {
			return fail(400, { message: 'Email atau password salah' });
		}

		const sessionId = await createSession(user.id);

		cookies.set('session', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30, // 30 days
            secure: process.env.NODE_ENV === 'production'
		});

		throw redirect(302, '/');
	}
};
