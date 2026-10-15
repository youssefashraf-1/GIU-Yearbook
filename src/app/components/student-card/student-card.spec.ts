/* FILE: components/student-card/student-card.spec.ts
   WHAT: Check data binding, navigation and portrait recovery.
   WHY: These behaviours must keep working when the input changes. */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { StudentCard } from './student-card';
import { Student } from '../../models/student.model';
import { PlaceholderPage } from '../../pages/placeholder-page/placeholder-page';

const maya: Student = {
  id: 1,
  name: 'Maya Hassan',
  faculty: 'Engineering',
  classYear: 2028,
  quote: 'Build things that make a difference.',
  photo: 'images/students/maya-hassan.jpg',
  featured: true,
};

describe('StudentCard', () => {
  let fixture: ComponentFixture<StudentCard>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCard],
      providers: [
        provideRouter([
          { path: 'students/:id', component: PlaceholderPage, data: { title: 'Student story' } },
        ]),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(StudentCard);
    fixture.componentRef.setInput('student', maya);
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  it('renders the student details and accessible portrait', () => {
    expect(element.querySelector('h3')?.textContent).toBe(maya.name);
    expect(element.querySelector('.card__meta')?.textContent).toBe('Engineering · Class of 2028');
    expect(element.querySelector('.card__quote')?.textContent).toBe(`“${maya.quote}”`);
    const image = element.querySelector('img')!;
    expect(image.getAttribute('src')).toBe(maya.photo);
    expect(image.alt).toBe('Portrait of Maya Hassan');
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(element.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('navigates to the student story through the whole-card link', async () => {
    const link = element.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('/students/1');
    expect(link.getAttribute('aria-label')).toBe('Read the story of Maya Hassan');
    link.click();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/students/1');
  });

  it('shows the placeholder after an image error', async () => {
    const image = element.querySelector('img')!;
    image.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(image.getAttribute('src')).toBe('images/placeholder-portrait.svg');
    image.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(image.getAttribute('src')).toBe('images/placeholder-portrait.svg');
  });

  it('updates the details and retries a new portrait after a previous failure', async () => {
    element.querySelector('img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    fixture.componentRef.setInput('student', {
      ...maya,
      id: 2,
      name: 'Adam Schneider',
      faculty: 'Informatics',
      photo: 'images/students/adam-schneider.jpg',
    });
    await fixture.whenStable();
    expect(element.querySelector('h3')?.textContent).toBe('Adam Schneider');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/students/2');
    expect(element.querySelector('img')?.getAttribute('src')).toBe(
      'images/students/adam-schneider.jpg',
    );
  });
});
