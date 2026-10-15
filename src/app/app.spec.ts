/* FILE: app.spec.ts
   WHAT: Verify the yearbook shell rather than the unused CLI welcome page.
   WHY: RouterLink in the header needs a router in the test environment. */
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('creates the app', () => {
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('renders the yearbook header and route outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('app-header')).toBeTruthy();
    expect(element.querySelector('app-top-strip')).toBeTruthy();
    expect(element.querySelector('main router-outlet')).toBeTruthy();
    expect(element.querySelector('[aria-label="GIU Yearbook, go to home"]')).toBeTruthy();
  });
});
