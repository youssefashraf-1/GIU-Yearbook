/* =====================================================================
   FILE: components/student-card/student-card.ts
   WHAT: A reusable student card with a required input and portrait fallback.
   WHY: The page owns the data; the card only presents one student's story.
   ===================================================================== */
import { Component, computed, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Student } from '../../models/student.model';

@Component({
  selector: 'app-student-card',
  imports: [RouterLink],
  templateUrl: './student-card.html',
  styleUrl: './student-card.css',
})
export class StudentCard {
  // The parent supplies one student; read the input with student().
  readonly student = input.required<Student>();
  private readonly imageFailed = signal(false);

  // Derive the displayed path from the input and the image error state.
  protected readonly photoSrc = computed(() =>
    this.imageFailed() ? 'images/placeholder-portrait.svg' : this.student().photo,
  );

  constructor() {
    // Retry the portrait when a reused card receives a different student.
    effect(() => {
      this.student().photo;
      this.imageFailed.set(false);
    });
  }

  protected onImageError(): void {
    this.imageFailed.set(true);
  }
}
