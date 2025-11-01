// Standalone service for tracking learning progress
// Non-invasive: works independently without modifying existing components

const STORAGE_KEY = 'continueLearning.v1';
const SAVE_THROTTLE_MS = 3000;
const COMPLETE_THRESHOLD = 0.95; // 95% = completed

class ContinueLearningService {
  constructor() {
    this.listeners = new Set();
    this.trackedVideos = new WeakSet();
    this.init();
  }

  init() {
    // Auto-track videos on page load
    if (typeof window !== 'undefined') {
      this.observeVideos();
      // Track page visibility for auto-save on leave
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.saveAllActiveProgress();
      });

      // Bridge: sync legacy SimpleTopicView entries (iframe-based) into our store
      this.syncLegacyPausedModules();
      window.addEventListener('storage', (e) => {
        if (e && (e.key === 'paused_modules' || e.key === 'paused_modules_updated_at')) {
          this.syncLegacyPausedModules();
        }
      });
      // Listen to custom event fired by SimpleTopicView
      window.addEventListener('continue-learning-updated', () => {
        this.syncLegacyPausedModules();
      });
      // Periodic refresh as a fallback
      setInterval(() => this.syncLegacyPausedModules(), 5000);
    }
  }

  // Observe DOM for new video elements (SPA navigation)
  observeVideos() {
    const observer = new MutationObserver(() => {
      document.querySelectorAll('video').forEach(video => {
        if (!this.trackedVideos.has(video)) {
          this.trackVideo(video);
        }
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    // Initial scan
    document.querySelectorAll('video').forEach(video => {
      this.trackVideo(video);
    });
  }

  // Track a single video element
  trackVideo(videoElement) {
    if (!videoElement || this.trackedVideos.has(videoElement)) return;
    this.trackedVideos.add(videoElement);

    const meta = this.extractModuleMeta(videoElement);
    const moduleId = this.buildModuleId(location.pathname, meta.title);
    let lastSave = 0;

    const saveProgress = () => {
      if (!videoElement.duration || !Number.isFinite(videoElement.duration)) return;
      
      const progress = videoElement.currentTime / videoElement.duration;
      
      // Remove if completed
      if (progress >= COMPLETE_THRESHOLD) {
        this.removeModule(moduleId);
        return;
      }

      // Save if not completed
      this.saveModule({
        id: moduleId,
        url: location.pathname + location.search,
        title: meta.title,
        subject: meta.subject,
        class: meta.class,
        progress: Math.round(progress * 100),
        currentTime: videoElement.currentTime,
        duration: videoElement.duration,
        timestamp: Date.now()
      });
    };

    const throttledSave = () => {
      const now = Date.now();
      if (now - lastSave >= SAVE_THROTTLE_MS) {
        lastSave = now;
        saveProgress();
      }
    };

    // Track pause events (main trigger)
    videoElement.addEventListener('pause', saveProgress);
    
    // Track time updates (periodic saves)
    videoElement.addEventListener('timeupdate', throttledSave);
    
    // Track completion
    videoElement.addEventListener('ended', () => {
      this.removeModule(moduleId);
    });

    // Initial save when metadata loads
    videoElement.addEventListener('loadedmetadata', () => {
      if (videoElement.currentTime > 0) {
        saveProgress();
      }
    });
  }

  // Merge entries saved by SimpleTopicView (key: 'paused_modules')
  syncLegacyPausedModules() {
    try {
      const raw = localStorage.getItem('paused_modules') || '[]';
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length === 0) return;

      const current = this.getModules();
      const byId = new Map(current.map(m => [m.id, m]));

      for (const it of arr) {
        const legacyId = `legacy::${it.id || it.title || ''}`;
        const mapped = {
          id: legacyId,
          url: location.pathname + location.search, // fallback; no deep-link provided by legacy
          title: it.title || 'Learning Module',
          subject: it.subject || it.className || 'General',
          class: it.className || '',
          progress: Math.max(1, Math.min(100, Math.round(it.progress || 10))),
          currentTime: 0,
          duration: 0,
          timestamp: Date.now()
        };
        byId.set(legacyId, { ...(byId.get(legacyId) || {}), ...mapped, updatedAt: Date.now() });
      }

      const merged = Array.from(byId.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      this.notifyListeners();
    } catch {}
  }

  // Extract module metadata from DOM
  extractModuleMeta(videoElement) {
    const container = videoElement.closest('[class*="glass"], [class*="card"], main, article') || document.body;
    
    let title = '';
    let subject = '';
    let classInfo = '';

    // Try to find title
    const titleSelectors = ['h1', 'h2', 'h3', '[class*="title"]', '.lesson-title', '.topic-title'];
    for (const sel of titleSelectors) {
      const el = container.querySelector(sel);
      if (el?.textContent?.trim()) {
        title = el.textContent.trim();
        break;
      }
    }

    // Try to find subject
    const subjectSelectors = ['[data-subject]', '[class*="subject"]', '.badge', '.tag'];
    for (const sel of subjectSelectors) {
      const el = container.querySelector(sel);
      if (el?.textContent?.trim()) {
        subject = el.textContent.trim();
        break;
      }
    }

    // Fallback: use page title or URL
    if (!title) title = document.title || 'Learning Module';
    if (!subject) {
      // Try to infer from URL or breadcrumbs
      const pathParts = location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 1) subject = pathParts[pathParts.length - 1];
    }

    return { title, subject, class: classInfo };
  }

  // Build unique module ID
  buildModuleId(path, title) {
    return `${path}::${(title || '').slice(0, 100)}`;
  }

  // Save module progress to localStorage
  saveModule(moduleData) {
    try {
      const items = this.getModules();
      const index = items.findIndex(item => item.id === moduleData.id);
      
      if (index >= 0) {
        items[index] = { ...items[index], ...moduleData, updatedAt: Date.now() };
      } else {
        items.unshift({ ...moduleData, createdAt: Date.now(), updatedAt: Date.now() });
      }

      // Keep only last 20 items
      const trimmed = items.slice(0, 20);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      this.notifyListeners();
    } catch (error) {
      console.warn('Failed to save continue learning progress:', error);
    }
  }

  // Remove completed module
  removeModule(moduleId) {
    try {
      const items = this.getModules().filter(item => item.id !== moduleId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      this.notifyListeners();
    } catch (error) {
      console.warn('Failed to remove module:', error);
    }
  }

  // Get all paused modules
  getModules() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Save all active video progress (on page leave)
  saveAllActiveProgress() {
    document.querySelectorAll('video').forEach(video => {
      if (!video.paused && video.currentTime > 0 && video.duration > 0) {
        const meta = this.extractModuleMeta(video);
        const moduleId = this.buildModuleId(location.pathname, meta.title);
        const progress = video.currentTime / video.duration;
        
        if (progress < COMPLETE_THRESHOLD) {
          this.saveModule({
            id: moduleId,
            url: location.pathname,
            title: meta.title,
            subject: meta.subject,
            progress: Math.round(progress * 100),
            currentTime: video.currentTime,
            duration: video.duration,
            timestamp: Date.now()
          });
        }
      }
    });
  }

  // Resume a module (navigate and seek)
  resumeModule(moduleId) {
    const modules = this.getModules();
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    // Navigate to module URL
    if (module.url && history.pushState) {
      history.pushState({}, '', module.url);
      window.dispatchEvent(new Event('popstate'));
      
      // Wait for video to load, then seek
      setTimeout(() => {
        const video = document.querySelector('video');
        if (video && module.currentTime) {
          video.addEventListener('loadedmetadata', () => {
            video.currentTime = Math.min(module.currentTime, video.duration - 0.5);
            video.play().catch(() => {});
          }, { once: true });
          
          // Fallback if already loaded
          if (video.readyState >= 2) {
            video.currentTime = Math.min(module.currentTime, video.duration - 0.5);
            video.play().catch(() => {});
          }
        }
      }, 800);
    } else if (module.url) {
      window.location.href = module.url;
    }
  }

  // Subscribe to changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getModules());
      } catch (error) {
        console.warn('Listener error:', error);
      }
    });
  }
}

// Singleton instance
const continueLearningService = typeof window !== 'undefined' 
  ? new ContinueLearningService()
  : null;

export default continueLearningService;

