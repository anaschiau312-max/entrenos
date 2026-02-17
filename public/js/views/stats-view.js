// Stats View — Complete statistics dashboard with projections

const StatsView = {

    state: {
        logs: null,
        plan: null,
        phases: null,
        projections: null,
        period: 'all',
        sessionType: 'all',
        charts: [],
        currentWeekNum: null
    },

    async render() {
        const s = this.state;
        const [logs, plan, phases, projections] = await Promise.all([
            DB.getWorkoutLogs(window.currentUser.uid),
            DB.getPlan(),
            DB.getPhases(),
            db.ref('plan/projections').once('value').then(snap => snap.val())
        ]);
        s.logs = logs || {};
        s.plan = plan;
        s.phases = phases || {};
        s.projections = projections || {};
        s.charts = [];

        // Get current plan week
        const currentWeek = await DB.getCurrentWeek();
        s.currentWeekNum = currentWeek ? currentWeek.weekNumber : 5;

        return this.renderPage();
    },

    // Get week number from log.weekId like "week_04"
    getWeekNumFromLog(log) {
        if (log.weekId) {
            const match = log.weekId.match(/week_(\d+)/);
            if (match) return parseInt(match[1], 10);
        }
        return null;
    },

    getFilteredLogs() {
        const s = this.state;
        // Include logId in each log object
        let logs = Object.entries(s.logs).map(([logId, log]) => ({ ...log, logId }));

        if (s.period !== 'all') {
            const now = new Date();
            let cutoff;
            if (s.period === 'month') {
                cutoff = new Date(now);
                cutoff.setMonth(cutoff.getMonth() - 1);
            } else if (s.period === '4weeks') {
                cutoff = Utils.addDays(now, -28);
            }
            const cutoffStr = Utils.formatDate(cutoff);
            logs = logs.filter(l => l.date >= cutoffStr);
        }

        if (s.sessionType !== 'all') {
            logs = logs.filter(l => l.sessionType === s.sessionType);
        }

        return logs;
    },

    getRunningLogs(logs) {
        return logs
            .filter(l => l.sessionType === 'running' && l.actual)
            .sort((a, b) => a.date.localeCompare(b.date));
    },

    getStrengthLowerLogs(logs) {
        return logs
            .filter(l => l.sessionType === 'strength_lower' && l.actual)
            .sort((a, b) => a.date.localeCompare(b.date));
    },

    getStrengthUpperLogs(logs) {
        return logs
            .filter(l => l.sessionType === 'strength_upper' && l.actual)
            .sort((a, b) => a.date.localeCompare(b.date));
    },

    calcTotals() {
        const s = this.state;
        const allLogs = Object.values(s.logs);
        const runLogs = this.getRunningLogs(allLogs);
        const strengthLowerLogs = this.getStrengthLowerLogs(allLogs);
        const strengthUpperLogs = this.getStrengthUpperLogs(allLogs);
        const proj = s.projections || {};
        const currentWeek = s.currentWeekNum || 5;

        // Calculate totals from logs
        let totalKm = 0;
        let totalRunMinutes = 0;
        let runSessions = 0;
        let longRunMax = 0;
        let totalCalories = 0;

        for (const log of runLogs) {
            const a = log.actual;
            if (a.distance_km) totalKm += a.distance_km;
            if (a.calories) totalCalories += a.calories;
            if (a.duration) {
                const parts = a.duration.split(':').map(Number);
                if (parts.length === 3) totalRunMinutes += parts[0] * 60 + parts[1] + parts[2] / 60;
                else if (parts.length === 2) totalRunMinutes += parts[0] + parts[1] / 60;
            }
            runSessions++;
            // Check for long runs - track max distance
            if (a.distance_km && a.distance_km > longRunMax) {
                longRunMax = a.distance_km;
            }
        }

        const strengthLowerSessions = strengthLowerLogs.length;
        const strengthUpperSessions = strengthUpperLogs.length;
        const totalSessions = runSessions + strengthLowerSessions + strengthUpperSessions;

        // Projected totals
        const projTotals = proj.projectedTotals || {};
        const projKm = projTotals.runningDistanceKm || 370;
        const projRunSessions = projTotals.runningSessions || 57;
        const projStrengthLower = projTotals.strengthLowerSessions || 30;
        const projStrengthUpper = projTotals.strengthUpperSessions || 12;
        const projTotalSessions = projTotals.totalSessions || 99;
        const projMinutes = projTotals.runningTimeMinutes || 2760;

        // Pace calculation
        let bestPaceSeconds = Infinity;
        let bestPace = null;
        for (const log of runLogs) {
            const a = log.actual;
            if (a.pace_avg) {
                const ps = Utils.paceToSeconds(a.pace_avg);
                if (ps > 0 && ps < bestPaceSeconds) {
                    bestPaceSeconds = ps;
                    bestPace = a.pace_avg;
                }
            }
        }

        // Days until race
        const raceDate = new Date('2026-05-10');
        const today = new Date();
        const daysUntilRace = Math.ceil((raceDate - today) / (1000 * 60 * 60 * 24));

        // Remaining sessions
        const runRemaining = projRunSessions - runSessions;
        const strengthLowerRemaining = projStrengthLower - strengthLowerSessions;
        const strengthUpperRemaining = projStrengthUpper - strengthUpperSessions;

        return {
            totalKm: Math.round(totalKm * 10) / 10,
            projKm,
            kmPct: Math.min(100, Math.round((totalKm / projKm) * 100)),

            runSessions,
            projRunSessions,
            runPct: Math.min(100, Math.round((runSessions / projRunSessions) * 100)),
            runRemaining: Math.max(0, runRemaining),

            strengthLowerSessions,
            projStrengthLower,
            strengthLowerPct: Math.min(100, Math.round((strengthLowerSessions / projStrengthLower) * 100)),
            strengthLowerRemaining: Math.max(0, strengthLowerRemaining),

            strengthUpperSessions,
            projStrengthUpper,
            strengthUpperPct: Math.min(100, Math.round((strengthUpperSessions / projStrengthUpper) * 100)),
            strengthUpperRemaining: Math.max(0, strengthUpperRemaining),

            strengthSessions: strengthLowerSessions + strengthUpperSessions,

            totalSessions,
            projTotalSessions,
            totalSessionsPct: Math.min(100, Math.round((totalSessions / projTotalSessions) * 100)),

            totalMinutes: Math.round(totalRunMinutes),
            projMinutes,
            timePct: Math.min(100, Math.round((totalRunMinutes / projMinutes) * 100)),

            totalHours: Math.floor(totalRunMinutes / 60),
            totalMins: Math.round(totalRunMinutes % 60),
            projHours: Math.floor(projMinutes / 60),

            currentWeek,
            totalWeeks: proj.totalWeeks || 17,
            weekPct: Math.round((currentWeek / (proj.totalWeeks || 17)) * 100),

            daysUntilRace,
            bestPace,
            longRunMax: Math.round(longRunMax * 10) / 10,
            totalCalories
        };
    },

    renderPage() {
        const logs = this.getFilteredLogs();
        const allLogs = Object.values(this.state.logs);
        const runLogs = this.getRunningLogs(allLogs);
        const totals = this.calcTotals();

        // Countdown header with progress bar
        let html = `
        <div class="st-countdown-banner">
            <div class="st-countdown-main">
                <div class="st-countdown-icon">🏃‍♀️</div>
                <div class="st-countdown-content">
                    <div class="st-countdown-days">${totals.daysUntilRace}</div>
                    <div class="st-countdown-label">días para la Media Maratón</div>
                </div>
            </div>
            <div class="st-countdown-date">🎯 10 de mayo de 2026</div>
            <div class="st-countdown-progress">
                <div class="st-countdown-progress-bar">
                    <div class="st-countdown-progress-fill" style="width: ${totals.weekPct}%"></div>
                </div>
                <div class="st-countdown-progress-label">Semana ${totals.currentWeek} de ${totals.totalWeeks}</div>
            </div>
        </div>`;

        // Quick stats row
        html += `
        <div class="st-quick-stats">
            <div class="st-quick-stat">
                <div class="st-quick-value">${totals.totalKm}</div>
                <div class="st-quick-label">km</div>
            </div>
            <div class="st-quick-stat">
                <div class="st-quick-value">${totals.runSessions}</div>
                <div class="st-quick-label">carreras</div>
            </div>
            <div class="st-quick-stat">
                <div class="st-quick-value">${totals.strengthSessions}</div>
                <div class="st-quick-label">fuerza</div>
            </div>
            <div class="st-quick-stat">
                <div class="st-quick-value">S${totals.currentWeek}</div>
                <div class="st-quick-label">de ${totals.totalWeeks}</div>
            </div>
        </div>`;

        // Progress panel
        html += `
        <div class="card st-progress-panel">
            <div class="card-header"><span class="card-title">Progreso del plan</span></div>
            <div class="st-progress-grid">
                ${this.renderProgressBar('Distancia', totals.totalKm, totals.projKm, 'km', totals.kmPct, '#e94560')}
                ${this.renderProgressBar('Carreras', totals.runSessions, totals.projRunSessions, '', totals.runPct, '#4CAF50')}
                ${this.renderProgressBar('Fuerza inferior', totals.strengthLowerSessions, totals.projStrengthLower, '', totals.strengthLowerPct, '#FF9800')}
                ${this.renderProgressBar('Fuerza superior', totals.strengthUpperSessions, totals.projStrengthUpper, '', totals.strengthUpperPct, '#9C27B0')}
                ${this.renderProgressBar('Total sesiones', totals.totalSessions, totals.projTotalSessions, '', totals.totalSessionsPct, '#2196F3')}
                ${this.renderProgressBar('Tiempo', `${totals.totalHours}h ${totals.totalMins}m`, `${totals.projHours}h`, '', totals.timePct, '#00BCD4')}
                ${this.renderProgressBar('Semanas', totals.currentWeek, totals.totalWeeks, '', totals.weekPct, '#607D8B')}
            </div>
        </div>`;

        // Remaining sessions widget
        html += `
        <div class="st-remaining-widget">
            <div class="st-remaining-item">
                <span class="st-remaining-icon">🏃</span>
                <span class="st-remaining-count">${totals.runRemaining}</span>
                <span class="st-remaining-label">carreras restantes</span>
            </div>
            <div class="st-remaining-item">
                <span class="st-remaining-icon">🦵</span>
                <span class="st-remaining-count">${totals.strengthLowerRemaining}</span>
                <span class="st-remaining-label">fuerza inf.</span>
            </div>
            <div class="st-remaining-item">
                <span class="st-remaining-icon">💪</span>
                <span class="st-remaining-count">${totals.strengthUpperRemaining}</span>
                <span class="st-remaining-label">fuerza sup.</span>
            </div>
        </div>`;

        // Best metrics row
        if (totals.bestPace || totals.longRunMax) {
            html += `
            <div class="st-best-metrics">
                ${totals.bestPace ? `
                <div class="st-best-metric card">
                    <div class="st-best-icon">⚡</div>
                    <div class="st-best-content">
                        <div class="st-best-value">${totals.bestPace}</div>
                        <div class="st-best-label">Mejor ritmo (min/km)</div>
                    </div>
                </div>` : ''}
                ${totals.longRunMax ? `
                <div class="st-best-metric card">
                    <div class="st-best-icon">🏆</div>
                    <div class="st-best-content">
                        <div class="st-best-value">${totals.longRunMax} km</div>
                        <div class="st-best-label">Tirada larga máx</div>
                    </div>
                </div>` : ''}
            </div>`;
        }

        // Charts section header
        html += `
        <div class="st-section-header">
            <h2 class="st-section-title">Evolución semanal</h2>
        </div>`;

        // Weekly volume chart (completed vs projected)
        html += `
        <div class="card st-chart-card">
            <div class="card-header"><span class="card-title">Volumen semanal (minutos)</span></div>
            <div class="st-chart-container"><canvas id="st-chart-volume"></canvas></div>
        </div>`;

        // Weekly distance chart
        html += `
        <div class="card st-chart-card">
            <div class="card-header"><span class="card-title">Distancia semanal (km)</span></div>
            <div class="st-chart-container"><canvas id="st-chart-distance"></canvas></div>
        </div>`;

        // Long run progression
        html += `
        <div class="card st-chart-card">
            <div class="card-header"><span class="card-title">Tirada larga (minutos)</span></div>
            <div class="st-chart-container"><canvas id="st-chart-longrun"></canvas></div>
        </div>`;

        // Pace evolution
        if (runLogs.length > 0) {
            html += `
            <div class="card st-chart-card">
                <div class="card-header"><span class="card-title">Ritmo medio</span></div>
                <div class="st-chart-container"><canvas id="st-chart-pace"></canvas></div>
            </div>`;
        }

        // Adherence chart
        html += `
        <div class="card st-chart-card">
            <div class="card-header"><span class="card-title">Adherencia al plan (%)</span></div>
            <div class="st-chart-container"><canvas id="st-chart-adherence"></canvas></div>
        </div>`;

        // Filters
        const periods = [
            { key: '4weeks', label: '4 sem' },
            { key: 'month', label: 'Mes' },
            { key: 'all', label: 'Todo' }
        ];
        let periodHtml = periods.map(p =>
            `<button class="st-filter-btn ${p.key === this.state.period ? 'active' : ''}" data-period="${p.key}">${p.label}</button>`
        ).join('');

        html += `
        <div class="st-section-header">
            <h2 class="st-section-title">Historial</h2>
            <div class="st-filter-group">${periodHtml}</div>
        </div>`;

        // History table
        html += this.renderHistoryTable(logs);

        return html;
    },

    renderProgressBar(label, current, target, unit, pct, color) {
        return `
        <div class="st-progress-item">
            <div class="st-progress-header">
                <span class="st-progress-label">${label}</span>
                <span class="st-progress-values">${current} / ${target} ${unit}</span>
            </div>
            <div class="st-progress-bar">
                <div class="st-progress-fill" style="width: ${pct}%; background: ${color}"></div>
            </div>
            <div class="st-progress-pct">${pct}%</div>
        </div>`;
    },

    renderHistoryTable(logs) {
        const sorted = [...logs]
            .filter(l => l.actual)
            .sort((a, b) => b.date.localeCompare(a.date));

        if (sorted.length === 0) {
            return `
            <div class="empty-state mt-16">
                <div class="empty-state-icon">📊</div>
                <p class="empty-state-text">No hay registros para este periodo.</p>
            </div>`;
        }

        const feelingMap = {
            muy_duro: '😫', normal: '😐', bien: '😊', genial: '😁', increible: '🔥'
        };

        const typeIcons = {
            running: '🏃', cycling: '🚴', strength: '💪',
            strength_upper: '💪', strength_lower: '🦵'
        };

        let rowsHtml = '';
        for (const log of sorted.slice(0, 20)) {
            const a = log.actual;
            const type = log.sessionType || 'running';
            const typeIcon = typeIcons[type] || '🏃';

            let dist = '—', dur = '—', pace = '—';

            if (type === 'running') {
                dist = a.distance_km ? `${a.distance_km} km` : '—';
                dur = a.duration || '—';
                pace = a.pace_avg || '—';
            } else {
                dur = a.duration || '—';
            }
            const feel = log.feeling ? (feelingMap[log.feeling] || '') : '';

            const dateObj = Utils.parseDate(log.date);
            const dayShort = Utils.getDayShort(dateObj);
            const dateDisplay = `${dayShort} ${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

            rowsHtml += `
            <tr class="st-history-row" data-log-id="${log.logId}">
                <td class="st-td-date">${dateDisplay}</td>
                <td>${typeIcon}</td>
                <td>${dist}</td>
                <td>${dur}</td>
                <td>${pace}</td>
                <td>${feel}</td>
                <td class="st-td-actions">
                    <button class="st-delete-btn" data-log-id="${log.logId}" data-log-date="${dateDisplay}" title="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>
                        </svg>
                    </button>
                </td>
            </tr>`;
        }

        return `
        <div class="card st-history-card">
            <div class="st-table-scroll">
                <table class="st-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th></th>
                            <th>Dist.</th>
                            <th>Dur.</th>
                            <th>Ritmo</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>
        </div>

        <!-- Delete confirmation modal -->
        <div class="st-delete-modal" id="st-delete-modal" style="display:none;">
            <div class="st-delete-modal-content">
                <div class="st-delete-modal-icon">🗑️</div>
                <h3 class="st-delete-modal-title">Eliminar sesion</h3>
                <p class="st-delete-modal-text" id="st-delete-modal-text"></p>
                <div class="st-delete-modal-buttons">
                    <button class="btn btn-secondary" id="st-delete-cancel">Cancelar</button>
                    <button class="btn btn-danger" id="st-delete-confirm">Eliminar</button>
                </div>
            </div>
        </div>`;
    },

    mount() {
        // Period filter
        document.querySelectorAll('.st-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.state.period = e.currentTarget.dataset.period;
                this.destroyCharts();
                const container = document.getElementById('main-content').querySelector('.view-container');
                container.innerHTML = this.renderPage();
                this.mount();
            });
        });

        // Delete buttons
        this.pendingDeleteLogId = null;
        document.querySelectorAll('.st-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const logId = btn.dataset.logId;
                const logDate = btn.dataset.logDate;
                this.showDeleteModal(logId, logDate);
            });
        });

        // Delete modal buttons
        const cancelBtn = document.getElementById('st-delete-cancel');
        const confirmBtn = document.getElementById('st-delete-confirm');
        const modal = document.getElementById('st-delete-modal');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideDeleteModal());
        }
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmDelete());
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideDeleteModal();
            });
        }

        this.buildCharts();
    },

    showDeleteModal(logId, logDate) {
        this.pendingDeleteLogId = logId;
        const modal = document.getElementById('st-delete-modal');
        const text = document.getElementById('st-delete-modal-text');
        if (modal && text) {
            text.textContent = `¿Eliminar la sesion del ${logDate}? Esta accion no se puede deshacer.`;
            modal.style.display = 'flex';
        }
    },

    hideDeleteModal() {
        this.pendingDeleteLogId = null;
        const modal = document.getElementById('st-delete-modal');
        if (modal) modal.style.display = 'none';
    },

    async confirmDelete() {
        if (!this.pendingDeleteLogId) return;

        const logId = this.pendingDeleteLogId;
        const confirmBtn = document.getElementById('st-delete-confirm');

        // Show loading
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Eliminando...';
        }

        try {
            // Delete from Firebase
            const uid = window.currentUser.uid;
            await db.ref(`workoutLogs/${uid}/${logId}`).remove();

            // Remove from local state
            delete this.state.logs[logId];

            // Update local cache
            Offline.removeCache(`workoutLogs_${uid}`);

            // Hide modal and refresh view
            this.hideDeleteModal();
            this.destroyCharts();
            const container = document.getElementById('main-content').querySelector('.view-container');
            container.innerHTML = this.renderPage();
            this.mount();

        } catch (error) {
            console.error('Error deleting log:', error);
            alert('Error al eliminar la sesion. Intentalo de nuevo.');
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Eliminar';
            }
        }
    },

    destroyCharts() {
        for (const c of this.state.charts) {
            try { c.destroy(); } catch (e) {}
        }
        this.state.charts = [];
    },

    darkThemeDefaults() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: '#a0a0b0', boxWidth: 12, padding: 15 }
                },
                tooltip: {
                    backgroundColor: '#16213e',
                    titleColor: '#fff',
                    bodyColor: '#a0a0b0',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 10
                }
            },
            scales: {
                x: {
                    ticks: { color: '#a0a0b0', font: { size: 11 } },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                },
                y: {
                    ticks: { color: '#a0a0b0', font: { size: 11 } },
                    grid: { color: 'rgba(255,255,255,0.06)' },
                    beginAtZero: true
                }
            }
        };
    },

    buildCharts() {
        if (typeof Chart === 'undefined') return;

        this.buildVolumeChart();
        this.buildDistanceChart();
        this.buildLongRunChart();
        this.buildPaceChart();
        this.buildAdherenceChart();
    },

    // Group logs by week number
    groupLogsByWeek(logs, type = 'running') {
        const weekData = {};
        const filtered = type === 'running'
            ? logs.filter(l => l.sessionType === 'running' && l.actual)
            : logs.filter(l => l.actual);

        for (const log of filtered) {
            const wn = this.getWeekNumFromLog(log);
            if (!wn) continue;
            if (!weekData[wn]) weekData[wn] = { km: 0, minutes: 0, sessions: 0 };

            const a = log.actual;
            if (a.distance_km) weekData[wn].km += a.distance_km;
            if (a.duration) {
                const parts = a.duration.split(':').map(Number);
                if (parts.length === 3) {
                    weekData[wn].minutes += parts[0] * 60 + parts[1] + parts[2] / 60;
                } else if (parts.length === 2) {
                    weekData[wn].minutes += parts[0] + parts[1] / 60;
                }
            }
            weekData[wn].sessions++;
        }
        return weekData;
    },

    buildVolumeChart() {
        const canvas = document.getElementById('st-chart-volume');
        if (!canvas) return;

        const allLogs = Object.values(this.state.logs);
        const weekData = this.groupLogsByWeek(allLogs);
        const proj = this.state.projections.weeklyProjections || {};
        const currentWeek = this.state.currentWeekNum || 5;

        // Build data for all weeks 1-17
        const weeks = [];
        for (let w = 1; w <= 17; w++) weeks.push(w);

        const completedData = weeks.map(w => weekData[w] ? Math.round(weekData[w].minutes) : (w <= currentWeek ? 0 : null));
        const projectedData = weeks.map(w => {
            const wp = proj[`week_${String(w).padStart(2, '0')}`];
            return wp ? wp.volumeMin : 0;
        });

        const defaults = this.darkThemeDefaults();
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: weeks.map(w => `S${w}`),
                datasets: [
                    {
                        label: 'Completado',
                        data: completedData,
                        backgroundColor: weeks.map(w => w === currentWeek ? '#e94560' : 'rgba(76, 175, 80, 0.7)'),
                        borderColor: weeks.map(w => w === currentWeek ? '#e94560' : '#4CAF50'),
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Proyectado',
                        data: projectedData,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                ...defaults,
                plugins: {
                    ...defaults.plugins,
                    tooltip: {
                        ...defaults.plugins.tooltip,
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y || 0} min`
                        }
                    }
                }
            }
        });
        this.state.charts.push(chart);
    },

    buildDistanceChart() {
        const canvas = document.getElementById('st-chart-distance');
        if (!canvas) return;

        const allLogs = Object.values(this.state.logs);
        const weekData = this.groupLogsByWeek(allLogs);
        const currentWeek = this.state.currentWeekNum || 5;

        // Build data for weeks with data
        const weeksWithData = Object.keys(weekData).map(Number).sort((a, b) => a - b);
        if (weeksWithData.length === 0) {
            canvas.parentElement.parentElement.style.display = 'none';
            return;
        }

        const phaseColors = {};
        if (this.state.phases) {
            for (const [, phase] of Object.entries(this.state.phases)) {
                if (phase.weeks) {
                    for (const wn of phase.weeks) {
                        phaseColors[wn] = phase.color;
                    }
                }
            }
        }

        const labels = weeksWithData.map(w => `S${w}`);
        const data = weeksWithData.map(w => Math.round(weekData[w].km * 10) / 10);
        const bgColors = weeksWithData.map(w => {
            if (w === currentWeek) return '#e94560';
            return phaseColors[w] ? phaseColors[w] + 'aa' : 'rgba(76, 175, 80, 0.7)';
        });

        const defaults = this.darkThemeDefaults();
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'km',
                    data,
                    backgroundColor: bgColors,
                    borderRadius: 4
                }]
            },
            options: {
                ...defaults,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        ...defaults.plugins.tooltip,
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.y} km`
                        }
                    }
                }
            }
        });
        this.state.charts.push(chart);
    },

    buildLongRunChart() {
        const canvas = document.getElementById('st-chart-longrun');
        if (!canvas) return;

        const proj = this.state.projections.weeklyProjections || {};
        const currentWeek = this.state.currentWeekNum || 5;

        // Find the LONGEST running session of each week (not just "tirada")
        const allLogs = Object.values(this.state.logs);
        const longRuns = {};
        for (const log of allLogs) {
            if (log.sessionType !== 'running' || !log.actual) continue;
            const wn = this.getWeekNumFromLog(log);
            if (wn && log.actual.duration) {
                const parts = log.actual.duration.split(':').map(Number);
                let mins = 0;
                if (parts.length === 3) mins = parts[0] * 60 + parts[1];
                else if (parts.length === 2) mins = parts[0];
                if (!longRuns[wn] || mins > longRuns[wn]) {
                    longRuns[wn] = mins;
                }
            }
        }

        // Build data for all weeks
        const weeks = [];
        for (let w = 1; w <= 17; w++) weeks.push(w);

        const completedData = weeks.map(w => longRuns[w] || (w <= currentWeek ? 0 : null));
        const projectedData = weeks.map(w => {
            const wp = proj[`week_${String(w).padStart(2, '0')}`];
            return wp ? wp.longRunMin : 0;
        });

        const defaults = this.darkThemeDefaults();
        const chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: weeks.map(w => `S${w}`),
                datasets: [
                    {
                        label: 'Completado',
                        data: completedData,
                        borderColor: '#e94560',
                        backgroundColor: 'rgba(233, 69, 96, 0.1)',
                        fill: false,
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: '#e94560'
                    },
                    {
                        label: 'Proyectado',
                        data: projectedData,
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.3,
                        pointRadius: 2
                    }
                ]
            },
            options: {
                ...defaults,
                scales: {
                    ...defaults.scales,
                    y: {
                        ...defaults.scales.y,
                        title: { display: true, text: 'minutos', color: '#a0a0b0' }
                    }
                },
                plugins: {
                    ...defaults.plugins,
                    tooltip: {
                        ...defaults.plugins.tooltip,
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y || 0} min`
                        }
                    }
                }
            }
        });
        this.state.charts.push(chart);
    },

    buildPaceChart() {
        const canvas = document.getElementById('st-chart-pace');
        if (!canvas) return;

        const allLogs = Object.values(this.state.logs);
        const runLogs = allLogs
            .filter(l => l.sessionType === 'running' && l.actual && l.actual.pace_avg)
            .sort((a, b) => a.date.localeCompare(b.date));

        if (runLogs.length === 0) {
            canvas.parentElement.parentElement.style.display = 'none';
            return;
        }

        const paceData = runLogs.map(l => ({
            x: l.date,
            y: Utils.paceToSeconds(l.actual.pace_avg),
            pace: l.actual.pace_avg,
            dist: l.actual.distance_km
        }));

        const labels = paceData.map(d => {
            const dt = Utils.parseDate(d.x);
            return `${dt.getDate()}/${dt.getMonth() + 1}`;
        });

        const defaults = this.darkThemeDefaults();
        const chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Ritmo',
                    data: paceData.map(d => d.y),
                    borderColor: '#e94560',
                    backgroundColor: 'rgba(233, 69, 96, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: '#e94560'
                }]
            },
            options: {
                ...defaults,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        ...defaults.plugins.tooltip,
                        callbacks: {
                            title: (items) => paceData[items[0].dataIndex].x,
                            label: (ctx) => {
                                const d = paceData[ctx.dataIndex];
                                return [`Ritmo: ${d.pace} min/km`, `Dist: ${d.dist} km`];
                            }
                        }
                    }
                },
                scales: {
                    ...defaults.scales,
                    y: {
                        ...defaults.scales.y,
                        reverse: true,
                        title: { display: true, text: 'min/km', color: '#a0a0b0' },
                        ticks: {
                            color: '#a0a0b0',
                            callback: (v) => {
                                const m = Math.floor(v / 60);
                                const s = Math.round(v % 60);
                                return `${m}:${String(s).padStart(2, '0')}`;
                            }
                        }
                    }
                }
            }
        });
        this.state.charts.push(chart);
    },

    buildAdherenceChart() {
        const canvas = document.getElementById('st-chart-adherence');
        if (!canvas) return;

        const allLogs = Object.values(this.state.logs);
        const proj = this.state.projections.weeklyProjections || {};
        const currentWeek = this.state.currentWeekNum || 5;

        // Count sessions per week by type
        const weekSessions = {};
        for (const log of allLogs) {
            if (!log.actual) continue;
            const wn = this.getWeekNumFromLog(log);
            if (!wn) continue;
            if (!weekSessions[wn]) weekSessions[wn] = { running: 0, strengthLower: 0, strengthUpper: 0 };

            if (log.sessionType === 'running') weekSessions[wn].running++;
            else if (log.sessionType === 'strength_lower') weekSessions[wn].strengthLower++;
            else if (log.sessionType === 'strength_upper') weekSessions[wn].strengthUpper++;
        }

        // Calculate adherence percentage per week
        const weeks = [];
        for (let w = 1; w <= currentWeek; w++) weeks.push(w);

        const adherenceData = weeks.map(w => {
            const wp = proj[`week_${String(w).padStart(2, '0')}`];
            if (!wp) return 0;

            const planned = (wp.runningSessions || 0) + (wp.strengthLower || 0) + (wp.strengthUpper || 0);
            if (planned === 0) return 100;

            const actual = weekSessions[w]
                ? (weekSessions[w].running + weekSessions[w].strengthLower + weekSessions[w].strengthUpper)
                : 0;

            return Math.min(100, Math.round((actual / planned) * 100));
        });

        const defaults = this.darkThemeDefaults();
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: weeks.map(w => `S${w}`),
                datasets: [{
                    label: 'Adherencia',
                    data: adherenceData,
                    backgroundColor: adherenceData.map(v => {
                        if (v >= 80) return 'rgba(76, 175, 80, 0.7)';
                        if (v >= 50) return 'rgba(255, 152, 0, 0.7)';
                        return 'rgba(244, 67, 54, 0.7)';
                    }),
                    borderRadius: 4
                }]
            },
            options: {
                ...defaults,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        ...defaults.plugins.tooltip,
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.y}% completado`
                        }
                    }
                },
                scales: {
                    ...defaults.scales,
                    y: {
                        ...defaults.scales.y,
                        max: 100,
                        title: { display: true, text: '%', color: '#a0a0b0' }
                    }
                }
            }
        });
        this.state.charts.push(chart);
    }
};

Router.registerView('stats-view', StatsView);
