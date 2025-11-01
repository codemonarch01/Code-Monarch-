// ==UserScript==
// @name         Continue Learning Profile Widget (Non-invasive)
// @namespace    ai-ar-3d-elearning
// @version      1.0.0
// @description  Injects a Continue Learning panel on the Profile page using data from localStorage.
// @match        *://*/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'continueLearning.v1';

  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  function createStyles() {
    if (document.getElementById('continue-learning-styles')) return;
    const style = document.createElement('style');
    style.id = 'continue-learning-styles';
    style.textContent = `
      .cl-card { background: #0b1220; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; }
      .cl-header { color: #e5e7eb; font-weight: 600; font-size: 1rem; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:8px; }
      .cl-list { padding: 8px 12px 12px; display: grid; gap: 8px; }
      .cl-item { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; padding: 10px 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; }
      .cl-title { color: #e5e7eb; font-weight: 600; font-size: .95rem; line-height: 1.3; }
      .cl-sub { color: #94a3b8; font-size: .8rem; }
      .cl-meta { color: #a3e635; font-size: .8rem; }
      .cl-actions { display:flex; gap:6px; align-items:center; }
      .cl-btn { background: linear-gradient(90deg, #2563eb, #7c3aed); color: white; border: none; padding: 8px 10px; border-radius: 10px; cursor: pointer; font-weight:600; font-size: .85rem; }
      .cl-btn:hover { filter: brightness(1.05); }
      .cl-empty { color: #94a3b8; text-align:center; padding: 16px; font-size: .9rem; }
    `;
    document.head.appendChild(style);
  }

  function findProfileContainer() {
    // Heuristics: look for a container in Profile page; fallback to main content area
    // Prefer elements containing known headings from the app
    const headings = Array.from(document.querySelectorAll('h1,h2')).map(h => h.textContent?.trim() || '');
    const likelyProfile = headings.some(t => /profile|achievements|eco badges|streak/i.test(t));
    if (!likelyProfile) return null;

    // Seek a large central container
    const containers = document.querySelectorAll('main, .max-w-7xl, .max-w-6xl, .container, .p-6, .p-8, .space-y-6');
    return containers[0] || document.body;
  }

  function renderItem(item) {
    const wrapper = document.createElement('div');
    wrapper.className = 'cl-item';

    const left = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'cl-title';
    title.textContent = item.title || 'Module';
    const sub = document.createElement('div');
    sub.className = 'cl-sub';
    sub.textContent = item.subject || '';
    const meta = document.createElement('div');
    meta.className = 'cl-meta';
    meta.textContent = `${Math.max(0, Math.min(100, item.progress || 0))}% completed`;
    left.appendChild(title);
    if (sub.textContent) left.appendChild(sub);
    left.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'cl-actions';
    const resume = document.createElement('button');
    resume.className = 'cl-btn';
    resume.textContent = '▶ Continue';
    resume.addEventListener('click', () => {
      if (window.ContinueLearning && typeof window.ContinueLearning.resume === 'function') {
        window.ContinueLearning.resume(item.id);
      } else {
        // Fallback: navigate to URL
        if (item.url) location.assign(item.url);
      }
    });
    actions.appendChild(resume);

    wrapper.appendChild(left);
    wrapper.appendChild(actions);
    return wrapper;
  }

  function buildPanel(items) {
    const card = document.createElement('div');
    card.className = 'cl-card';

    const header = document.createElement('div');
    header.className = 'cl-header';
    header.innerHTML = '<span>⏯️</span><span>Continue Learning</span>';
    card.appendChild(header);

    const list = document.createElement('div');
    list.className = 'cl-list';

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'cl-empty';
      empty.textContent = 'No paused modules. Great job!';
      list.appendChild(empty);
    } else {
      items.slice(0, 6).forEach(item => list.appendChild(renderItem(item)));
    }

    card.appendChild(list);
    return card;
  }

  let mounted = null;
  function render() {
    const container = findProfileContainer();
    if (!container) return;
    createStyles();
    const items = readStore();
    const panel = buildPanel(items);
    if (mounted && mounted.isConnected) mounted.remove();
    // Insert near top of container
    container.insertBefore(panel, container.firstChild);
    mounted = panel;
  }

  // Re-render on data changes and route changes
  window.addEventListener('continue-learning:change', render);
  window.addEventListener('continue-learning:page-ready', () => {
    // Only render if we are likely on Profile
    const path = location.pathname.toLowerCase();
    if (/(profile)/.test(path)) render();
  });

  // Observe DOM for profile content load
  const mo = new MutationObserver(() => {
    const path = location.pathname.toLowerCase();
    if (/(profile)/.test(path)) render();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // Initial try
  document.addEventListener('DOMContentLoaded', () => {
    const path = location.pathname.toLowerCase();
    if (/(profile)/.test(path)) render();
  });

})();


