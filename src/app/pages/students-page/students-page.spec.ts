/* FILE: pages/students-page/students-page.spec.ts
   WHAT: Exercise the directory with representative student data.
   WHY: The new card must preserve search, filtering, sorting and data states. */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { StudentsPage } from './students-page';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.model';

const students: Student[] = [
  {
    id: 1,
    name: 'Maya Hassan',
    faculty: 'Engineering',
    classYear: 2028,
    quote: 'Build things.',
    photo: 'images/students/maya-hassan.jpg',
    featured: true,
  },
  {
    id: 2,
    name: 'Adam Schneider',
    faculty: 'Informatics',
    classYear: 2028,
    quote: 'Stay curious.',
    photo: 'images/students/adam-schneider.jpg',
    featured: false,
  },
];

describe('StudentsPage', () => {
  let fixture: ComponentFixture<StudentsPage>;
  let element: HTMLElement;
  const service = { getStudents: vi.fn(() => of(students)) };

  beforeEach(async () => {
    service.getStudents.mockReturnValue(of(students));
    await TestBed.configureTestingModule({
      imports: [StudentsPage],
      providers: [provideRouter([]), { provide: StudentService, useValue: service }],
    }).compileComponents();
  });

  async function render() {
    fixture = TestBed.createComponent(StudentsPage);
    await fixture.whenStable();
    element = fixture.nativeElement;
  }

  function names() {
    return [...element.querySelectorAll('.card__name')].map((node) => node.textContent);
  }

  it('renders cards and filters by case-insensitive name and faculty', async () => {
    await render();
    expect(names()).toEqual(['Maya Hassan', 'Adam Schneider']);
    const search = element.querySelector('input')!;
    search.value = '  MAYA  ';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(names()).toEqual(['Maya Hassan']);
    expect(element.querySelector('.filters__count')?.textContent).toContain('1 student stories');

    const faculty = element.querySelector('select')!;
    faculty.value = 'Informatics';
    faculty.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(names()).toEqual([]);
    expect(element.textContent).toContain('No students match your search');

    search.value = '';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(names()).toEqual(['Adam Schneider']);
  });

  it('sorts by name and restores featured order without mutating the source', async () => {
    await render();
    const sort = element.querySelectorAll('select')[1];
    sort.value = 'name';
    sort.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(names()).toEqual(['Adam Schneider', 'Maya Hassan']);
    sort.value = 'featured';
    sort.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(names()).toEqual(['Maya Hassan', 'Adam Schneider']);
    expect(students[0].name).toBe('Maya Hassan');
  });

  it('shows a loading state before data arrives', async () => {
    const response = new Subject<Student[]>();
    service.getStudents.mockReturnValue(response);
    await render();
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Loading students');
    response.next(students);
    response.complete();
    await fixture.whenStable();
    expect(names().length).toBe(2);
    expect(element.querySelector('[role="status"]')).toBeNull();
  });

  it('shows a readable error if loading fails', async () => {
    service.getStudents.mockReturnValue(throwError(() => new Error('offline')));
    await render();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'We could not load the students',
    );
    expect(names()).toEqual([]);
  });
});
