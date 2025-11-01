// ==UserScript==
// @name         Continue Learning Overlay (Non-invasive)
// @namespace    ai-ar-3d-elearning
// @version      1.0.0
// @description  Tracks module progress and injects a Continue Learning UI without modifying app code.
// @match        *://*/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Config
  const STORAGE_KEY = 'continueLearning.v1';
  const SAVE_THROTTLE_MS = 5000;
  const COMPLETE_THRESHOLD = 0.95; // 95%

  // Guard: only run on this app's host if desired. Comment out to allow all domains.
  // const allowedHostIncludes = ['localhost', '127.0.0.1', 'vercel.app'];
  // if (!allowedHostIncludes.some(h => location.host.includes(h))) return;

  function nowTs() { return Date.now(); }

  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  function writeStore(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent('continue-learning:change', { detail: items }));
    } catch {}
  }

  function upsertItem(item) {
    const items = readStore();
    const idx = items.findIndex(x => x.id === item.id);
    if (idx >= 0) items[idx] = { ...items[idx], ...item, updatedAt: nowTs() };
    else items.unshift({ ...item, createdAt: nowTs(), updatedAt: nowTs() });
    writeStore(items);
  }

  function removeItem(id) {
    const items = readStore().filter(x => x.id !== id);
    writeStore(items);
  }

  function toPercent(progress, duration) {
    if (!duration || duration <= 0) return 0;
    return Math.max(0, Math.min(1, progress / duration));
  }

  function inferModuleMetaFromDOM(videoEl) {
    // Try to infer a title and subject from nearby elements
    // Heuristics: look upward for headings and labels used in the app
    const container = videoEl.closest('div') || document.body;
    let title = '';
    let subject = '';

    // Title candidates
    const titleSelectors = [
      'h1', 'h2', 'h3',
      '.text-2xl', '.text-xl', '.font-bold', '.lesson-title', '.topic-title'
    ];
    for (const sel of titleSelectors) {
      const el = container.querySelector(sel);
      if (el && el.textContent && el.textContent.trim().length > 3) {
        title = el.textContent.trim();
        break;
      }
    }

    // Subject candidates
    const subjectSelectors = [
      '[data-subject]', '.subject', '.text-slate-600', '.badge', '.chip'
    ];
    for (const sel of subjectSelectors) {
      const el = container.querySelector(sel);
      if (el && el.textContent && el.textContent.trim().length > 2) {
        subject = el.textContent.trim();
        break;
      }
    }

    if (!title) title = document.title || 'Learning Module';

    return { title, subject };
  }

  function buildId(url, title) {
    return `${url || location.pathname}::${(title || '').slice(0, 80)}`;
  }

  // Track <video> elements generically
  function attachVideoTracker(video) {
    if (!video || video.__continueLearningHooked) return;
    video.__continueLearningHooked = true;

    const meta = inferModuleMetaFromDOM(video);
    const baseUrl = location.pathname + location.search + location.hash;
    const id = buildId(baseUrl, meta.title);
    let lastSave = 0;

    function saveProgress() {
      const currentTime = video.currentTime || 0;
      const duration = video.duration || 0;
      const percent = toPercent(currentTime, duration);
      if (!duration || Number.isNaN(duration) || !Number.isFinite(duration)) return;
      upsertItem({
        id,
        url: baseUrl,
        type: 'video',
        title: meta.title,
        subject: meta.subject,
        progress: Math.round(percent * 100),
        currentTime,
        duration
      });
    }

    function maybeSaveThrottled() {
      const t = nowTs();
      if (t - lastSave >= SAVE_THROTTLE_MS) {
        lastSave = t;
        saveProgress();
      }
    }

    function handleEndedOrComplete() {
      removeItem(id);
    }

    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      const percent = toPercent(video.currentTime, video.duration);
      if (percent >= COMPLETE_THRESHOLD) {
        handleEndedOrComplete();
      } else {
        maybeSaveThrottled();
      }
    });

    video.addEventListener('pause', () => {
      saveProgress();
    });

    video.addEventListener('ended', () => {
      handleEndedOrComplete();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) saveProgress();
    });
  }

  // Observe DOM for dynamic videos in SPA
  const observer = new MutationObserver(() => {
    document.querySelectorAll('video').forEach(attachVideoTracker);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Initial hookup
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('video').forEach(attachVideoTracker);
  });

  // Public API for resuming
  window.ContinueLearning = {
    list: () => readStore(),
    remove: (id) => removeItem(id),
    resume: (id) => {
      const items = readStore();
      const it = items.find(x => x.id === id);
      if (!it) return;
      const goto = it.url || location.pathname;
      // Navigate, then seek after load.
      const targetTime = it.currentTime || 0;
      function trySeek() {
        const v = document.querySelector('video');
        if (v && v.duration) {
          v.currentTime = Math.min(targetTime, v.duration - 0.25);
          v.play().catch(() => {});
          window.removeEventListener('continue-learning:page-ready', trySeek);
          setTimeout(trySeek, 800); // retry a bit in case source swaps
        }
      }
      window.addEventListener('continue-learning:page-ready', trySeek);
      // For SPAs, pushState may be used; fallback to location change
      if (history.pushState && goto.startsWith('/')) {
        history.pushState({}, '', goto);
        window.dispatchEvent(new Event('popstate'));
        // Signal page ready after a short delay for SPA renders
        setTimeout(() => window.dispatchEvent(new Event('continue-learning:page-ready')), 600);
      } else {
        location.assign(goto);
        // On reload, DOMContentLoaded will trigger initial hookup
        setTimeout(() => window.dispatchEvent(new Event('continue-learning:page-ready')), 1200);
      }
    }
  };

  // Fire a ready signal occasionally when route changes in SPA
  const origPushState = history.pushState;
  history.pushState = function () {
    const r = origPushState.apply(this, arguments);
    setTimeout(() => window.dispatchEvent(new Event('continue-learning:page-ready')), 500);
    return r;
  };
  window.addEventListener('popstate', () => {
    setTimeout(() => window.dispatchEvent(new Event('continue-learning:page-ready')), 500);
  });

})();


