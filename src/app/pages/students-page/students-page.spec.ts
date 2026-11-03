/* FILE: pages/students-page/students-page.spec.ts
   WHAT: Exercise the directory with representative student data.
   WHY: The new card must preserve search, filtering, sorting and data states. */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { StudentsPage } from './students-page';
import { StudentService } from '../../services/student.service';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { App } from '../../app';
import { routes } from '../../app.routes';
import { loadStudents } from '../../store/students/students.effects';
import { studentsFeature } from '../../store/students/students.reducer';
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
    service.getStudents.mockReset().mockReturnValue(of(students));
    await TestBed.configureTestingModule({
      imports: [StudentsPage, App],
      providers: [
        provideRouter(routes),
        provideStore(),
        provideState(studentsFeature),
        provideEffects({ loadStudents }),
        { provide: StudentService, useValue: service },
      ],
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

  it('keeps saves and filters when returning from a student profile', async () => {
    const app = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await app.whenStable();
    await router.navigateByUrl('/');
    await app.whenStable();
    const page: HTMLElement = app.nativeElement;
    const count = () => page.querySelector('.header__count')?.textContent?.trim();
    const hearts = () => page.querySelectorAll<HTMLButtonElement>('.card__save');

    expect(count()).toBe('0');
    hearts()[0].click();
    hearts()[1].click();
    await app.whenStable();
    expect(router.url).toBe('/');
    expect(count()).toBe('2');
    hearts()[0].click();

    const search = page.querySelector('input')!;
    search.value = 'Adam';
    search.dispatchEvent(new Event('input'));
    const faculty = page.querySelector('select')!;
    faculty.value = 'Informatics';
    faculty.dispatchEvent(new Event('change'));
    const sort = page.querySelectorAll('select')[1];
    sort.value = 'name';
    sort.dispatchEvent(new Event('change'));
    await app.whenStable();

    page.querySelector<HTMLAnchorElement>('a.card')!.click();
    await app.whenStable();
    expect(router.url).toBe('/students/2');
    expect(page.querySelector('h1')?.textContent).toBe('Adam Schneider');
    expect(count()).toBe('1');

    page.querySelector<HTMLAnchorElement>('.profile a')!.click();
    await app.whenStable();
    expect(router.url).toBe('/');
    expect(page.querySelector('input')?.value).toBe('Adam');
    expect(page.querySelectorAll('select')[0].value).toBe('Informatics');
    expect(page.querySelectorAll('select')[1].value).toBe('name');
    expect(hearts()).toHaveLength(1);
    expect(hearts()[0].getAttribute('aria-pressed')).toBe('true');
    expect(count()).toBe('1');
    expect(service.getStudents).toHaveBeenCalledTimes(1);
  });

  it('loads a direct profile URL and handles an unknown ID', async () => {
    const app = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await app.whenStable();
    await router.navigateByUrl('/students/1');
    await app.whenStable();
    const page: HTMLElement = app.nativeElement;
    expect(page.querySelector('h1')?.textContent).toBe('Maya Hassan');

    await router.navigateByUrl('/students/999');
    await app.whenStable();
    expect(page.querySelector('h1')?.textContent).toBe('Student not found');
    expect(service.getStudents).toHaveBeenCalledTimes(1);
  });

});
