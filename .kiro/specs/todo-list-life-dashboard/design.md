# Design Document: ToDo List Life Dashboard

## Overview

The ToDo List Life Dashboard is a single-page, client-side web application built entirely with HTML5, CSS3, and Vanilla JavaScript. It requires no build tooling, no backend, and no third-party libraries — every feature runs in the browser using standard Web APIs.

The application is delivered as a single HTML file (`index.html`) that loads one CSS file (`css/style.css`) and one JavaScript file (`js/app.js`). All user data persists across sessions via the browser's `localStorage` API. The design prioritises simplicity, readability, and broad browser compatibility (Chrome, Firefox, Edge, Safari at current stable releases).

### Design Goals

- **Zero dependencies** — no npm, no bundler, no CDN links.
- **Offline-capable** — all assets are local; the app works without a network connection.
- **Accessible** — WCAG 2.1 AA contrast (≥ 4.5:1), keyboard-navigable, semantic HTML.
- **Responsive** — single-column layout below 768 px, multi-column (2-up grid) at 768 px and above.
- **Persistent** — tasks and quick links survive browser restarts through `localStorage`.

---

## Architecture

The application follows a simple **component → state → storage** data flow with no framework abstractions.

```
┌──────────────────────────────────────────────────────────────┐
│                          index.html                          │
│  ┌───────────────────┐      ┌──────────────────────────────┐ │
│  │  Greeting Widget  │      │        Focus Timer           │ │
│  └───────────────────┘      └──────────────────────────────┘ │
│  ┌───────────────────┐      ┌──────────────────────────────┐ │
│  │    To-Do List     │      │      Quick Links Panel       │ │
│  └───────────────────┘      └──────────────────────────────┘ │
└───────────────────────────────────┬──────────────────────────┘
                                    │ DOM events
                        ┌───────────▼───────────┐
                        │       js/app.js        │
                        │  ┌─────────────────┐  │
                        │  │  State Objects  │  │
                        │  │  tasks[]        │  │
                        │  │  quickLinks[]   │  │
                        │  └────────┬────────┘  │
                        │           │ read/write │
                        │  ┌────────▼────────┐  │
                        │  │  localStorage   │  │
                        │  │  "tasks"        │  │
                        │  │  "quickLinks"   │  │
                        │  └─────────────────┘  │
                        └───────────────────────┘
```

### Data Flow

1. On page load, `js/app.js` reads `localStorage` and populates in-memory state arrays.
2. User interactions trigger handler functions that mutate state arrays.
3. After every mutation, the relevant render function re-draws the corresponding section of the DOM.
4. After every mutation, the storage module writes the updated state array back to `localStorage`.

This "render from state" pattern keeps the DOM and storage always in sync without a virtual DOM or reactive library.

---

## File / Folder Structure

```
project-root/
├── index.html          ← Single HTML entry point
├── css/
│   └── style.css       ← All styles (layout, components, responsive)
└── js/
    └── app.js          ← All JavaScript (state, logic, DOM manipulation)
```

No other files are required or permitted by the technical constraints.

---

## Components and Interfaces

### HTML Page Structure

`index.html` is structured with semantic sectioning elements. Each widget maps to a `<section>` with a stable `id` used as the JavaScript hook.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Life Dashboard</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <header id="greeting-widget" role="banner">
    <p id="greeting-text"></p>   <!-- "Good Morning / Afternoon / Evening / Night" -->
    <p id="current-time"></p>    <!-- HH:MM:SS -->
    <p id="current-date"></p>    <!-- "Monday, 7 September 2026" -->
  </header>

  <main id="dashboard-grid">

    <section id="focus-timer" aria-label="Focus Timer">
      <h2>Focus Timer</h2>
      <p id="timer-display" aria-live="polite">25:00</p>
      <div class="timer-controls">
        <button id="timer-start">Start</button>
        <button id="timer-stop">Stop</button>
        <button id="timer-reset">Reset</button>
      </div>
    </section>

    <section id="todo-section" aria-label="To-Do List">
      <h2>To-Do</h2>
      <form id="todo-form">
        <input id="todo-input" type="text" placeholder="Add a task…" autocomplete="off" />
        <button type="submit">Add</button>
      </form>
      <ul id="todo-list" aria-label="Task list"></ul>
    </section>

    <section id="quick-links-section" aria-label="Quick Links">
      <h2>Quick Links</h2>
      <form id="quicklink-form">
        <input id="ql-label-input" type="text" placeholder="Label" autocomplete="off" />
        <input id="ql-url-input"   type="url"  placeholder="https://…" autocomplete="off" />
        <button type="submit">Add</button>
      </form>
      <div id="quick-links-panel" role="list"></div>
    </section>

  </main>

  <script src="js/app.js"></script>
</body>
</html>
```

**Key structural decisions:**
- The `<header>` is used for the Greeting Widget as it semantically represents page-level context.
- `aria-live="polite"` on the timer display announces time changes to screen readers without being disruptive.
- Forms use `<form>` elements so Enter-key submission works natively without extra keyboard event handling.
- `<ul>` for task list and `role="list"` for quick links panel provide correct list semantics.

---

### CSS Architecture (`css/style.css`)

The stylesheet is organised into four layers, read top to bottom:

#### 1. CSS Custom Properties (Design Tokens)

```css
:root {
  /* Colour palette — all pairs meet WCAG 2.1 AA 4.5:1 contrast */
  --color-bg:           #f5f5f5;
  --color-surface:      #ffffff;
  --color-text:         #1a1a1a;   /* 14.7:1 on --color-surface */
  --color-text-muted:   #595959;   /*  7.0:1 on --color-surface */
  --color-primary:      #1a56db;   /*  5.3:1 on --color-surface */
  --color-danger:       #c0392b;   /*  5.0:1 on --color-surface */
  --color-done:         #595959;   /*  7.0:1 on --color-surface */
  --color-border:       #d1d5db;

  /* Typography */
  --font-family:        system-ui, -apple-system, sans-serif;
  --font-size-base:     1rem;      /* ≥ 16px browser default → meets 14px minimum */
  --font-size-sm:       0.875rem;  /* 14px */
  --font-size-lg:       1.25rem;
  --font-size-xl:       2rem;

  /* Spacing */
  --spacing-sm:         0.5rem;
  --spacing-md:         1rem;
  --spacing-lg:         1.5rem;   /* 24px — satisfies 16px section spacing requirement */
  --spacing-xl:         2rem;

  /* Borders & shadows */
  --radius:             0.5rem;
  --shadow:             0 1px 3px rgba(0,0,0,.12);
}
```

#### 2. Reset / Base

Minimal reset (box-sizing, margin, padding normalisation). Body sets the base font, background, and text colour from custom properties.

#### 3. Layout

```css
/* Desktop: 2-column grid */
#dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  max-width: 1100px;
  margin: 0 auto;
}

/* Mobile: single column */
@media (max-width: 767px) {
  #dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```

The Greeting Widget (`<header>`) sits above the grid and spans full width, styled separately.

#### 4. Component Styles

Each widget section shares a `.card` base class (white background, border-radius, box-shadow, padding). Widget-specific rules layer on top:

| Selector | Purpose |
|---|---|
| `#greeting-widget` | Full-width top bar, large time/date text |
| `#timer-display` | Monospace font, large (`--font-size-xl`) |
| `.timer-controls button` | Consistent button sizing; `#timer-start[disabled]` gets reduced opacity |
| `.task-item` | Flex row: checkbox → text → edit button → delete button |
| `.task-item.done .task-text` | `text-decoration: line-through; color: var(--color-done)` |
| `.task-item.editing .task-text` | Hidden; edit input shown |
| `.quicklink-btn` | Pill-shaped buttons; wrapping flex container |

---

### JavaScript Module Organisation (`js/app.js`)

The single file is partitioned into clearly commented sections. All code runs inside a single IIFE (Immediately Invoked Function Expression) to avoid polluting the global scope.

```
(function () {

  /* =========================================================
   * 1. CONSTANTS
   * ======================================================= */

  /* =========================================================
   * 2. STATE
   * ======================================================= */

  /* =========================================================
   * 3. STORAGE — read / write localStorage
   * ======================================================= */

  /* =========================================================
   * 4. GREETING WIDGET — time, date, greeting
   * ======================================================= */

  /* =========================================================
   * 5. FOCUS TIMER — countdown logic
   * ======================================================= */

  /* =========================================================
   * 6. TO-DO LIST — CRUD + render
   * ======================================================= */

  /* =========================================================
   * 7. QUICK LINKS — CRUD + render
   * ======================================================= */

  /* =========================================================
   * 8. INIT — wire up event listeners, bootstrap on DOMContentLoaded
   * ======================================================= */

})();
```

#### Section Detail

**1. Constants**

```js
const STORAGE_KEY_TASKS  = 'tasks';
const STORAGE_KEY_LINKS  = 'quickLinks';
const TIMER_DURATION_SEC = 1500;   // 25 × 60
const MAX_QUICK_LINKS    = 20;
```

**2. State**

```js
let tasks      = [];   // Task[]
let quickLinks = [];   // QuickLink[]
let timerState = {
  remaining: TIMER_DURATION_SEC,  // seconds left
  intervalId: null,               // setInterval handle or null
  running: false
};
```

**3. Storage**

```js
function loadTasks()      { /* JSON.parse(localStorage.getItem(STORAGE_KEY_TASKS)) || [] */ }
function saveTasks()      { /* localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks)) */ }
function loadQuickLinks() { /* JSON.parse(localStorage.getItem(STORAGE_KEY_LINKS)) || [] */ }
function saveQuickLinks() { /* localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(quickLinks)) */ }
```

`JSON.parse` calls are wrapped in `try/catch` so corrupted storage data is handled gracefully (falls back to empty array).

**4. Greeting Widget**

```js
function getGreeting(hour) { /* returns string based on hour ranges */ }
function updateGreeting()  { /* sets #greeting-text, #current-time, #current-date */ }
// setInterval(updateGreeting, 1000)
```

`Date` formatting uses `toLocaleDateString` with `{ weekday:'long', year:'numeric', month:'long', day:'numeric' }` for human-readable output without a library.

**5. Focus Timer**

```js
function startTimer()  { /* creates setInterval, disables Start button */ }
function stopTimer()   { /* clears interval, enables Start button */ }
function resetTimer()  { /* calls stopTimer, restores remaining to TIMER_DURATION_SEC, re-renders */ }
function renderTimer() { /* formats remaining as MM:SS, updates #timer-display */ }
function onTimerTick() { /* decrements remaining; if 0, calls stopTimer + notifyTimerDone */ }
function notifyTimerDone() { /* alert() or plays Audio */ }
```

`setInterval` returns an ID stored in `timerState.intervalId`; `clearInterval` is always called before creating a new one to prevent duplicate timers.

**6. To-Do List**

```js
function addTask(description)          { /* creates Task, pushes to tasks[], saveTasks(), renderTasks() */ }
function deleteTask(id)                { /* filters tasks[], saveTasks(), renderTasks() */ }
function toggleTask(id)                { /* flips done, saveTasks(), renderTasks() */ }
function beginEditTask(id)             { /* marks task as editing, renderTasks() */ }
function confirmEditTask(id, newDesc)  { /* validates, updates description, saveTasks(), renderTasks() */ }
function renderTasks()                 { /* clears #todo-list, maps tasks[] to <li> DOM nodes */ }
```

`renderTasks` builds the list by clearing `#todo-list.innerHTML` and appending one `<li>` per task. Each `<li>` holds conditionally rendered read-mode and edit-mode DOM subtrees based on the task's `editing` flag.

**7. Quick Links**

```js
function addQuickLink(label, url)  { /* validates, checks MAX_QUICK_LINKS, pushes, saveQuickLinks(), renderQuickLinks() */ }
function deleteQuickLink(id)       { /* filters, saveQuickLinks(), renderQuickLinks() */ }
function renderQuickLinks()        { /* clears #quick-links-panel, maps quickLinks[] to button elements */ }
```

**8. Init**

```js
document.addEventListener('DOMContentLoaded', function () {
  tasks      = loadTasks();
  quickLinks = loadQuickLinks();

  renderTasks();
  renderQuickLinks();
  updateGreeting();
  renderTimer();

  // Form submit handlers
  document.getElementById('todo-form').addEventListener('submit', /* handler */);
  document.getElementById('quicklink-form').addEventListener('submit', /* handler */);

  // Timer button handlers
  document.getElementById('timer-start').addEventListener('click', startTimer);
  document.getElementById('timer-stop').addEventListener('click', stopTimer);
  document.getElementById('timer-reset').addEventListener('click', resetTimer);

  // Greeting clock tick
  setInterval(updateGreeting, 1000);
});
```

Event delegation is used for task list interactions (edit, save, delete, toggle) — a single listener on `#todo-list` reads `data-id` and `data-action` attributes from clicked elements to dispatch to the right handler. This avoids re-attaching listeners on every `renderTasks()` call.

---

## Data Models

### Task Object

```js
{
  id:          string,   // crypto.randomUUID() or Date.now().toString()
  description: string,   // non-empty task text
  done:        boolean,  // completion status; false on creation
  createdAt:   number    // Unix timestamp ms (Date.now()) — preserves insertion order
}
```

### QuickLink Object

```js
{
  id:        string,   // crypto.randomUUID() or Date.now().toString()
  label:     string,   // non-empty display label
  url:       string,   // non-empty URL string (validated by <input type="url">)
  createdAt: number    // Unix timestamp ms — preserves insertion order
}
```

### Local Storage Schema

| Key | Type | Description |
|---|---|---|
| `"tasks"` | `JSON array of Task` | Full ordered task list |
| `"quickLinks"` | `JSON array of QuickLink` | Full ordered quick link list |

Both values are serialised as JSON strings via `JSON.stringify` and deserialised via `JSON.parse`. No other keys are written. Keys are defined as constants in `app.js` to avoid typos.

**Example stored value for `"tasks"`:**

```json
[
  {
    "id": "1720000000000",
    "description": "Review pull request",
    "done": false,
    "createdAt": 1720000000000
  },
  {
    "id": "1720000005000",
    "description": "Write unit tests",
    "done": true,
    "createdAt": 1720000005000
  }
]
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Greeting string covers all 24 hours without gaps or overlaps

*For any* integer hour in [0, 23], `getGreeting(hour)` returns exactly one of "Good Morning", "Good Afternoon", "Good Evening", or "Good Night" — specifically:
- Hours [5, 11] → "Good Morning"
- Hours [12, 17] → "Good Afternoon"
- Hours [18, 20] → "Good Evening"
- Hours [0, 4] or [21, 23] → "Good Night"

No hour maps to an empty string or any other value.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

---

### Property 2: Date formatting produces a human-readable string

*For any* valid `Date` object, `getFormattedDate(date)` returns a non-empty string that contains a recognisable weekday name, a numeric day, a month name, and a 4-digit year in the correct language/locale.

**Validates: Requirements 1.1**

---

### Property 3: Timer display always produces valid MM:SS format

*For any* integer `seconds` in the range [0, 1500], `formatTime(seconds)` returns a string that matches the pattern `^\d{2}:\d{2}$` where the minutes portion is in [0, 25] and the seconds portion is in [0, 59].

**Validates: Requirements 2.3**

---

### Property 4: Timer reset always restores initial state

*For any* timer state (any value of `remaining` in [0, 1500], any running/stopped state), calling `resetTimer()` results in `timerState.remaining === 1500` and `timerState.running === false`.

**Validates: Requirements 2.5**

---

### Property 5: Adding a valid task grows the list and persists it

*For any* non-empty, non-whitespace-only string `description` and any existing task list state, after `addTask(description)`:
- `tasks.length` increases by exactly 1
- The newly added task has `description` equal to the input and `done === false`
- `JSON.parse(localStorage.getItem("tasks"))` contains an entry with the same `description`

**Validates: Requirements 3.2, 3.4**

---

### Property 6: Whitespace-only or empty task descriptions are rejected

*For any* string composed entirely of whitespace characters (including the empty string), `addTask(input)` does not change `tasks.length` and does not write a new entry to `localStorage`.

**Validates: Requirements 3.3**

---

### Property 7: Editing a task with a valid description updates it and persists

*For any* task in the list and any non-empty, non-whitespace-only replacement string `newDesc`, after `confirmEditTask(id, newDesc)`:
- The task's `description` equals `newDesc`
- The task's `editing` flag is `false`
- `JSON.parse(localStorage.getItem("tasks"))` reflects the updated description

**Validates: Requirements 4.3, 4.5**

---

### Property 8: Editing a task with an empty value leaves the description unchanged

*For any* task in the list and any whitespace-only string (including empty string), calling `confirmEditTask(id, input)` leaves the task's `description` unchanged and does not update `localStorage` with a blank description.

**Validates: Requirements 4.4**

---

### Property 9: Toggle completion is a round-trip (idempotence after two toggles)

*For any* task, toggling its completion status twice returns it to its original `done` value. Additionally:
- A single toggle on a task with `done === false` produces `done === true`
- A single toggle on a task with `done === true` produces `done === false`
- After every toggle, `JSON.parse(localStorage.getItem("tasks"))` reflects the updated `done` value

**Validates: Requirements 5.2, 5.3, 5.4**

---

### Property 10: Deleting a task removes it from state and storage

*For any* task list containing a task with a given `id`, after `deleteTask(id)`:
- `tasks` contains no item with that `id`
- `JSON.parse(localStorage.getItem("tasks"))` contains no item with that `id`

**Validates: Requirements 6.2, 6.3**

---

### Property 11: Task persistence is a round-trip

*For any* array of Task objects written via `saveTasks()`, calling `loadTasks()` returns an array that is structurally equivalent (same items, same order, same field values).

**Validates: Requirements 7.1, 7.3**

---

### Property 12: Adding a valid Quick Link grows the list and persists it

*For any* non-empty label string and non-empty URL string, after `addQuickLink(label, url)`:
- `quickLinks.length` increases by exactly 1
- The new entry has the matching `label` and `url`
- `JSON.parse(localStorage.getItem("quickLinks"))` contains the new entry

**Validates: Requirements 8.2, 8.5**

---

### Property 13: Invalid Quick Link submissions are rejected

*For any* (label, url) pair where at least one of `label` or `url` is empty or whitespace-only, `addQuickLink(label, url)` does not change `quickLinks.length` and does not add a new entry to `localStorage`.

**Validates: Requirements 8.4**

---

### Property 14: Deleting a Quick Link removes it from state and storage

*For any* quickLinks array containing an item with a given `id`, after `deleteQuickLink(id)`:
- `quickLinks` contains no item with that `id`
- `JSON.parse(localStorage.getItem("quickLinks"))` contains no item with that `id`

**Validates: Requirements 9.2, 9.3**

---

### Property 15: Quick Links persistence is a round-trip

*For any* array of QuickLink objects written via `saveQuickLinks()`, calling `loadQuickLinks()` returns a structurally equivalent array (same items, same order, same field values). The storage key used must differ from the task storage key.

**Validates: Requirements 10.1, 10.3**

---

## Error Handling

### localStorage Unavailability

In some browsers/contexts (private mode quota exhaustion, `SecurityError` from sandboxed iframes), `localStorage` calls can throw. Every read and write is wrapped in a `try/catch`:

```js
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.warn('Could not persist tasks:', e);
    // App continues functioning in-memory; data will not survive a reload
  }
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_TASKS)) || [];
  } catch (e) {
    console.warn('Could not load tasks, starting empty:', e);
    return [];
  }
}
```

The same pattern applies to `saveQuickLinks` / `loadQuickLinks`.

### Corrupted Storage Data

If `localStorage` contains a value that is not valid JSON (e.g., manually edited by the user in DevTools), `JSON.parse` throws a `SyntaxError`. The `try/catch` in every load function falls back to an empty array, preserving app functionality without crashing.

### Input Validation

| Location | Rule | Enforcement |
|---|---|---|
| Add Task form | Description must be non-empty after `.trim()` | `if (!input.trim()) return;` before `addTask` |
| Edit Task save | New description must be non-empty after `.trim()` | `if (!newDesc.trim()) return;` before `confirmEditTask` |
| Add Quick Link form | Both label and URL must be non-empty after `.trim()` | Individual field checks; error indication via `aria-invalid` and visible message |
| Timer controls | Start disabled while running | `button.disabled = true` when `timerState.running` |
| Quick Links cap | Maximum 20 links | `if (quickLinks.length >= MAX_QUICK_LINKS) return;` before `addQuickLink` |

### Timer Edge Cases

- **Double-start prevention**: `timerState.running` is checked before starting a new interval; the Start button is also `disabled`.
- **Reset while running**: `resetTimer` always calls `clearInterval(timerState.intervalId)` first, regardless of `timerState.running`, to handle race conditions.
- **Timer reaching zero**: The `onTimerTick` function checks `if (timerState.remaining <= 0)` (using `<=` rather than `===`) to guard against skipped ticks at low system load.

---

## Testing Strategy

### Overview

The feature uses a dual testing approach:
- **Property-based tests** validate universal properties across randomised inputs (covering the 15 properties above)
- **Unit/example tests** cover specific scenarios, edge cases, and wiring checks

**Property-based testing library**: [fast-check](https://fast-check.dev/) (JavaScript) — well-maintained, no build tooling required for browser-compatible builds; can be loaded via a CDN script tag in the test harness.

**Test runner**: [Vitest](https://vitest.dev/) or plain `<script>` harness with fast-check in a single HTML test page (keeping the zero-dependency philosophy for production code; dev dependencies are acceptable for testing).

### Property-Based Tests

Each property test runs a **minimum of 100 iterations** (fast-check default is 100; set `numRuns: 100` explicitly). Each test references its design property via a comment tag.

| Test | Property | fast-check Arbitrary |
|---|---|---|
| Greeting covers all hours | Property 1 | `fc.integer({ min: 0, max: 23 })` |
| Date format is human-readable | Property 2 | `fc.date()` |
| Timer format MM:SS | Property 3 | `fc.integer({ min: 0, max: 1500 })` |
| Reset restores 1500s | Property 4 | `fc.record({ remaining: fc.integer({min:0,max:1500}), running: fc.boolean() })` |
| Adding valid task grows list | Property 5 | `fc.string({ minLength: 1 })` filtered to non-whitespace |
| Whitespace task rejected | Property 6 | `fc.stringOf(fc.constantFrom(' ', '\t', '\n'))` |
| Valid edit updates description | Property 7 | `fc.tuple(fc.uuid(), fc.string({ minLength: 1 }))` |
| Empty edit leaves description | Property 8 | `fc.stringOf(fc.constantFrom(' ', '\t', '\n'))` |
| Toggle is round-trip | Property 9 | `fc.boolean()` for initial done state |
| Delete removes task | Property 10 | `fc.array(taskArbitrary, { minLength: 1 })` |
| Task round-trip | Property 11 | `fc.array(taskArbitrary)` |
| Valid quick link added | Property 12 | `fc.tuple(fc.string({minLength:1}), fc.webUrl())` |
| Invalid quick link rejected | Property 13 | Pairs where at least one is whitespace-only |
| Delete quick link | Property 14 | `fc.array(quickLinkArbitrary, { minLength: 1 })` |
| Quick Links round-trip | Property 15 | `fc.array(quickLinkArbitrary)` |

**Tag format for each property test:**

```js
// Feature: todo-list-life-dashboard, Property 1: Greeting covers all 24 hours
test('getGreeting covers all 24 hours', () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
      const result = getGreeting(hour);
      const valid = ['Good Morning', 'Good Afternoon', 'Good Evening', 'Good Night'];
      return valid.includes(result);
    }),
    { numRuns: 100 }
  );
});
```

### Unit / Example Tests

| Test | Requirement |
|---|---|
| Timer initialises to 25:00 on load | 2.1 |
| One tick decrements remaining by 1 | 2.2 |
| Timer stops and alerts at 0 | 2.6 |
| Start button is disabled while running | 2.7 |
| beginEditTask shows pre-filled input | 4.2 |
| Quick Link button calls window.open with correct URL and "_blank" | 8.3 |
| Empty localStorage → empty task list, no error | 7.2 (edge case) |
| Empty localStorage → empty quick links, no error | 10.2 (edge case) |
| Corrupted localStorage JSON → empty list, no crash | Error handling |

### Accessibility and Responsive Testing

- Run [axe-core](https://github.com/dequelabs/axe-core) automated scan to verify WCAG 2.1 AA compliance (contrast ratios, ARIA attributes, keyboard focus order).
- Manual viewport testing at 320 px, 375 px, 768 px, 1280 px to verify layout breakpoints.
- Keyboard-only navigation check: all interactive controls reachable and operable via Tab/Enter/Space.
- Screen reader smoke test with NVDA (Windows) or VoiceOver (macOS/iOS).

### Cross-Browser Verification

Run the full test suite and manual smoke tests in:
- Chrome (latest stable)
- Firefox (latest stable)
- Edge (latest stable)
- Safari (latest stable on macOS/iOS)

No polyfills are expected to be needed given the exclusive use of `localStorage`, `setInterval`, `Date`, and standard DOM APIs — all of which have been supported in all target browsers for many years.
