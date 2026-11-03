import { Component, OnInit, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { studentsActions } from '../../store/students/students.actions';
import { studentsFeature } from '../../store/students/students.reducer';

@Component({
  imports: [RouterLink],
  template: `
    <article class="profile">
      <a class="btn" routerLink="/">Back to all students</a>

      @if (loading()) {
        <p role="status">Loading student…</p>
      } @else if (errorMessage()) {
        <p role="alert">{{ errorMessage() }}</p>
      } @else if (student(); as profile) {
        <h1>{{ profile.name }}</h1>
        <p>{{ profile.faculty }} · Class of {{ profile.classYear }}</p>
        <blockquote>“{{ profile.quote }}”</blockquote>
      } @else {
        <h1>Student not found</h1>
      }
    </article>
  `,
  styles: `
    .profile {
      display: grid;
      justify-items: start;
      gap: var(--space-4);
      padding-block: var(--space-6);
    }
  `,
})
export class StudentProfile implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly entities = this.store.selectSignal(studentsFeature.selectEntities);

  protected readonly loading = this.store.selectSignal(studentsFeature.selectLoading);
  protected readonly errorMessage = this.store.selectSignal(studentsFeature.selectErrorMessage);
  protected readonly student = computed(() => {
    const id = this.params().get('id') ?? '';
    return /^\d+$/.test(id) ? this.entities()[Number(id)] : undefined;
  });

  ngOnInit(): void {
    this.store.dispatch(studentsActions.load());
  }
}
