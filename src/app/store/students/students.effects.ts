import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, filter, map, of } from 'rxjs';
import { StudentService } from '../../services/student.service';
import { studentsActions } from './students.actions';
import { studentsFeature } from './students.reducer';

export const loadStudents = createEffect(
  () => {
    const actions = inject(Actions);
    const service = inject(StudentService);
    const loaded = inject(Store).selectSignal(studentsFeature.selectLoaded);

    return actions.pipe(
      ofType(studentsActions.load),
      filter(() => !loaded()),
      exhaustMap(() =>
        service.getStudents().pipe(
          map((students) => studentsActions.loadSuccess({ students })),
          catchError(() => of(studentsActions.loadFailure())),
        ),
      ),
    );
  },
  { functional: true },
);
