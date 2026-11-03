import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Student } from '../../models/student.model';

export type SortMode = 'featured' | 'name';

export const studentsActions = createActionGroup({
  source: 'Students',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{ students: Student[] }>(),
    'Load Failure': emptyProps(),
    'Search Changed': props<{ searchText: string }>(),
    'Faculty Changed': props<{ selectedFaculty: string }>(),
    'Sort Changed': props<{ sortBy: SortMode }>(),
  },
});
