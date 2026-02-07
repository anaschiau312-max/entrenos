// Offline management for RunTracker PWA

const Offline = {
    QUEUE_KEY: 'rt_sync_queue',

    // --- Cache read/write ---

    getCache(key) {
        try {
            const raw = localStorage.getItem(`rt_${key}`);
            if (!raw) return null;
            const { data, ts } = JSON.parse(raw);
            return data;
        } catch (e) {
            return null;
        }
    },

    setCache(key, data) {
        try {
            localStorage.setItem(`rt_${key}`, JSON.stringify({
                data,
                ts: Date.now()
            }));
        } catch (e) {
            // localStorage full — remove oldest entries
            this.pruneCache();
            try {
                localStorage.setItem(`rt_${key}`, JSON.stringify({ data, ts: Date.now() }));
            } catch (e2) {
                console.warn('Cache write failed:', e2);
            }
        }
    },

    removeCache(key) {
        localStorage.removeItem(`rt_${key}`);
    },

    pruneCache() {
        const entries = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('rt_')) {
                try {
                    const { ts } = JSON.parse(localStorage.getItem(key));
                    entries.push({ key, ts });
                } catch (e) {
                    entries.push({ key, ts: 0 });
                }
            }
        }
        // Remove oldest half
        entries.sort((a, b) => a.ts - b.ts);
        const toRemove = Math.ceil(entries.length / 2);
        for (let i = 0; i < toRemove; i++) {
            localStorage.removeItem(entries[i].key);
        }
    },

    // --- Fetch with cache fallback ---

    async fetch(refPath, cacheKey) {
        try {
            const snapshot = await db.ref(refPath).once('value');
            const data = snapshot.val();
            if (data !== null) {
                this.setCache(cacheKey, data);
            }
            return data;
        } catch (error) {
            console.warn(`Offline fallback for ${cacheKey}:`, error.message);
            return this.getCache(cacheKey);
        }
    },

    // --- Sync Queue (offline writes) ---

    getQueue() {
        try {
            return JSON.parse(localStorage.getItem(this.QUEUE_KEY)) || [];
        } catch (e) {
            return [];
        }
    },

    addToQueue(operation) {
        const queue = this.getQueue();
        queue.push({
            ...operation,
            timestamp: Date.now(),
            id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        });
        localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    },

    async syncQueue() {
        const queue = this.getQueue();
        if (queue.length === 0) return;

        const failed = [];

        for (const op of queue) {
            try {
                switch (op.type) {
                    case 'set':
                        await db.ref(op.path).set(op.data);
                        break;
                    case 'update':
                        await db.ref(op.path).update(op.data);
                        break;
                    case 'push':
                        await db.ref(op.path).push(op.data);
                        break;
                    case 'remove':
                        await db.ref(op.path).remove();
                        break;
                }
            } catch (error) {
                console.error('Sync failed for operation:', op.id, error);
                failed.push(op);
            }
        }

        localStorage.setItem(this.QUEUE_KEY, JSON.stringify(failed));

        if (failed.length === 0) {
            console.log('Sync queue processed successfully');
        } else {
            console.warn(`${failed.length} operations still pending`);
        }
    },

    // --- Write with offline fallback ---

    async write(refPath, data, method = 'set') {
        try {
            if (method === 'set') {
                await db.ref(refPath).set(data);
            } else if (method === 'update') {
                await db.ref(refPath).update(data);
            } else if (method === 'push') {
                const ref = await db.ref(refPath).push(data);
                return ref.key;
            }
            return true;
        } catch (error) {
            console.warn('Write failed, queuing for sync:', error.message);
            this.addToQueue({ type: method, path: refPath, data });
            return false;
        }
    },

    // --- Online/Offline Status ---

    isOnline() {
        return navigator.onLine;
    },

    init() {
        // Show/hide offline indicator
        const showBanner = () => {
            let indicator = document.getElementById('offline-indicator');
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'offline-indicator';
                indicator.style.cssText = `
                    position: fixed; top: 56px; left: 0; right: 0;
                    background: linear-gradient(135deg, #FF9800, #F57C00);
                    color: #000; text-align: center;
                    padding: 6px 12px; font-size: 12px; font-weight: 600;
                    z-index: 200; display: flex; align-items: center;
                    justify-content: center; gap: 6px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                `;
                indicator.innerHTML = '<span style="font-size:14px">&#9889;</span> Sin conexión — usando datos locales';
                document.body.appendChild(indicator);
            }
        };

        const hideBanner = () => {
            const indicator = document.getElementById('offline-indicator');
            if (indicator) indicator.remove();
        };

        const showSyncBanner = () => {
            let syncBanner = document.getElementById('sync-indicator');
            if (!syncBanner) {
                syncBanner = document.createElement('div');
                syncBanner.id = 'sync-indicator';
                syncBanner.style.cssText = `
                    position: fixed; top: 56px; left: 0; right: 0;
                    background: linear-gradient(135deg, #4CAF50, #388E3C);
                    color: #fff; text-align: center;
                    padding: 6px 12px; font-size: 12px; font-weight: 600;
                    z-index: 200; transition: opacity 0.5s;
                `;
                syncBanner.textContent = 'Conexión restaurada — sincronizando...';
                document.body.appendChild(syncBanner);
            }
            setTimeout(() => {
                syncBanner.style.opacity = '0';
                setTimeout(() => syncBanner.remove(), 500);
            }, 3000);
        };

        window.addEventListener('online', () => {
            hideBanner();
            const queue = this.getQueue();
            if (queue.length > 0) {
                showSyncBanner();
            }
            this.syncQueue();
        });

        window.addEventListener('offline', showBanner);

        if (!navigator.onLine) showBanner();

        // Sync pending queue on load if online
        if (navigator.onLine) {
            this.syncQueue();
        }
    }
};
