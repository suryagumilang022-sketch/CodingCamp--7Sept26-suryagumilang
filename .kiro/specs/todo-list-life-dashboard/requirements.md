# Requirements Document

## Introduction

The ToDo List Life Dashboard is a client-side web application that serves as a personal productivity hub. It combines a live greeting with time/date display, a Focus Timer based on the Pomodoro technique, a persistent To-Do List, and a customizable Quick Links panel. All data is stored in the browser's Local Storage — no server, no login, no setup required. The application is built with plain HTML, CSS, and Vanilla JavaScript and must run correctly in all modern browsers.

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Focus_Timer**: The 25-minute countdown timer component of the Dashboard.
- **Task**: A to-do item created by the user, consisting of a text description and a completion status.
- **Task_List**: The collection of Tasks displayed and managed by the Dashboard.
- **Quick_Link**: A user-defined shortcut consisting of a label and a URL, rendered as a clickable button.
- **Quick_Links_Panel**: The section of the Dashboard that displays Quick_Links.
- **Local_Storage**: The browser's built-in `localStorage` API used as the sole persistence mechanism.
- **Greeting_Widget**: The Dashboard section that displays the current time, date, and a time-of-day greeting.
- **Modern_Browser**: Chrome, Firefox, Edge, or Safari at their current stable release versions.

---

## Requirements

### Requirement 1: Greeting Widget

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the Dashboard, so that I have immediate situational awareness without switching to another app.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current date in a human-readable format (e.g., "Monday, 7 September 2026").
2. THE Greeting_Widget SHALL display the current time updated every second without requiring a page refresh.
3. WHEN the local time is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the local time is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the local time is between 18:00 and 20:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
6. WHEN the local time is between 21:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good Night".

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can work in focused Pomodoro-style sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialise to a duration of 25 minutes (1500 seconds) when the Dashboard loads.
2. WHEN the user activates the Start control, THE Focus_Timer SHALL begin counting down one second per second.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL display the remaining time in MM:SS format.
4. WHEN the user activates the Stop control, THE Focus_Timer SHALL pause the countdown and retain the remaining time.
5. WHEN the user activates the Reset control, THE Focus_Timer SHALL stop any active countdown and restore the display to 25:00.
6. WHEN the Focus_Timer countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and notify the user with a browser alert or an audible signal.
7. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL disable the Start control to prevent duplicate timers.

---

### Requirement 3: To-Do List — Add Tasks

**User Story:** As a user, I want to add new tasks to my list, so that I can capture things I need to do.

#### Acceptance Criteria

1. THE Task_List SHALL provide a text input field and an Add button for creating new Tasks.
2. WHEN the user submits a non-empty task description via the Add button or the Enter key, THE Task_List SHALL append a new Task with the provided description and an incomplete status.
3. IF the user attempts to submit an empty task description, THEN THE Task_List SHALL reject the submission and keep the input field focused.
4. WHEN a new Task is added, THE Task_List SHALL persist the updated Task collection to Local_Storage.

---

### Requirement 4: To-Do List — Edit Tasks

**User Story:** As a user, I want to edit the description of an existing task, so that I can correct mistakes or update task details.

#### Acceptance Criteria

1. THE Task_List SHALL provide an Edit control for each Task.
2. WHEN the user activates the Edit control for a Task, THE Task_List SHALL replace the Task description text with an editable input pre-filled with the current description.
3. WHEN the user confirms the edit (via a Save control or the Enter key) with a non-empty value, THE Task_List SHALL update the Task description and return to read-only display.
4. IF the user confirms the edit with an empty value, THEN THE Task_List SHALL reject the update and retain the previous description.
5. WHEN a Task description is successfully updated, THE Task_List SHALL persist the updated Task collection to Local_Storage.

---

### Requirement 5: To-Do List — Mark Tasks as Done

**User Story:** As a user, I want to mark tasks as completed, so that I can track my progress.

#### Acceptance Criteria

1. THE Task_List SHALL provide a checkbox or toggle control for each Task to indicate completion status.
2. WHEN the user toggles the completion control on an incomplete Task, THE Task_List SHALL mark the Task as complete and apply a distinct visual style (e.g., strikethrough text).
3. WHEN the user toggles the completion control on a complete Task, THE Task_List SHALL mark the Task as incomplete and remove the completed visual style.
4. WHEN the completion status of a Task changes, THE Task_List SHALL persist the updated Task collection to Local_Storage.

---

### Requirement 6: To-Do List — Delete Tasks

**User Story:** As a user, I want to delete tasks from my list, so that I can remove items that are no longer relevant.

#### Acceptance Criteria

1. THE Task_List SHALL provide a Delete control for each Task.
2. WHEN the user activates the Delete control for a Task, THE Task_List SHALL remove that Task from the display.
3. WHEN a Task is deleted, THE Task_List SHALL persist the updated Task collection to Local_Storage.

---

### Requirement 7: To-Do List — Persistence

**User Story:** As a user, I want my tasks to be available the next time I open the Dashboard, so that I do not lose my task list when I close the browser.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Task_List SHALL read all previously saved Tasks from Local_Storage and render them in the order they were saved.
2. IF no Tasks are found in Local_Storage on load, THEN THE Task_List SHALL display an empty list with no errors.
3. THE Task_List SHALL store Task data as a JSON array in Local_Storage under a dedicated key.

---

### Requirement 8: Quick Links — Add and Display

**User Story:** As a user, I want to add buttons that open my favourite websites, so that I can navigate to them quickly without typing URLs.

#### Acceptance Criteria

1. THE Quick_Links_Panel SHALL provide input fields for a label and a URL, plus an Add button for creating new Quick_Links.
2. WHEN the user submits a Quick_Link with a non-empty label and a non-empty URL, THE Quick_Links_Panel SHALL render the Quick_Link as a clickable button displaying the label.
3. WHEN the user activates a Quick_Link button, THE Quick_Links_Panel SHALL open the associated URL in a new browser tab.
4. IF the user attempts to submit a Quick_Link with an empty label or an empty URL, THEN THE Quick_Links_Panel SHALL reject the submission and indicate which field is missing.
5. WHEN a new Quick_Link is added, THE Quick_Links_Panel SHALL persist the updated Quick_Link collection to Local_Storage.

---

### Requirement 9: Quick Links — Delete

**User Story:** As a user, I want to remove Quick Links I no longer need, so that my panel stays relevant and uncluttered.

#### Acceptance Criteria

1. THE Quick_Links_Panel SHALL provide a Delete control for each Quick_Link button.
2. WHEN the user activates the Delete control for a Quick_Link, THE Quick_Links_Panel SHALL remove that Quick_Link from the display.
3. WHEN a Quick_Link is deleted, THE Quick_Links_Panel SHALL persist the updated Quick_Link collection to Local_Storage.

---

### Requirement 10: Quick Links — Persistence

**User Story:** As a user, I want my Quick Links to be available the next time I open the Dashboard, so that my shortcuts persist across sessions.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Quick_Links_Panel SHALL read all previously saved Quick_Links from Local_Storage and render them.
2. IF no Quick_Links are found in Local_Storage on load, THEN THE Quick_Links_Panel SHALL display an empty panel with no errors.
3. THE Quick_Links_Panel SHALL store Quick_Link data as a JSON array in Local_Storage under a dedicated key separate from the Task_List key.

---

### Requirement 11: Technical Constraints

**User Story:** As a developer, I want the Dashboard to use only HTML, CSS, and Vanilla JavaScript with a single CSS file and a single JS file, so that the codebase stays simple, readable, and dependency-free.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no external frameworks or libraries.
2. THE Dashboard SHALL include exactly one CSS file located at `css/style.css`.
3. THE Dashboard SHALL include exactly one JavaScript file located at `js/app.js`.
4. THE Dashboard SHALL use the browser Local_Storage API as the sole data persistence mechanism with no backend server.
5. THE Dashboard SHALL load and operate correctly in current stable releases of Chrome, Firefox, Edge, and Safari.

---

### Requirement 12: Visual Design and Responsiveness

**User Story:** As a user, I want a clean, readable, and visually organised interface, so that I can use the Dashboard comfortably on any screen size.

#### Acceptance Criteria

1. THE Dashboard SHALL apply a clear visual hierarchy that distinguishes each widget section (Greeting_Widget, Focus_Timer, Task_List, Quick_Links_Panel).
2. THE Dashboard SHALL use readable typography with sufficient contrast between text and background colours.
3. THE Dashboard SHALL render without horizontal scrollbars on viewport widths of 360 px and above.
4. WHEN the viewport width is below 768 px, THE Dashboard SHALL arrange all widget sections in a single-column layout.
