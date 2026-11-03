import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SavedService {
  private readonly savedIds = signal<readonly number[]>([]);

  readonly ids = this.savedIds.asReadonly();
  readonly count = computed(() => this.ids().length);

  isSaved(id: number): boolean {
    return this.ids().includes(id);
  }

  toggle(id: number): void {
    this.savedIds.update((ids) =>
      ids.includes(id) ? ids.filter((savedId) => savedId !== id) : [...ids, id],
    );
  }
}
