import { createSelector } from '@ngrx/store';
import { studentsAdapter, studentsFeature } from './students.reducer';

export const { selectAll: selectAllStudents } = studentsAdapter.getSelectors(
  studentsFeature.selectStudentsState,
);

export const selectFaculties = createSelector(selectAllStudents, (students) =>
  [...new Set(students.map((student) => student.faculty))].sort(),
);

export const selectVisibleStudents = createSelector(
  selectAllStudents,
  studentsFeature.selectSearchText,
  studentsFeature.selectSelectedFaculty,
  studentsFeature.selectSortBy,
  (students, searchText, faculty, sortBy) => {
    const text = searchText.trim().toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(text) && (faculty === 'all' || student.faculty === faculty),
    );
    return sortBy === 'name'
      ? filtered.sort((a, b) => a.name.localeCompare(b.name))
      : filtered.sort((a, b) => Number(b.featured) - Number(a.featured) || a.id - b.id);
  },
);
