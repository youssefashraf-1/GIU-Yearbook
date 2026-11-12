import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, map } from 'rxjs';
import type { Student } from '../../models/student.model';
import { AuthService } from '../../services/auth.service';
import { StoryDraftService } from '../../services/story-draft.service';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly students = inject(StudentService);
  private readonly drafts = inject(StoryDraftService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = this.fb.group({
    quote: ['', [Validators.required, Validators.maxLength(160)]],
    story: ['', [Validators.maxLength(1000)]],
    moment: ['', [Validators.maxLength(200)]],
    next: ['', [Validators.maxLength(120)]],
    consent: [false],
  });
  protected readonly values = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );
  protected readonly quoteLength = computed(() => this.values().quote.length);
  protected readonly student = signal<Student | null>(null);
  protected readonly user = this.auth.currentUser;
  protected readonly changed = signal(false);
  protected readonly savedAt = signal<string | null>(null);
  protected readonly storageError = signal(false);
  protected readonly loadError = signal('');
  protected readonly signOutError = signal(false);
  protected readonly signingOut = signal(false);

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.changed.set(true));
  }

  ngOnInit(): void {
    const user = this.user();
    if (!user) {
      void this.router.navigateByUrl('/login');
      return;
    }

    this.students
      .getStudents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          const student = list.find(({ id }) => id === user.studentId);
          if (!student) {
            this.loadError.set('There is no yearbook profile for this account.');
            return;
          }

          const draft = this.drafts.load(student.id);
          this.form.patchValue(draft?.values ?? { quote: student.quote });
          this.savedAt.set(draft?.savedAt ?? null);
          this.changed.set(false);
          this.student.set(student);
        },
        error: () =>
          this.loadError.set('Could not load your profile. Refresh the page to try again.'),
      });
  }

  protected saveDraft(): void {
    const student = this.student();
    if (!student) {
      return;
    }

    const time = this.drafts.save(student.id, this.form.getRawValue());
    this.storageError.set(time === null);
    if (time) {
      this.savedAt.set(time);
      this.changed.set(false);
    }
  }

  protected signOut(): void {
    if (this.signingOut()) {
      return;
    }
    this.signingOut.set(true);
    this.signOutError.set(false);
    this.auth
      .logout()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.signingOut.set(false)),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl('/'),
        error: () => this.signOutError.set(true),
      });
  }
}
