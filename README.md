# GIU Yearbook - Assignment 1

Completed student card component for the GIU Yearbook Angular starter.

## Run locally

Use a Node.js version supported by Angular 22: Node 22.22.3+, 24.15.0+, or 26+.

```bash
npm ci
npm start
```

Open http://localhost:4200. The directory shows eight student cards with portraits, names, faculties, class years, quotes, and links to the existing student-story placeholder.

## Assignment implementation

- `src/app/components/student-card/`: standalone `app-student-card` with a required `Student` signal input, accessible whole-card router link, lazy portrait loading, and signal/computed image fallback.
- Scoped CSS uses the starter's design tokens, 310:246 photo proportions, 20px body padding, 12px text gaps, Inter names, Lora quotes, red arrows, and a lift/shadow on hover. The global keyboard focus ring is preserved, and reduced-motion preferences are respected.
- The students page renders cards inside its existing responsive grid and retains search, faculty filtering, and sorting.
- Dynamic student URLs use server rendering so the required build succeeds without needing prerender parameters for every student ID.
- [Assignment answers and reflections](ASSIGNMENT-ANSWERS.md).

## Validation

```bash
npm test -- --watch=false
npx ng build --configuration development
npm run build
```

Ten automated tests cover card data, accessible labels, router navigation, image fallback and recovery, directory search/filter/sort, loading/error states, and the application shell.

Manual browser checks: eight loaded portraits and four columns at 1280px; one column with no horizontal overflow at 390px; search for `maya`; faculty filtering; alphabetical sorting; keyboard focus; student story navigation; missing-image fallback with the temporary JSON change reverted.

The original course project remains the source of the page layout and assets. Only the assignment component, its integration, supporting tests, build configuration fix, and documentation are changed.
