import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { Student } from '../../models/student.model';
import { SortMode, studentsActions } from './students.actions';

export const studentsAdapter = createEntityAdapter<Student>();

interface StudentsState extends EntityState<Student> {
  loading: boolean;
  loaded: boolean;
  errorMessage: string;
  searchText: string;
  selectedFaculty: string;
  sortBy: SortMode;
}

const initialState = studentsAdapter.getInitialState<StudentsState>({
  loading: false,
  loaded: false,
  errorMessage: '',
  searchText: '',
  selectedFaculty: 'all',
  sortBy: 'featured',
});

export const studentsFeature = createFeature({
  name: 'students',
  reducer: createReducer(
    initialState,
    on(studentsActions.load, (state) =>
      state.loaded || state.loading ? state : { ...state, loading: true, errorMessage: '' },
    ),
    on(studentsActions.loadSuccess, (state, { students }) =>
      studentsAdapter.setAll(students, { ...state, loaded: true, loading: false }),
    ),
    on(studentsActions.loadFailure, (state) => ({
      ...state,
      loading: false,
      errorMessage: 'We could not load the students. Please try again.',
    })),
    on(studentsActions.searchChanged, (state, { searchText }) => ({ ...state, searchText })),
    on(studentsActions.facultyChanged, (state, { selectedFaculty }) => ({
      ...state,
      selectedFaculty,
    })),
    on(studentsActions.sortChanged, (state, { sortBy }) => ({ ...state, sortBy })),
  ),
});
