import { validateSession } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// 1. Get session token from cookie
	const sessionId = event.cookies.get('session');

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
	} else {
		// 2. Validate session
		const { session, user } = await validateSession(sessionId);
		if (session) {
			// Refresh cookie to keep it alive
			event.cookies.set('session', session.id, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30, // 30 days
                secure: process.env.NODE_ENV === 'production'
			});
		} else {
			// Invalid session, clear cookie
			event.cookies.delete('session', { path: '/' });
		}

		event.locals.session = session;
		event.locals.user = user;
	}

	// 3. Route Guards
	const isAuthRoute = event.url.pathname.startsWith('/login') || event.url.pathname.startsWith('/register');
	
	if (!event.locals.user && !isAuthRoute) {
		// Not logged in and trying to access protected route -> Redirect to Login
		throw redirect(302, '/login');
	}

	if (event.locals.user && isAuthRoute) {
		// Logged in and trying to access login/register -> Redirect to Dashboard
		throw redirect(302, '/');
	}

	return resolve(event);
};
