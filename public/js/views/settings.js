// Settings View — Profile, race goal, data export, app settings

const SettingsView = {

    state: {
        profile: null,
        deferredInstallPrompt: null
    },

    async render() {
        const uid = window.currentUser.uid;
        this.state.profile = await DB.getUserProfile(uid) || {};

        return this.renderPage();
    },

    renderPage() {
        const p = this.state.profile;
        const user = window.currentUser;
        const role = window.currentRole;
        const roleLabel = role === 'coach' ? 'Entrenador' : 'Deportista';
        const roleBadge = role === 'coach' ? 'badge-strength' : 'badge-running';

        // Race goal defaults
        const raceDate = p.raceDate || '2026-05-17';
        const raceTime = p.raceGoalTime || '';
        const daysLeft = this.calcDaysLeft(raceDate);
        const daysLeftText = daysLeft > 0 ? `Faltan <strong>${daysLeft} días</strong> para la carrera` : daysLeft === 0 ? '<strong>¡Hoy es el día!</strong>' : 'La carrera ya pasó';

        // Parse goal time
        let goalH = '', goalM = '', goalS = '';
        if (raceTime) {
            const parts = raceTime.split(':');
            if (parts.length === 3) { goalH = parts[0]; goalM = parts[1]; goalS = parts[2]; }
        }

        // Online status
        const isOnline = navigator.onLine;
        const statusDot = isOnline ? 'st-online' : 'st-offline';
        const statusText = isOnline ? 'Conectado' : 'Sin conexión';

        // Pending sync
        const pendingOps = Offline.getQueue().length;
        const pendingText = pendingOps > 0 ? `${pendingOps} operación${pendingOps > 1 ? 'es' : ''} pendiente${pendingOps > 1 ? 's' : ''}` : 'Todo sincronizado';

        return `
        <div class="set-header">
            <h1 class="section-title">Ajustes</h1>
        </div>

        <!-- Profile -->
        <div class="card set-section">
            <div class="set-section-title">
                <span class="set-section-icon">👤</span>
                Perfil
            </div>
            <div class="form-group">
                <label for="set-name">Nombre</label>
                <input type="text" id="set-name" class="form-control" value="${p.name || ''}" placeholder="Tu nombre">
            </div>
            <div class="form-group">
                <label>Email</label>
                <div class="set-readonly">${user.email || '—'}</div>
            </div>
            <div class="form-group">
                <label>Rol</label>
                <div><span class="badge ${roleBadge}">${roleLabel}</span></div>
            </div>
            <button class="btn btn-primary btn-full" id="set-save-profile">Guardar perfil</button>
            <div class="set-save-ok" id="set-profile-ok" style="display:none;">✅ Perfil guardado</div>
        </div>

        <!-- Race goal -->
        <div class="card set-section">
            <div class="set-section-title">
                <span class="set-section-icon">🏁</span>
                Objetivo de carrera
            </div>
            <div class="form-group">
                <label for="set-race-date">Fecha de la carrera</label>
                <input type="date" id="set-race-date" class="form-control" value="${raceDate}">
            </div>
            <div class="form-group">
                <label>Distancia</label>
                <div class="set-readonly">Media Maratón — 21.1 km</div>
            </div>
            <div class="form-group">
                <label>Tiempo objetivo</label>
                <div class="wl-duration-inputs">
                    <div class="wl-duration-field">
                        <input type="number" id="set-goal-h" class="form-control" inputmode="numeric" min="0" max="9" placeholder="HH" value="${goalH}">
                        <span class="wl-duration-label">h</span>
                    </div>
                    <span class="wl-duration-sep">:</span>
                    <div class="wl-duration-field">
                        <input type="number" id="set-goal-m" class="form-control" inputmode="numeric" min="0" max="59" placeholder="MM" value="${goalM}">
                        <span class="wl-duration-label">min</span>
                    </div>
                    <span class="wl-duration-sep">:</span>
                    <div class="wl-duration-field">
                        <input type="number" id="set-goal-s" class="form-control" inputmode="numeric" min="0" max="59" placeholder="SS" value="${goalS}">
                        <span class="wl-duration-label">seg</span>
                    </div>
                </div>
            </div>
            <div class="set-countdown" id="set-countdown">${daysLeftText}</div>
            <button class="btn btn-primary btn-full" id="set-save-goal">Guardar objetivo</button>
            <div class="set-save-ok" id="set-goal-ok" style="display:none;">✅ Objetivo guardado</div>
        </div>

        <!-- Data export -->
        <div class="card set-section">
            <div class="set-section-title">
                <span class="set-section-icon">📦</span>
                Datos
            </div>
            <button class="btn btn-secondary btn-full set-export-btn" id="set-export-logs">
                📥 Exportar historial (JSON)
            </button>
            <button class="btn btn-secondary btn-full set-export-btn" id="set-export-plan">
                📥 Exportar plan (JSON)
            </button>
        </div>

        <!-- App -->
        <div class="card set-section">
            <div class="set-section-title">
                <span class="set-section-icon">📱</span>
                App
            </div>
            <div class="set-app-row">
                <span class="text-sm">Estado de conexión</span>
                <span class="set-status">
                    <span class="set-status-dot ${statusDot}"></span>
                    ${statusText}
                </span>
            </div>
            <div class="set-app-row">
                <span class="text-sm">Sincronización</span>
                <span class="text-sm text-muted" id="set-pending">${pendingText}</span>
            </div>
            <button class="btn btn-secondary btn-full set-export-btn" id="set-sync">
                🔄 Sincronizar datos
            </button>
            <button class="btn btn-secondary btn-full set-export-btn" id="set-install" style="display:none;">
                📲 Instalar app
            </button>
            <div class="set-app-row set-version">
                <span class="text-xs text-muted">RunTracker v1.0.0</span>
            </div>
        </div>

        <!-- Logout -->
        <button class="btn btn-full set-logout-btn" id="set-logout">
            🚪 Cerrar sesión
        </button>`;
    },

    calcDaysLeft(dateStr) {
        const race = Utils.parseDate(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        race.setHours(0, 0, 0, 0);
        return Math.ceil((race - today) / (1000 * 60 * 60 * 24));
    },

    mount() {
        // Save profile
        document.getElementById('set-save-profile')?.addEventListener('click', async () => {
            const name = document.getElementById('set-name').value.trim();
            const uid = window.currentUser.uid;
            await db.ref(`users/${uid}/name`).set(name);
            this.flashSaved('set-profile-ok');
        });

        // Save goal
        document.getElementById('set-save-goal')?.addEventListener('click', async () => {
            const raceDate = document.getElementById('set-race-date').value;
            const h = document.getElementById('set-goal-h').value || '0';
            const m = document.getElementById('set-goal-m').value || '0';
            const s = document.getElementById('set-goal-s').value || '0';
            const raceGoalTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

            const uid = window.currentUser.uid;
            await db.ref(`users/${uid}`).update({ raceDate, raceGoalTime });

            // Update countdown
            const daysLeft = this.calcDaysLeft(raceDate);
            const txt = daysLeft > 0 ? `Faltan <strong>${daysLeft} días</strong> para la carrera` : daysLeft === 0 ? '<strong>¡Hoy es el día!</strong>' : 'La carrera ya pasó';
            document.getElementById('set-countdown').innerHTML = txt;

            this.flashSaved('set-goal-ok');
        });

        // Update countdown on date change
        document.getElementById('set-race-date')?.addEventListener('change', (e) => {
            const daysLeft = this.calcDaysLeft(e.target.value);
            const txt = daysLeft > 0 ? `Faltan <strong>${daysLeft} días</strong> para la carrera` : daysLeft === 0 ? '<strong>¡Hoy es el día!</strong>' : 'La carrera ya pasó';
            document.getElementById('set-countdown').innerHTML = txt;
        });

        // Export logs
        document.getElementById('set-export-logs')?.addEventListener('click', async () => {
            const btn = document.getElementById('set-export-logs');
            btn.disabled = true;
            btn.textContent = 'Exportando...';
            const logs = await DB.getWorkoutLogs(window.currentUser.uid);
            this.downloadJSON(logs || {}, `runtracker_historial_${Utils.formatDate(new Date())}.json`);
            btn.disabled = false;
            btn.textContent = '📥 Exportar historial (JSON)';
        });

        // Export plan
        document.getElementById('set-export-plan')?.addEventListener('click', async () => {
            const btn = document.getElementById('set-export-plan');
            btn.disabled = true;
            btn.textContent = 'Exportando...';
            const plan = await DB.getPlan();
            this.downloadJSON(plan || {}, `runtracker_plan_${Utils.formatDate(new Date())}.json`);
            btn.disabled = false;
            btn.textContent = '📥 Exportar plan (JSON)';
        });

        // Sync
        document.getElementById('set-sync')?.addEventListener('click', async () => {
            const btn = document.getElementById('set-sync');
            btn.disabled = true;
            btn.textContent = '🔄 Sincronizando...';
            await Offline.syncQueue();
            const pending = Offline.getQueue().length;
            document.getElementById('set-pending').textContent = pending > 0 ? `${pending} pendientes` : 'Todo sincronizado';
            btn.disabled = false;
            btn.textContent = '🔄 Sincronizar datos';
        });

        // PWA install
        this.setupInstallButton();

        // Logout
        document.getElementById('set-logout')?.addEventListener('click', () => {
            if (confirm('¿Cerrar sesión?')) {
                logout();
            }
        });
    },

    flashSaved(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 2500);
    },

    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    setupInstallButton() {
        const btn = document.getElementById('set-install');
        if (!btn) return;

        // Check if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return; // Already installed, keep button hidden
        }

        // Use stored deferred prompt or listen for new one
        if (window._deferredInstallPrompt) {
            btn.style.display = '';
            btn.addEventListener('click', async () => {
                window._deferredInstallPrompt.prompt();
                const result = await window._deferredInstallPrompt.userChoice;
                if (result.outcome === 'accepted') {
                    btn.style.display = 'none';
                }
                window._deferredInstallPrompt = null;
            });
        }

        // Also listen for future events
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window._deferredInstallPrompt = e;
            btn.style.display = '';
        });
    }
};

// Capture install prompt globally (before view loads)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window._deferredInstallPrompt = e;
});

// Register with router
Router.registerView('settings', SettingsView);
