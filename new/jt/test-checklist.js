/**
 * Test Checklist — persistence and summary
 */

const TEST_CHECKLIST_KEY = 'jobTrackerTestChecklist';
const TEST_COUNT = 10;

function getChecklistState() {
  try {
    const raw = localStorage.getItem(TEST_CHECKLIST_KEY);
    if (!raw) return Array(TEST_COUNT).fill(false);
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length !== TEST_COUNT) return Array(TEST_COUNT).fill(false);
    return arr.map(Boolean);
  } catch {
    return Array(TEST_COUNT).fill(false);
  }
}

function setChecklistState(state) {
  try {
    localStorage.setItem(TEST_CHECKLIST_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function allTestsPassed() {
  const state = getChecklistState();
  return state.length === TEST_COUNT && state.every(Boolean);
}

function updateSummary() {
  const state = getChecklistState();
  const passed = state.filter(Boolean).length;
  const countEl = document.getElementById('test-summary-count');
  const warningEl = document.getElementById('test-summary-warning');
  if (countEl) countEl.textContent = 'Tests Passed: ' + passed + ' / ' + TEST_COUNT;
  if (warningEl) warningEl.style.display = passed < TEST_COUNT ? 'block' : 'none';
}

(function() {
  const checklist = document.getElementById('test-checklist');
  const state = getChecklistState();

  checklist.querySelectorAll('.test-item').forEach(function(li) {
    const idx = parseInt(li.dataset.index, 10);
    const cb = li.querySelector('.test-item-checkbox');
    if (cb) {
      cb.checked = state[idx];
      cb.addEventListener('change', function() {
        const s = getChecklistState();
        s[idx] = cb.checked;
        setChecklistState(s);
        updateSummary();
      });
    }
  });

  document.getElementById('test-reset-btn').addEventListener('click', function() {
    setChecklistState(Array(TEST_COUNT).fill(false));
    checklist.querySelectorAll('.test-item-checkbox').forEach(function(cb) { cb.checked = false; });
    updateSummary();
  });

  updateSummary();
})();
