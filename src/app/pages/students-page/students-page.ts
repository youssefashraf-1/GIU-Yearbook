import { Component, OnInit, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { StudentCard } from '../../components/student-card/student-card';
import { SortMode, studentsActions } from '../../store/students/students.actions';
import { studentsFeature } from '../../store/students/students.reducer';
import {
  selectAllStudents,
  selectFaculties,
  selectVisibleStudents,
} from '../../store/students/students.selectors';

@Component({
  selector: 'app-student-page',
  imports: [StudentCard],
  templateUrl: './students-page.html',
  styleUrl: './students-page.css',
})
export class StudentsPage implements OnInit {
  private readonly store = inject(Store);

  protected readonly students = this.store.selectSignal(selectAllStudents);
  protected readonly loading = this.store.selectSignal(studentsFeature.selectLoading);
  protected readonly errorMessage = this.store.selectSignal(studentsFeature.selectErrorMessage);
  protected readonly searchText = this.store.selectSignal(studentsFeature.selectSearchText);
  protected readonly selectedFaculty = this.store.selectSignal(studentsFeature.selectSelectedFaculty);
  protected readonly sortBy = this.store.selectSignal(studentsFeature.selectSortBy);
  protected readonly faculties = this.store.selectSignal(selectFaculties);
  protected readonly visibleStudents = this.store.selectSignal(selectVisibleStudents);
  protected readonly totalLabel = computed(() => String(this.students().length).padStart(2, '0'));

  ngOnInit(): void {
    this.store.dispatch(studentsActions.load());
  }

  protected onSearch(event: Event): void {
    const searchText = (event.target as HTMLInputElement).value;
    this.store.dispatch(studentsActions.searchChanged({ searchText }));
  }

  protected onFacultyChange(event: Event): void {
    const selectedFaculty = (event.target as HTMLSelectElement).value;
    this.store.dispatch(studentsActions.facultyChanged({ selectedFaculty }));
  }

  protected onSortChange(event: Event): void {
    const sortBy = (event.target as HTMLSelectElement).value as SortMode;
    this.store.dispatch(studentsActions.sortChanged({ sortBy }));
  }

  protected scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
