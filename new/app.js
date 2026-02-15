/**
 * Job Notification Tracker — App logic
 */

const STORAGE_KEY = 'jobTrackerSavedIds';
const PREFERENCES_KEY = 'jobTrackerPreferences';
const STATUS_KEY = 'jobTrackerStatus';
const STATUS_HISTORY_KEY = 'jobTrackerStatusHistory';

const JOB_STATUSES = ['Not Applied', 'Applied', 'Rejected', 'Selected'];

const DEFAULT_PREFERENCES = {
  roleKeywords: '',
  preferredLocations: [],
  preferredMode: [],
  experienceLevel: '',
  skills: '',
  minMatchScore: 40
};

function getSavedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveJob(id) {
  const ids = getSavedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    return true;
  }
  return false;
}

function unsaveJob(id) {
  let ids = getSavedIds();
  if (ids.includes(id)) {
    ids = ids.filter(i => i !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    return true;
  }
  return false;
}

function isSaved(id) {
  return getSavedIds().includes(id);
}

function getJobStatus(id) {
  try {
    const raw = localStorage.getItem(STATUS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const s = map[String(id)];
    return JOB_STATUSES.includes(s) ? s : 'Not Applied';
  } catch {
    return 'Not Applied';
  }
}

function setJobStatus(id, status, jobInfo) {
  try {
    const raw = localStorage.getItem(STATUS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[String(id)] = status;
    localStorage.setItem(STATUS_KEY, JSON.stringify(map));
    if (JOB_STATUSES.indexOf(status) > 0 && (status === 'Applied' || status === 'Rejected' || status === 'Selected')) {
      const history = getStatusHistory();
      const title = (jobInfo && jobInfo.title) || (typeof JOBS_DATA !== 'undefined' && JOBS_DATA.find(j => j.id === id)?.title) || '';
      const company = (jobInfo && jobInfo.company) || (typeof JOBS_DATA !== 'undefined' && JOBS_DATA.find(j => j.id === id)?.company) || '';
      history.unshift({
        jobId: id,
        title: title,
        company: company,
        status: status,
        dateChanged: new Date().toISOString()
      });
      localStorage.setItem(STATUS_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    }
    return true;
  } catch {
    return false;
  }
}

function getStatusHistory() {
  try {
    const raw = localStorage.getItem(STATUS_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function showToast(message) {
  const existing = document.getElementById('job-tracker-toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'job-tracker-toast';
  el.className = 'status-toast';
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('status-toast-visible'));
  setTimeout(() => {
    el.classList.remove('status-toast-visible');
    setTimeout(() => el.remove(), 200);
  }, 2000);
}

function getPreferences() {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return {
      roleKeywords: p.roleKeywords ?? '',
      preferredLocations: Array.isArray(p.preferredLocations) ? p.preferredLocations : [],
      preferredMode: Array.isArray(p.preferredMode) ? p.preferredMode : [],
      experienceLevel: p.experienceLevel ?? '',
      skills: p.skills ?? '',
      minMatchScore: typeof p.minMatchScore === 'number' ? Math.max(0, Math.min(100, p.minMatchScore)) : 40
    };
  } catch {
    return null;
  }
}

function savePreferences(prefs) {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    return true;
  } catch {
    return false;
  }
}

function computeMatchScore(job, prefs) {
  if (!prefs) return 0;

  let score = 0;
  const titleLower = (job.title || '').toLowerCase();
  const descLower = (job.description || '').toLowerCase();

  const roleKeywords = (prefs.roleKeywords || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  for (const kw of roleKeywords) {
    if (kw && titleLower.includes(kw)) { score += 25; break; }
  }
  for (const kw of roleKeywords) {
    if (kw && descLower.includes(kw)) { score += 15; break; }
  }

  const prefsLocs = prefs.preferredLocations || [];
  if (prefsLocs.length && prefsLocs.includes(job.location)) score += 15;

  const prefsMode = prefs.preferredMode || [];
  if (prefsMode.length && prefsMode.includes(job.mode)) score += 10;

  if (prefs.experienceLevel && job.experience === prefs.experienceLevel) score += 10;

  const userSkills = (prefs.skills || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  const jobSkills = (job.skills || []).map(s => String(s).toLowerCase());
  if (userSkills.length && jobSkills.some(js => userSkills.includes(js))) score += 15;

  if ((job.postedDaysAgo ?? 999) <= 2) score += 5;
  if (job.source === 'LinkedIn') score += 5;

  return Math.min(100, score);
}

function getMatchScoreBadgeClass(score) {
  if (score >= 80) return 'badge-score-high';
  if (score >= 60) return 'badge-score-medium';
  if (score >= 40) return 'badge-score-neutral';
  return 'badge-score-low';
}

function getStatusSlug(status) {
  const s = String(status || 'Not Applied');
  if (s === 'Applied') return 'applied';
  if (s === 'Rejected') return 'rejected';
  if (s === 'Selected') return 'selected';
  return 'neutral';
}

function formatPostedDays(day) {
  if (day === 0) return 'Today';
  if (day === 1) return '1 day ago';
  return `${day} days ago`;
}

function getTodayDateString() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function getDigestStorageKey(date) {
  return 'jobTrackerDigest_' + date;
}

function getDigestForDate(date) {
  try {
    const raw = localStorage.getItem(getDigestStorageKey(date));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function generateDigestJobs(prefs) {
  if (!prefs || typeof JOBS_DATA === 'undefined') return [];
  const withScore = JOBS_DATA.map(j => {
    const copy = { ...j };
    copy._matchScore = computeMatchScore(j, prefs);
    return copy;
  });
  withScore.sort((a, b) => {
    if ((b._matchScore ?? 0) !== (a._matchScore ?? 0)) return (b._matchScore ?? 0) - (a._matchScore ?? 0);
    return (a.postedDaysAgo ?? 999) - (b.postedDaysAgo ?? 999);
  });
  return withScore.slice(0, 10);
}

function saveDigest(date, jobs) {
  try {
    const payload = jobs.map(j => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      experience: j.experience,
      _matchScore: j._matchScore,
      applyUrl: j.applyUrl
    }));
    localStorage.setItem(getDigestStorageKey(date), JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

function formatDigestAsPlainText(jobs, date) {
  const lines = [
    'Top 10 Jobs For You — 9AM Digest',
    date,
    '',
    '---',
    ''
  ];
  jobs.forEach((j, i) => {
    lines.push((i + 1) + '. ' + (j.title || '') + ' — ' + (j.company || ''));
    lines.push('   Location: ' + (j.location || '') + ' | Experience: ' + (j.experience || '') + ' | Match: ' + (j._matchScore ?? 0) + '%');
    lines.push('   Apply: ' + (j.applyUrl || ''));
    lines.push('');
  });
  lines.push('---');
  lines.push('This digest was generated based on your preferences.');
  return lines.join('\n');
}

function extractSalaryNumber(salaryRange) {
  if (!salaryRange || typeof salaryRange !== 'string') return 0;
  const match = salaryRange.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function filterAndSortJobs(jobs, filters, options = {}) {
  let result = [...jobs];

  if (filters.keyword) {
    const q = filters.keyword.toLowerCase();
    result = result.filter(j =>
      (j.title || '').toLowerCase().includes(q) ||
      (j.company || '').toLowerCase().includes(q)
    );
  }
  if (filters.location) {
    result = result.filter(j => j.location === filters.location);
  }
  if (filters.mode) {
    result = result.filter(j => j.mode === filters.mode);
  }
  if (filters.experience) {
    result = result.filter(j => j.experience === filters.experience);
  }
  if (filters.source) {
    result = result.filter(j => j.source === filters.source);
  }
  if (filters.status) {
    result = result.filter(j => getJobStatus(j.id) === filters.status);
  }

  if (options.filterByMatchScore && options.preferences && typeof options.minMatchScore === 'number') {
    result = result.filter(j => (j._matchScore ?? 0) >= options.minMatchScore);
  }

  const sort = filters.sort || 'latest';
  if (sort === 'latest') {
    result.sort((a, b) => (a.postedDaysAgo ?? 999) - (b.postedDaysAgo ?? 999));
  } else if (sort === 'oldest') {
    result.sort((a, b) => (b.postedDaysAgo ?? -1) - (a.postedDaysAgo ?? -1));
  } else if (sort === 'company') {
    result.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
  } else if (sort === 'match') {
    result.sort((a, b) => (b._matchScore ?? 0) - (a._matchScore ?? 0));
  } else if (sort === 'salary') {
    result.sort((a, b) => extractSalaryNumber(b.salaryRange) - extractSalaryNumber(a.salaryRange));
  }

  return result;
}

function getUniqueValues(jobs, field) {
  const set = new Set(jobs.map(j => j[field]).filter(Boolean));
  return [...set].sort();
}

function renderJobCard(job, options = {}) {
  const { showSave = true, showUnsave = false, showMatchScore = false } = options;
  const saved = isSaved(job.id);
  const matchScore = job._matchScore;
  const scoreBadge = showMatchScore && typeof matchScore === 'number'
    ? `<span class="badge ${getMatchScoreBadgeClass(matchScore)}">${matchScore}% match</span>`
    : '';

  return `
    <div class="job-card card" data-id="${job.id}">
      <div class="job-card-header">
        <h3 class="job-card-title">${escapeHtml(job.title || '')}</h3>
        <span class="job-card-source badge badge-neutral">${escapeHtml(job.source || '')}</span>
      </div>
      ${scoreBadge ? `<div class="job-card-score">${scoreBadge}</div>` : ''}
      <div class="job-card-company">${escapeHtml(job.company)}</div>
      <div class="job-card-meta">
        <span>${escapeHtml(job.location)} · ${escapeHtml(job.mode)}</span>
        <span>${escapeHtml(job.experience)}</span>
      </div>
      <div class="job-card-salary">${escapeHtml(job.salaryRange)}</div>
      <div class="job-card-posted">${formatPostedDays(job.postedDaysAgo)}</div>
      <div class="job-card-status">
        <label class="job-card-status-label">Status:</label>
        <select class="job-status-select badge-status-${getStatusSlug(getJobStatus(job.id))}" data-id="${job.id}">
          ${JOB_STATUSES.map(s => '<option value="' + escapeHtml(s) + '"' + (getJobStatus(job.id) === s ? ' selected' : '') + '>' + escapeHtml(s) + '</option>').join('')}
        </select>
      </div>
      <div class="job-card-actions">
        <button type="button" class="btn btn-secondary btn-sm btn-view" data-id="${job.id}">View</button>
        ${showSave && !saved ? `<button type="button" class="btn btn-secondary btn-sm btn-save" data-id="${job.id}">Save</button>` : ''}
        ${showUnsave || saved ? `<button type="button" class="btn btn-secondary btn-sm btn-unsave" data-id="${job.id}">${showUnsave ? 'Unsave' : 'Saved'}</button>` : ''}
        <a href="${escapeHtml(job.applyUrl)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Apply</a>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  if (text == null || text === '') return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function openJobModal(job) {
  const overlay = document.getElementById('job-modal-overlay');
  const content = document.getElementById('job-modal-content');
  if (!overlay || !content) return;

  content.innerHTML = `
    <h2>${escapeHtml(job.title)}</h2>
    <p class="job-modal-company">${escapeHtml(job.company)}</p>
    <p class="job-modal-description">${escapeHtml(job.description)}</p>
    <div class="job-modal-skills">
      <strong>Skills:</strong> ${job.skills.map(s => escapeHtml(s)).join(', ')}
    </div>
    <button type="button" class="btn btn-primary btn-modal-close">Close</button>
  `;

  overlay.classList.add('modal-visible');

  content.querySelector('.btn-modal-close')?.addEventListener('click', () => {
    overlay.classList.remove('modal-visible');
  });

  overlay.addEventListener('click', function handler(e) {
    if (e.target === overlay) {
      overlay.classList.remove('modal-visible');
      overlay.removeEventListener('click', handler);
    }
  });
}

function initJobCards(container, jobs, options = {}) {
  if (!container) return;

  container.innerHTML = jobs.map(j => renderJobCard(j, options)).join('');

  container.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id, 10);
      const job = typeof JOBS_DATA !== 'undefined' && JOBS_DATA.find(j => j.id === id);
      if (job) openJobModal(job);
    });
  });

  container.querySelectorAll('.btn-save').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id, 10);
      if (saveJob(id)) {
        btn.textContent = 'Saved';
        btn.classList.remove('btn-save');
        btn.classList.add('btn-unsave');
      }
    });
  });

  container.querySelectorAll('.btn-unsave').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id, 10);
      if (unsaveJob(id)) {
        const card = btn.closest('.job-card');
        if (card && options.onUnsave) options.onUnsave(card);
        else {
          btn.textContent = 'Save';
          btn.classList.remove('btn-unsave');
          btn.classList.add('btn-save');
        }
      }
    });
  });

  container.querySelectorAll('.job-status-select').forEach(select => {
    select.addEventListener('change', function() {
      const id = parseInt(this.dataset.id, 10);
      const status = this.value;
      const job = typeof JOBS_DATA !== 'undefined' && JOBS_DATA.find(j => j.id === id);
      if (setJobStatus(id, status, job)) {
        showToast('Status updated: ' + status);
        this.className = 'job-status-select badge-status-' + getStatusSlug(status);
      }
    });
  });
}
