(function () {

  /* =========================================================
   * 1. CONSTANTS
   * ======================================================= */

  const STORAGE_KEY_TASKS  = 'tasks';
  const STORAGE_KEY_LINKS  = 'quickLinks';
  const TIMER_DURATION_SEC = 1500;   // 25 × 60
  const MAX_QUICK_LINKS    = 20;

  /* =========================================================
   * 2. STATE
   * ======================================================= */

  let tasks      = [];   // Task[]
  let quickLinks = [];   // QuickLink[]
  let timerState = {
    remaining:  TIMER_DURATION_SEC,  // seconds left
    intervalId: null,                // setInterval handle or null
    running:    false
  };

  /* =========================================================
   * 3. STORAGE — read / write localStorage
   * ======================================================= */

  function loadTasks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_TASKS)) || [];
    } catch (e) {
      console.warn('Could not load tasks, starting empty:', e);
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Could not persist tasks:', e);
    }
  }

  function loadQuickLinks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_LINKS)) || [];
    } catch (e) {
      console.warn('Could not load quick links, starting empty:', e);
      return [];
    }
  }

  function saveQuickLinks() {
    try {
      localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(quickLinks));
    } catch (e) {
      console.warn('Could not persist quick links:', e);
    }
  }

  /* =========================================================
   * 4. GREETING WIDGET — time, date, greeting
   * ======================================================= */

  /**
   * Returns a time-of-day greeting string based on the given hour (0–23).
   * [5–11]  → "Good Morning"
   * [12–17] → "Good Afternoon"
   * [18–20] → "Good Evening"
   * [0–4] and [21–23] → "Good Night"
   * @param {number} hour - integer in [0, 23]
   * @returns {string}
   */
  function getGreeting(hour) {
    if (hour >= 5 && hour <= 11)  return 'Good Morning';
    if (hour >= 12 && hour <= 17) return 'Good Afternoon';
    if (hour >= 18 && hour <= 20) return 'Good Evening';
    return 'Good Night';
  }

  /**
   * Returns a human-readable date string for the given Date object,
   * e.g. "Monday, 7 September 2026".
   * @param {Date} date
   * @returns {string}
   */
  function getFormattedDate(date) {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric'
    });
  }

  /**
   * Reads the current time, then updates #greeting-text, #current-time,
   * and #current-date in the DOM.
   * Called once on init and then every second via setInterval in Section 8.
   */
  function updateGreeting() {
    var now  = new Date();
    var hour = now.getHours();
    var hh   = String(hour).padStart(2, '0');
    var mm   = String(now.getMinutes()).padStart(2, '0');
    var ss   = String(now.getSeconds()).padStart(2, '0');

    document.getElementById('greeting-text').textContent = getGreeting(hour);
    document.getElementById('current-time').textContent  = hh + ':' + mm + ':' + ss;
    document.getElementById('current-date').textContent  = getFormattedDate(now);
  }

  /* =========================================================
   * 5. FOCUS TIMER — countdown logic
   * ======================================================= */

  /**
   * Converts a total number of seconds into a zero-padded MM:SS string.
   * @param {number} seconds - integer in [0, 1500]
   * @returns {string} e.g. "25:00", "04:33"
   */
  function formatTime(seconds) {
    var minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    var secs    = String(seconds % 60).padStart(2, '0');
    return minutes + ':' + secs;
  }

  /**
   * Updates #timer-display with the current remaining time from timerState.
   */
  function renderTimer() {
    document.getElementById('timer-display').textContent = formatTime(timerState.remaining);
  }

  /**
   * Called once per second by setInterval while the timer is running.
   * Decrements remaining time; stops and notifies when it reaches zero.
   */
  function onTimerTick() {
    timerState.remaining -= 1;
    renderTimer();
    if (timerState.remaining <= 0) {
      stopTimer();
      notifyTimerDone();
    }
  }

  /**
   * Notifies the user that the focus session has ended.
   */
  function notifyTimerDone() {
    window.alert('Focus session complete! Time for a break.');
  }

  /**
   * Starts the countdown. Guards against double-start via timerState.running.
   */
  function startTimer() {
    if (timerState.running) return;
    timerState.intervalId = setInterval(onTimerTick, 1000);
    timerState.running    = true;
    document.getElementById('timer-start').disabled = true;
  }

  /**
   * Pauses the countdown and re-enables the Start button.
   */
  function stopTimer() {
    clearInterval(timerState.intervalId);
    timerState.running = false;
    document.getElementById('timer-start').disabled = false;
  }

  /**
   * Stops any active countdown, restores the full 25-minute duration, and re-renders.
   */
  function resetTimer() {
    stopTimer();
    timerState.remaining = TIMER_DURATION_SEC;
    renderTimer();
  }

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
