# Assignment 1: Student Card Component

## Questions from the lab

### Question 1: Why does the selector start with `app-`?

`app` is the project's component prefix, configured in `angular.json`. It keeps application components recognizable and avoids collisions with native HTML tags or components from other libraries, just like `app-header` and `app-top-strip`.

### Step 2: Which fields does the card use?

- Displayed fields: `photo`, `name`, `faculty`, `classYear`, and `quote`.
- Story link: `id`, producing a route such as `/students/1`.
- Featured-first sorting: `featured`; the page sorts the list, while the card does not display this field.

### Question 2: Would the card update if the parent passed another student?

Yes. `student` is a signal input, so Angular updates template expressions and computed values that read `student()` when the parent supplies a new value. The component also resets its image error state when that input changes so a new portrait can load after a previous failure.

### Question 3: Why is the arrow red without a color written in the SVG?

The SVG uses `stroke="currentColor"`, which takes its stroke color from the CSS `color` property. `.card__arrow` sets that property to the existing `--color-red` token.

### Question 4: Why use `computed` for `photoSrc` instead of assigning it in the constructor?

`computed` derives the image path from reactive state and recalculates when the signals it reads change. A plain constructor assignment would run only once, and would not respond to a later image failure or a replacement student.

## Reflection questions

### 1. Why does the card receive an input instead of loading from StudentService?

The page loads and manages the student collection, while the card only displays the student it receives. This keeps data fetching in one place, avoids a separate request for every card, and makes the card easy to reuse and test.

### 2. What is the advantage of a separate card component?

The component keeps its template, styles, and image fallback logic together, leaving the students page focused on loading, filtering, and sorting. It can be reused elsewhere, and a change to the card's design can be made in one place.

### 3. Which files would change to show a new graduationDate field?

Add `graduationDate` to `src/app/models/student.model.ts`, then add values to `public/mock-api/students.json` while using the mock API. Render the field in `student-card.html`, adding a date-formatting import in `student-card.ts` or styles in `student-card.css` only if needed; update relevant test fixtures and expectations as well.

### 4. Which step was hardest, and how was it resolved?

Implementation-based reflection: Step 13 requires coordinating the input, image error signal, and computed source, including retrying a different portrait after an earlier failure. This was checked by temporarily using a missing photo path, confirming the placeholder appeared, restoring the JSON, and adding tests for fallback and input replacement; adapt this reflection to your own learning experience.
