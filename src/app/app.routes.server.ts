/* FILE: app.routes.server.ts
   WHAT: Choose server rendering for dynamic student URLs.
   WHY: Student IDs are resolved at request time, not during prerendering. */
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'students/:id',
    renderMode: RenderMode.Server,
  },
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'profile', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
