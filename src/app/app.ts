/* =====================================================================
   FILE: src/app/app.ts   (the ROOT component)
   WHAT: The outer "shell" every page lives inside: header on top,
         page content in the middle.
   ===================================================================== */
import { Component, afterNextRender, computed, inject } from '@angular/core';
import { PRIMARY_OUTLET, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

import { Header } from './components/header/header';
import { TopStrip } from './components/top-strip/top-strip';

@Component({
  selector: 'app-root',
  // STEP 1: A standalone component must LIST every component, directive
  // or pipe it uses in its template. Forgetting one gives the error
  // "'app-header' is not a known element".
  imports: [RouterOutlet, Header, TopStrip],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly showYearbookFooter = computed(() => {
    const url = this.router.lastSuccessfulNavigation()?.finalUrl;
    const page = url?.root.children[PRIMARY_OUTLET]?.segments[0]?.path;
    return page === 'login' || page === 'profile';
  });

  constructor() {
    afterNextRender(() => {
      if (!this.auth.isLoggedIn()) {
        this.auth.checkSession().subscribe({ error: () => {} });
      }
    });
  }
}
