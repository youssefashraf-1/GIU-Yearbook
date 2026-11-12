import { randomUUID } from 'node:crypto';
import { json, Router } from 'express';
import type { CookieOptions, Request } from 'express';
import type { User } from '../app/models/auth.model';

const cookieName = 'giu_session';
const week = 7 * 24 * 60 * 60 * 1000;
const cookieOptions: CookieOptions = { httpOnly: true, sameSite: 'lax', path: '/' };
const demoUser: User = {
  studentId: 1,
  name: 'Maya Hassan',
  email: 'mock.user@student.giu-uni.de',
};
const sessions = new Map<string, number>();

function sessionToken(request: Request): string | undefined {
  return request.headers.cookie?.match(/(?:^|;\s*)giu_session=([a-f0-9-]+)(?:;|$)/)?.[1];
}

export const mockAuth = Router();

mockAuth.use((_request, response, next) => {
  response.set('Cache-Control', 'no-store');
  next();
});

mockAuth.post('/login', json({ limit: '4kb' }), (request, response) => {
  const { email, password, remember } = request.body ?? {};
  if (
    typeof email !== 'string' ||
    email.trim().toLowerCase() !== demoUser.email ||
    password !== 'password123'
  ) {
    response.status(401).json({ message: 'Wrong username or password' });
    return;
  }

  const previous = sessionToken(request);
  const now = Date.now();
  for (const [token, expires] of sessions) {
    if (expires <= now || token === previous) {
      sessions.delete(token);
    }
  }

  const token = randomUUID();
  sessions.set(token, now + week);
  response
    .cookie(cookieName, token, {
      ...cookieOptions,
      secure: request.secure,
      ...(remember === true ? { maxAge: week } : {}),
    })
    .json(demoUser);
});

mockAuth.get('/me', (request, response) => {
  const token = sessionToken(request);
  const expiry = token ? sessions.get(token) : undefined;
  if (!token || !expiry || expiry <= Date.now()) {
    if (token) {
      sessions.delete(token);
    }
    response.status(401).json({ message: 'Not signed in' });
    return;
  }

  response.json(demoUser);
});

mockAuth.post('/logout', (request, response) => {
  const token = sessionToken(request);
  if (token) {
    sessions.delete(token);
  }
  response.clearCookie(cookieName, { ...cookieOptions, secure: request.secure }).sendStatus(204);
});
