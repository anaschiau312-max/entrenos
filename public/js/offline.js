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
        const updateIndicator = () => {
            let indicator = document.getElementById('offline-indicator');
            if (!navigator.onLine) {
                if (!indicator) {
                    indicator = document.createElement('div');
                    indicator.id = 'offline-indicator';
                    indicator.style.cssText = 'position:fixed;top:56px;left:0;right:0;background:#FF9800;color:#000;text-align:center;padding:4px;font-size:12px;font-weight:600;z-index:200;';
                    indicator.textContent = 'Sin conexión — los cambios se guardarán localmente';
                    document.body.appendChild(indicator);
                }
            } else {
                if (indicator) indicator.remove();
            }
        };

        window.addEventListener('online', () => {
            updateIndicator();
            this.syncQueue();
        });

        window.addEventListener('offline', updateIndicator);

        updateIndicator();

        // Sync pending queue on load if online
        if (navigator.onLine) {
            this.syncQueue();
        }
    }
};
