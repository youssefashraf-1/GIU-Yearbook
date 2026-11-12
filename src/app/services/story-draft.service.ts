import { Injectable } from '@angular/core';
import type { StoredStoryDraft, StoryDraft } from '../models/story-draft.model';

@Injectable({ providedIn: 'root' })
export class StoryDraftService {
  load(studentId: number): StoredStoryDraft | null {
    try {
      const text = localStorage.getItem(this.key(studentId));
      if (!text) {
        return null;
      }
      const draft = JSON.parse(text) as Partial<StoredStoryDraft> | null;
      const values = draft?.values;
      if (
        typeof draft?.savedAt !== 'string' ||
        !Number.isFinite(Date.parse(draft.savedAt)) ||
        typeof values?.quote !== 'string' ||
        typeof values.story !== 'string' ||
        typeof values.moment !== 'string' ||
        typeof values.next !== 'string' ||
        typeof values.consent !== 'boolean'
      ) {
        return null;
      }
      const { quote, story, moment, next, consent } = values;
      return { savedAt: draft.savedAt, values: { quote, story, moment, next, consent } };
    } catch {
      return null;
    }
  }

  save(studentId: number, values: StoryDraft): string | null {
    const stored: StoredStoryDraft = { savedAt: new Date().toISOString(), values };
    try {
      localStorage.setItem(this.key(studentId), JSON.stringify(stored));
      return stored.savedAt;
    } catch {
      return null;
    }
  }

  private key(studentId: number): string {
    return `giu:story-draft:${studentId}`;
  }
}
