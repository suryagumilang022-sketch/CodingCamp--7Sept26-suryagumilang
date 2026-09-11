# Implementation Plan: ToDo List Life Dashboard

## Overview

Build a single-page, client-side productivity dashboard using only HTML5, CSS3, and Vanilla JavaScript — no build tooling, no frameworks, no external runtime dependencies. All user data persists via `localStorage`. The deliverable is exactly three files: `index.html`, `css/style.css`, and `js/app.js`.

---

## Tasks

- [x] 1. Scaffold project structure and HTML skeleton
  - [x] 1.1 Create the folder structure and `index.html`
    - Create `index.html` at the project root, `css/` directory, and `js/` directory
    - Write the full semantic HTML skeleton from the design: `<header id="greeting-widget">`, `<main id="dashboard-grid">` containing `<section id="focus-timer">`, `<section id="todo-section">`, and `<section id="quick-links-section">`
    - Include all stable `id` hooks, ARIA attributes (`aria-live="polite"`, `aria-label`), and the `<form>` elements exactly as specified in the design
    - Add `<link rel="stylesheet" href="css/style.css" />` in `<head>` and `<script src="js/app.js"></script>` before `</body>`
    - Create `css/style.css` as an empty file and `js/app.js` with the outer IIFE scaffold (`(function () { /* 8 sections */ })();`)
    - _Requirements: 11.2, 11.3_

- [x] 2. CSS — Design tokens, reset, and base styles
  - [x] 2.1 Write CSS custom properties and base reset
    - Define all `:root` custom properties exactly as in the design: colour palette (`--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-danger`, `--color-done`, `--color-border`), typography (`--font-family`, `--font-size-base`, `--font-size-sm`, `--font-size-lg`, `--font-size-xl`), spacing (`--spacing-sm` through `--spacing-xl`), and borders/shadows (`--radius`, `--shadow`)
    - Write minimal reset: `box-sizing: border-box`, margin/padding normalisation
    - Set body font, background, and text colour from custom properties
    - Verify all colour pairs meet WCAG 2.1 AA ≥ 4.5:1 contrast using the values in the design
    - _Requirements: 12.2, 11.1_

- [x] 3. CSS — Layout (grid and responsive breakpoint)
  - [x] 3.1 Implement dashboard grid and responsive layout
    - Style `#dashboard-grid` as a 2-column CSS grid (`grid-template-columns: 1fr 1fr`, `gap: var(--spacing-lg)`, `max-width: 1100px`, `margin: 0 auto`)
    - Add `@media (max-width: 767px)` rule switching `#dashboard-grid` to `grid-template-columns: 1fr`
    - Style `#greeting-widget` as a full-width top bar sitting above the grid
    - Ensure no horizontal scrollbars appear at viewport widths of 360 px and above
    - _Requirements: 12.1, 12.3, 12.4_

- [x] 4. CSS — Component styles
  - [x] 4.1 Style the Greeting Widget and shared card base
    - Create `.card` base class: white background (`--color-surface`), `--radius` border-radius, `--shadow` box-shadow, `--spacing-md` padding; apply to all four widget sections
    - Style `#greeting-widget`: full-width, centred content, large time (`--font-size-xl`) and readable date/greeting text
    - Style `#current-time` with a monospace font stack so digits don't shift width
    - _Requirements: 12.1, 12.2, 1.1_

  - [x] 4.2 Style the Focus Timer
    - Style `#timer-display` with `--font-size-xl` and monospace font
    - Style `.timer-controls button` for consistent sizing and spacing
    - Add `#timer-start[disabled] { opacity: 0.5; cursor: not-allowed; }` rule
    - _Requirements: 2.3, 2.7_

  - [x] 4.3 Style the To-Do List
    - Style `.task-item` as a flex row: checkbox → task text → edit button → delete button; space items with `--spacing-sm`
    - Add `.task-item.done .task-text { text-decoration: line-through; color: var(--color-done); }`
    - Add `.task-item.editing .task-text { display: none; }` and show the edit `<input>` in its place
    - Style the add-task `<form>` with an inline layout (input expands, button fixed width)
    - _Requirements: 5.2, 5.3, 4.2_

  - [x] 4.4 Style the Quick Links Panel
    - Style `#quick-links-panel` as a wrapping flex container
    - Style `.quicklink-btn` as pill-shaped buttons using `--color-primary` and `--radius`
    - Add a small delete icon/button overlaid on or adjacent to each quick link button
    - _Requirements: 8.2, 12.1_

- [x] 5. JS — Constants and State (Section 1 & 2 of IIFE)
  - [x] 5.1 Write constants and initial state objects
    - Define `STORAGE_KEY_TASKS = 'tasks'`, `STORAGE_KEY_LINKS = 'quickLinks'`, `TIMER_DURATION_SEC = 1500`, `MAX_QUICK_LINKS = 20`
    - Declare `let tasks = []`, `let quickLinks = []`, and `let timerState = { remaining: TIMER_DURATION_SEC, intervalId: null, running: false }`
    - _Requirements: 2.1, 11.3_

- [x] 6. JS — Storage module (Section 3 of IIFE)
  - [x] 6.1 Implement load/save functions with error handling
    - Implement `loadTasks()`: `JSON.parse(localStorage.getItem(STORAGE_KEY_TASKS)) || []` inside a `try/catch` that logs a warning and returns `[]` on error
    - Implement `saveTasks()`: `localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks))` inside a `try/catch` that logs a warning on error
    - Implement `loadQuickLinks()` and `saveQuickLinks()` with the same pattern using `STORAGE_KEY_LINKS`
    - _Requirements: 7.1, 7.2, 7.3, 10.1, 10.2, 10.3_

  - [ ]* 6.2 Write property tests for storage round-trip (Properties 11 and 15)
    - **Property 11: Task persistence is a round-trip**
    - **Validates: Requirements 7.1, 7.3**
    - **Property 15: Quick Links persistence is a round-trip**
    - **Validates: Requirements 10.1, 10.3**
    - Use `fc.array(taskArbitrary)` and `fc.array(quickLinkArbitrary)` arbitraries
    - Mock `localStorage` in the test environment; assert structural equivalence after save → load cycle

- [x] 7. JS — Greeting Widget (Section 4 of IIFE)
  - [x] 7.1 Implement greeting, time, and date functions
    - Implement `getGreeting(hour)`: returns "Good Morning" for hours 5–11, "Good Afternoon" for 12–17, "Good Evening" for 18–20, "Good Night" for 0–4 and 21–23
    - Implement `getFormattedDate(date)`: uses `toLocaleDateString` with `{ weekday:'long', year:'numeric', month:'long', day:'numeric' }` to produce a human-readable string
    - Implement `updateGreeting()`: reads `new Date()`, sets `#greeting-text`, `#current-time` (HH:MM:SS), and `#current-date`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 7.2 Write property tests for greeting and date formatting (Properties 1 and 2)
    - **Property 1: Greeting string covers all 24 hours without gaps or overlaps**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
    - Use `fc.integer({ min: 0, max: 23 })` and assert result is one of the four expected strings
    - **Property 2: Date formatting produces a human-readable string**
    - **Validates: Requirements 1.1**
    - Use `fc.date()` and assert the result is a non-empty string containing weekday, day, month, and year

- [x] 8. JS — Focus Timer (Section 5 of IIFE)
  - [x] 8.1 Implement timer logic and rendering
    - Implement `formatTime(seconds)`: returns a `MM:SS` string, zero-padded (e.g., `String(Math.floor(s/60)).padStart(2,'0')`)
    - Implement `renderTimer()`: sets `#timer-display.textContent` from `formatTime(timerState.remaining)`
    - Implement `onTimerTick()`: decrements `timerState.remaining`; if `<= 0` calls `stopTimer()` then `notifyTimerDone()`
    - Implement `notifyTimerDone()`: shows a `window.alert` message or plays an `Audio` tone
    - Implement `startTimer()`: guards against double-start via `timerState.running`, sets `timerState.intervalId = setInterval(onTimerTick, 1000)`, sets `timerState.running = true`, disables `#timer-start`
    - Implement `stopTimer()`: calls `clearInterval(timerState.intervalId)`, sets `timerState.running = false`, re-enables `#timer-start`
    - Implement `resetTimer()`: calls `stopTimer()`, restores `timerState.remaining = TIMER_DURATION_SEC`, calls `renderTimer()`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 8.2 Write property tests for timer display and reset (Properties 3 and 4)
    - **Property 3: Timer display always produces valid MM:SS format**
    - **Validates: Requirements 2.3**
    - Use `fc.integer({ min: 0, max: 1500 })` and assert output matches `/^\d{2}:\d{2}$/`
    - **Property 4: Timer reset always restores initial state**
    - **Validates: Requirements 2.5**
    - Use `fc.record({ remaining: fc.integer({min:0,max:1500}), running: fc.boolean() })` to set arbitrary timer state before calling `resetTimer()`, then assert `remaining === 1500` and `running === false`

- [ ] 9. Checkpoint — Core infrastructure complete
  - Ensure `index.html` opens in a browser with correct structure, CSS styles applied, and no JS console errors on load. Ask the user if questions arise.

- [x] 10. JS — To-Do List (Section 6 of IIFE)
  - [x] 10.1 Implement task CRUD functions
    - Implement `addTask(description)`: trims input, returns early if empty, creates a Task object `{ id: crypto.randomUUID(), description, done: false, createdAt: Date.now() }`, pushes to `tasks`, calls `saveTasks()` and `renderTasks()`
    - Implement `deleteTask(id)`: filters `tasks` array, calls `saveTasks()` and `renderTasks()`
    - Implement `toggleTask(id)`: flips `done` on the matching task, calls `saveTasks()` and `renderTasks()`
    - Implement `beginEditTask(id)`: sets `editing: true` on the matching task, calls `renderTasks()`
    - Implement `confirmEditTask(id, newDesc)`: trims `newDesc`, returns early if empty (leaving description unchanged), updates `description`, sets `editing: false`, calls `saveTasks()` and `renderTasks()`
    - _Requirements: 3.2, 3.3, 3.4, 4.3, 4.4, 4.5, 5.2, 5.3, 5.4, 6.2, 6.3_

  - [x] 10.2 Implement `renderTasks()`
    - Clear `#todo-list.innerHTML`
    - For each task in `tasks`, create an `<li class="task-item">` (add `done` class if `task.done`)
    - In read mode: checkbox (`data-action="toggle"`), `<span class="task-text">`, edit button (`data-action="edit"`), delete button (`data-action="delete"`) — all with `data-id` attributes
    - In edit mode (`task.editing`): hide `.task-text`, show `<input>` pre-filled with `task.description`, save button (`data-action="save"`), cancel button (`data-action="cancel"`)
    - Event delegation on `#todo-list` reads `data-action` and `data-id` from click/change events and dispatches to the correct handler
    - _Requirements: 3.1, 4.1, 4.2, 5.1, 6.1_

  - [ ]* 10.3 Write property tests for task add, edit, toggle, and delete (Properties 5–10)
    - **Property 5: Adding a valid task grows the list and persists it**
    - **Validates: Requirements 3.2, 3.4**
    - **Property 6: Whitespace-only or empty task descriptions are rejected**
    - **Validates: Requirements 3.3**
    - **Property 7: Editing a task with a valid description updates it and persists**
    - **Validates: Requirements 4.3, 4.5**
    - **Property 8: Editing a task with an empty value leaves the description unchanged**
    - **Validates: Requirements 4.4**
    - **Property 9: Toggle completion is a round-trip**
    - **Validates: Requirements 5.2, 5.3, 5.4**
    - **Property 10: Deleting a task removes it from state and storage**
    - **Validates: Requirements 6.2, 6.3**
    - Use arbitraries from design Testing Strategy table; mock `localStorage`

- [x] 11. JS — Quick Links (Section 7 of IIFE)
  - [x] 11.1 Implement Quick Link CRUD functions
    - Implement `addQuickLink(label, url)`: trims both fields, returns early if either is empty; returns early if `quickLinks.length >= MAX_QUICK_LINKS`; creates `{ id: crypto.randomUUID(), label, url, createdAt: Date.now() }`, pushes, calls `saveQuickLinks()` and `renderQuickLinks()`
    - Implement `deleteQuickLink(id)`: filters `quickLinks`, calls `saveQuickLinks()` and `renderQuickLinks()`
    - _Requirements: 8.2, 8.4, 8.5, 9.2, 9.3_

  - [x] 11.2 Implement `renderQuickLinks()`
    - Clear `#quick-links-panel.innerHTML`
    - For each entry, create a wrapper `<div>` containing a `<button class="quicklink-btn">` that calls `window.open(url, '_blank')` on click, and a delete `<button>` with `data-id`
    - _Requirements: 8.2, 8.3, 9.1_

  - [ ]* 11.3 Write property tests for Quick Link add, delete, and persistence (Properties 12–15)
    - **Property 12: Adding a valid Quick Link grows the list and persists it**
    - **Validates: Requirements 8.2, 8.5**
    - **Property 13: Invalid Quick Link submissions are rejected**
    - **Validates: Requirements 8.4**
    - **Property 14: Deleting a Quick Link removes it from state and storage**
    - **Validates: Requirements 9.2, 9.3**
    - **Property 15: Quick Links persistence is a round-trip** *(also covered in 6.2)*
    - **Validates: Requirements 10.1, 10.3**
    - Use `fc.tuple(fc.string({minLength:1}), fc.webUrl())` and whitespace arbitraries; mock `localStorage`

- [x] 12. JS — Init (Section 8 of IIFE)
  - [x] 12.1 Wire up event listeners and bootstrap on DOMContentLoaded
    - Inside `DOMContentLoaded`: call `tasks = loadTasks()`, `quickLinks = loadQuickLinks()`, `renderTasks()`, `renderQuickLinks()`, `updateGreeting()`, `renderTimer()`
    - Attach `submit` listener to `#todo-form`: prevent default, read `#todo-input.value`, call `addTask`, clear input
    - Attach `submit` listener to `#quicklink-form`: prevent default, read `#ql-label-input` and `#ql-url-input`, validate (show `aria-invalid` and error message if either is empty), call `addQuickLink`, clear inputs
    - Attach `click` listeners to `#timer-start`, `#timer-stop`, `#timer-reset`
    - Attach `click` listener on `#todo-list` for event delegation (reads `data-action` and `data-id`)
    - Start the greeting clock: `setInterval(updateGreeting, 1000)`
    - _Requirements: 2.2, 2.4, 2.5, 3.1, 3.2, 3.3, 8.1, 8.4_

- [x] 13. Checkpoint — Full feature integration
  - Open `index.html` in all four target browsers (Chrome, Firefox, Edge, Safari). Verify all widgets render, interactions work (add/edit/delete tasks, timer start/stop/reset, quick links add/open/delete), and data survives a page reload. Ask the user if questions arise.

- [-] 14. Cross-browser and responsive verification
  - [ ] 14.1 Verify responsive layout at key breakpoints
    - Test at 360 px, 375 px, 768 px, and 1280 px viewport widths
    - Confirm single-column layout below 768 px and 2-column grid at 768 px and above
    - Confirm no horizontal scrollbars at any width ≥ 360 px
    - _Requirements: 12.3, 12.4_

  - [ ]* 14.2 Run accessibility checks
    - Add axe-core via CDN script tag to a test copy of `index.html` and run automated WCAG 2.1 AA scan
    - Verify keyboard navigation: all interactive controls reachable and operable via Tab/Enter/Space
    - Confirm `aria-live="polite"` on `#timer-display` is present and correct
    - Check colour contrast values against the ≥ 4.5:1 requirement using the design token values
    - _Requirements: 12.2, 11.5_

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property test sub-tasks reference specific design properties by number for traceability
- All property tests should use [fast-check](https://fast-check.dev/) with `numRuns: 100` as specified in the design
- The test runner can be Vitest (recommended) or a plain `<script>` harness — production code remains dependency-free either way
- `crypto.randomUUID()` is supported in all target browsers at current stable releases; no polyfill needed
- Event delegation on `#todo-list` avoids re-attaching listeners on every `renderTasks()` call — critical for correctness
- `clearInterval` is always called before creating a new timer interval to prevent duplicate timers

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "5.1"] },
    { "id": 2, "tasks": ["3.1", "6.1"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4", "6.2", "7.1"] },
    { "id": 4, "tasks": ["7.2", "8.1"] },
    { "id": 5, "tasks": ["8.2", "10.1", "11.1"] },
    { "id": 6, "tasks": ["10.2", "11.2", "10.3"] },
    { "id": 7, "tasks": ["11.3", "12.1"] },
    { "id": 8, "tasks": ["14.1"] },
    { "id": 9, "tasks": ["14.2"] }
  ]
}
```
