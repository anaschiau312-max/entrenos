// Stats View — Statistics dashboard with Chart.js graphs

const StatsView = {

    state: {
        logs: null,
        plan: null,
        phases: null,
        period: 'all', // 'month', '4weeks', 'all'
        charts: []
    },

    async render() {
        const s = this.state;
        const [logs, plan, phases] = await Promise.all([
            DB.getWorkoutLogs(window.currentUser.uid),
            DB.getPlan(),
            DB.getPhases()
        ]);
        s.logs = logs || {};
        s.plan = plan;
        s.phases = phases || {};
        s.charts = [];

        return this.renderPage();
    },

    getFilteredLogs() {
        const s = this.state;
        const allLogs = Object.values(s.logs);
        if (s.period === 'all') return allLogs;

        const now = new Date();
        let cutoff;
        if (s.period === 'month') {
            cutoff = new Date(now);
            cutoff.setMonth(cutoff.getMonth() - 1);
        } else if (s.period === '4weeks') {
            cutoff = Utils.addDays(now, -28);
        }

        const cutoffStr = Utils.formatDate(cutoff);
        return allLogs.filter(l => l.date >= cutoffStr);
    },

    getRunningLogs(logs) {
        return logs
            .filter(l => l.sessionType === 'running' && l.actual)
            .sort((a, b) => a.date.localeCompare(b.date));
    },

    renderPage() {
        const logs = this.getFilteredLogs();
        const runLogs = this.getRunningLogs(logs);

        // Summary stats
        const summary = this.calcSummary(logs, runLogs);

        // Period selector
        const periods = [
            { key: 'month', label: 'Último mes' },
            { key: '4weeks', label: '4 semanas' },
            { key: 'all', label: 'Todo el plan' }
        ];
        let periodHtml = '';
        for (const p of periods) {
            const active = p.key === this.state.period ? 'active' : '';
            periodHtml += `<button class="st-period-btn ${active}" data-period="${p.key}">${p.label}</button>`;
        }

        let html = `
        <div class="st-header">
            <h1 class="section-title">Estadísticas</h1>
            <div class="st-period-selector">
                ${periodHtml}
            </div>
        </div>`;

        // Summary cards
        html += `
        <div class="st-summary">
            <div class="st-summary-main card">
                <div class="st-summary-main-value">${summary.totalKm.toFixed(1)}</div>
                <div class="st-summary-main-label">km totales</div>
            </div>
            <div class="st-summary-grid">
                <div class="st-summary-card card">
                    <div class="st-summary-value">${summary.sessionsCompleted}/${summary.sessionsTotal}</div>
                    <div class="st-summary-label">Sesiones (${summary.sessionsPct}%)</div>
                </div>
                <div class="st-summary-card card">
                    <div class="st-summary-value">${summary.totalTime}</div>
                    <div class="st-summary-label">Tiempo total</div>
                </div>
                <div class="st-summary-card card">
                    <div class="st-summary-value">${summary.bestPace || '—'}</div>
                    <div class="st-summary-label">Mejor ritmo</div>
                </div>
                <div class="st-summary-card card">
                    <div class="st-summary-value">S${summary.currentWeek}</div>
                    <div class="st-summary-label">de 18 semanas</div>
                </div>
            </div>
        </div>`;

        // No data fallback
        if (runLogs.length === 0 && logs.length === 0) {
            html += `
            <div class="empty-state mt-16">
                <div class="empty-state-icon">📊</div>
                <p class="empty-state-text">Aún no hay registros de entrenamiento.<br>Las gráficas aparecerán cuando registres tus sesiones.</p>
            </div>`;
            return html;
        }

        // Charts
        if (runLogs.length > 0) {
            html += `
            <div class="card st-chart-card">
                <div class="card-header"><span class="card-title">Distancia semanal</span></div>
                <div class="st-chart-container"><canvas id="st-chart-distance"></canvas></div>
            </div>

            <div class="card st-chart-card">
                <div class="card-header"><span class="card-title">Ritmo medio</span></div>
                <div class="st-chart-container"><canvas id="st-chart-pace"></canvas></div>
            </div>

            <div class="card st-chart-card">
                <div class="card-header"><span class="card-title">Frecuencia cardíaca</span></div>
                <div class="st-chart-container"><canvas id="st-chart-hr"></canvas></div>
            </div>

            <div class="card st-chart-card">
                <div class="card-header"><span class="card-title">Cadencia</span></div>
                <div class="st-chart-container"><canvas id="st-chart-cadence"></canvas></div>
            </div>`;
        }

        // History table
        html += this.renderHistoryTable(logs);

        return html;
    },

    calcSummary(logs, runLogs) {
        let totalKm = 0;
        let totalSeconds = 0;
        let bestPaceSeconds = Infinity;
        let bestPace = null;

        for (const log of runLogs) {
            const a = log.actual;
            if (a.distance_km) totalKm += a.distance_km;
            if (a.duration) {
                const parts = a.duration.split(':').map(Number);
                if (parts.length === 3) totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
            }
            if (a.pace_avg) {
                const ps = Utils.paceToSeconds(a.pace_avg);
                if (ps > 0 && ps < bestPaceSeconds) {
                    bestPaceSeconds = ps;
                    bestPace = a.pace_avg;
                }
            }
        }

        // Total time formatted
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const totalTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        // Sessions from plan
        let sessionsTotal = 0;
        let sessionsCompleted = logs.length;
        if (this.state.plan && this.state.plan.weeks) {
            for (const week of Object.values(this.state.plan.weeks)) {
                if (!week.days) continue;
                for (const day of Object.values(week.days)) {
                    if (day.sessions) sessionsTotal += day.sessions.length;
                }
            }
        }
        const sessionsPct = sessionsTotal > 0 ? Math.round((sessionsCompleted / sessionsTotal) * 100) : 0;

        // Current week
        const today = new Date();
        const currentWeek = Utils.getWeekNumber(today);

        return { totalKm, totalTime, bestPace, sessionsCompleted, sessionsTotal, sessionsPct, currentWeek };
    },

    renderHistoryTable(logs) {
        const sorted = [...logs]
            .filter(l => l.actual)
            .sort((a, b) => b.date.localeCompare(a.date));

        if (sorted.length === 0) return '';

        const feelingMap = {
            muy_duro: '😫', normal: '😐', bien: '😊', genial: '😁', increible: '🔥'
        };

        let rowsHtml = '';
        for (const log of sorted) {
            const a = log.actual;
            const isRun = log.sessionType === 'running';
            const typeIcon = isRun ? '🏃' : '💪';
            const dist = isRun && a.distance_km ? `${a.distance_km} km` : '—';
            const dur = isRun && a.duration ? a.duration : '—';
            const pace = isRun && a.pace_avg ? a.pace_avg : '—';
            const hr = isRun && a.heart_rate_avg ? a.heart_rate_avg : '—';
            const feel = log.feeling ? (feelingMap[log.feeling] || '') : '';

            const dateObj = Utils.parseDate(log.date);
            const dayShort = Utils.getDayShort(dateObj);
            const dateDisplay = `${dayShort} ${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

            rowsHtml += `
            <tr class="st-history-row" data-log-date="${log.date}">
                <td class="st-td-date">${dateDisplay}</td>
                <td>${typeIcon}</td>
                <td>${dist}</td>
                <td>${dur}</td>
                <td>${pace}</td>
                <td>${hr}</td>
                <td>${feel}</td>
            </tr>`;
        }

        return `
        <div class="card st-history-card">
            <div class="card-header"><span class="card-title">Historial</span></div>
            <div class="st-table-scroll">
                <table class="st-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Dist.</th>
                            <th>Dur.</th>
                            <th>Ritmo</th>
                            <th>FC</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        </div>`;
    },

    mount() {
        // Period selector
        document.querySelectorAll('.st-period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.state.period = e.currentTarget.dataset.period;
                this.destroyCharts();
                const container = document.getElementById('main-content').querySelector('.view-container');
                container.innerHTML = this.renderPage();
                this.mount();
            });
        });

        // History row tap
        document.querySelectorAll('.st-history-row').forEach(row => {
            row.addEventListener('click', () => {
                // Navigate to workout-log for that date (future enhancement)
            });
        });

        // Build charts
        this.buildCharts();
    },

    destroyCharts() {
        for (const c of this.state.charts) {
            try { c.destroy(); } catch (e) {}
        }
        this.state.charts = [];
    },

    // Common chart options for dark theme
    darkThemeDefaults() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
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
                    grid: { color: 'rgba(255,255,255,0.06)' }
                }
            }
        };
    },

    buildCharts() {
        if (typeof Chart === 'undefined') return;
        const logs = this.getFilteredLogs();
        const runLogs = this.getRunningLogs(logs);
        if (runLogs.length === 0) return;

        this.buildDistanceChart(runLogs);
        this.buildPaceChart(runLogs);
        this.buildHrChart(runLogs);
        this.buildCadenceChart(runLogs);
    },

    // === 1. Weekly distance bar chart ===
    buildDistanceChart(runLogs) {
        const canvas = document.getElementById('st-chart-distance');
        if (!canvas) return;

        // Group by week number
        const weekData = {};
        for (const log of runLogs) {
            const d = Utils.parseDate(log.date);
            const wn = Utils.getWeekNumber(d);
            if (!weekData[wn]) weekData[wn] = { km: 0, phase: null };
            weekData[wn].km += log.actual.distance_km || 0;
        }

        // Also map weeks to phases from plan
        if (this.state.phases) {
            for (const [, phase] of Object.entries(this.state.phases)) {
                if (phase.weeks) {
                    for (const wn of phase.weeks) {
                        if (weekData[wn]) weekData[wn].phase = phase.color;
                    }
                }
            }
        }

        const sortedWeeks = Object.keys(weekData).map(Number).sort((a, b) => a - b);
        const currentWeek = Utils.getWeekNumber(new Date());

        const labels = sortedWeeks.map(w => `S${w}`);
        const data = sortedWeeks.map(w => Math.round(weekData[w].km * 10) / 10);
        const bgColors = sortedWeeks.map(w => {
            if (w === currentWeek) return '#e94560';
            return weekData[w].phase ? weekData[w].phase + '99' : 'rgba(255,255,255,0.15)';
        });
        const borderColors = sortedWeeks.map(w => {
            if (w === currentWeek) return '#e94560';
            return weekData[w].phase || 'rgba(255,255,255,0.3)';
        });

        const defaults = this.darkThemeDefaults();
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                ...defaults,
                scales: {
                    ...defaults.scales,
                    y: {
                        ...defaults.scales.y,
                        beginAtZero: true,
                        title: { display: true, text: 'km', color: '#a0a0b0', font: { size: 11 } }
                    }
                },
                plugins: {
                    ...defaults.plugins,
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

    // === 2. Pace line chart (inverted Y) ===
    buildPaceChart(runLogs) {
        const canvas = document.getElementById('st-chart-pace');
        if (!canvas) return;

        const paceData = runLogs
            .filter(l => l.actual.pace_avg)
            .map(l => ({
                x: l.date,
                y: Utils.paceToSeconds(l.actual.pace_avg),
                dist: l.actual.distance_km,
                pace: l.actual.pace_avg
            }));

        if (paceData.length === 0) {
            canvas.parentElement.parentElement.style.display = 'none';
            return;
        }

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
                    data: paceData.map(d => d.y),
                    borderColor: '#e94560',
                    backgroundColor: 'rgba(233, 69, 96, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#e94560',
                    pointBorderColor: '#1a1a2e',
                    pointBorderWidth: 2
                }]
            },
            options: {
                ...defaults,
                scales: {
                    ...defaults.scales,
                    y: {
                        ...defaults.scales.y,
                        reverse: true,
                        title: { display: true, text: 'min/km', color: '#a0a0b0', font: { size: 11 } },
                        ticks: {
                            ...defaults.scales.y.ticks,
                            callback: (v) => {
                                const m = Math.floor(v / 60);
                                const s = Math.round(v % 60);
                                return `${m}:${String(s).padStart(2, '0')}`;
                            }
                        }
                    }
                },
                plugins: {
                    ...defaults.plugins,
                    tooltip: {
                        ...defaults.plugins.tooltip,
                        callbacks: {
                            title: (items) => {
                                const i = items[0].dataIndex;
                                return paceData[i].x;
                            },
                            label: (ctx) => {
                                const i = ctx.dataIndex;
                                return [`Ritmo: ${paceData[i].pace} min/km`, `Distancia: ${paceData[i].dist} km`];
                            }
                        }
                    }
                }
            }
        });
        this.state.charts.push(chart);
    },

    // === 3. Heart rate line chart with zones ===
    buildHrChart(runLogs) {
        const canvas = document.getElementById('st-chart-hr');
        if (!canvas) return;

        const hrData = runLogs
            .filter(l => l.actual.heart_rate_avg)
            .map(l => ({ x: l.date, y: l.actual.heart_rate_avg }));

        if (hrData.length === 0) {
            canvas.parentElement.parentElement.style.display = 'none';
            return;
        }

        const labels = hrData.map(d => {
            const dt = Utils.parseDate(d.x);
            return `${dt.getDate()}/${dt.getMonth() + 1}`;
        });

        const defaults = this.darkThemeDefaults();

        // HR zone background plugin
        const hrZonePlugin = {
            id: 'hrZones',
            beforeDraw: (chart) => {
                const ctx = chart.ctx;
                const yScale = chart.scales.y;
                const xArea = chart.chartArea;

                const zones = [
                    { min: 0, max: 120, color: 'rgba(76, 175, 80, 0.06)', label: 'Recuperación' },
                    { min: 120, max: 150, color: 'rgba(33, 150, 243, 0.06)', label: 'Aeróbico' },
                    { min: 150, max: 170, color: 'rgba(255, 152, 0, 0.06)', label: 'Umbral' },
                    { min: 170, max: 220, color: 'rgba(244, 67, 54, 0.06)', label: 'Anaeróbico' }
                ];

                for (const z of zones) {
                    const yTop = yScale.getPixelForValue(Math.min(z.max, yScale.max));
                    const yBot = yScale.getPixelForValue(Math.max(z.min, yScale.min));
                    if (yTop < yBot) {
                        ctx.fillStyle = z.color;
                        ctx.fillRect(xArea.left, yTop, xArea.right - xArea.left, yBot - yTop);
                    }
                }
            }
        };

        const chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: hrData.map(d => d.y),
                    borderColor: '#F44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.08)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#F44336',
                    pointBorderColor: '#1a1a2e',
                    pointBorderWidth: 2
                }]
            },
            options: {
                ...defaults,
                scales: {
                    ...defaults.scales,
                    y: {
                        ...defaults.scales.y,
                        suggestedMin: 100,
                        suggestedMax: 200,
                        title: { display: true, text: 'bpm', color: '#a0a0b0', font: { size: 11 } }
                    }
                },
                plugins: {
                    ...defaults.plugins,
                    tooltip: {
                        ...defaults.plugins.tooltip,
                        callbacks: {
                            label: (ctx) => `FC: ${ctx.parsed.y} bpm`
                        }
                    }
                }
            },
            plugins: [hrZonePlugin]
        });
        this.state.charts.push(chart);
    },

    // === 4. Cadence line chart ===
    buildCadenceChart(runLogs) {
        const canvas = document.getElementById('st-chart-cadence');
        if (!canvas) return;

        const cadData = runLogs
            .filter(l => l.actual.cadence)
            .map(l => ({ x: l.date, y: l.actual.cadence }));

        if (cadData.length === 0) {
            canvas.parentElement.parentElement.style.display = 'none';
            return;
        }

        const labels = cadData.map(d => {
            const dt = Utils.parseDate(d.x);
            return `${dt.getDate()}/${dt.getMonth() + 1}`;
        });

        const defaults = this.darkThemeDefaults();

        // Reference line at 170 ppm
        const refLinePlugin = {
            id: 'cadenceRefLine',
            afterDraw: (chart) => {
                const yScale = chart.scales.y;
                const xArea = chart.chartArea;
                const yPos = yScale.getPixelForValue(170);

                if (yPos >= xArea.top && yPos <= xArea.bottom) {
                    const ctx = chart.ctx;
                    ctx.save();
                    ctx.setLineDash([6, 4]);
                    ctx.strokeStyle = 'rgba(76, 175, 80, 0.5)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(xArea.left, yPos);
                    ctx.lineTo(xArea.right, yPos);
                    ctx.stroke();

                    ctx.fillStyle = 'rgba(76, 175, 80, 0.7)';
                    ctx.font = '10px sans-serif';
                    ctx.fillText('Objetivo 170', xArea.right - 68, yPos - 5);
                    ctx.restore();
                }
            }
        };

        const chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: cadData.map(d => d.y),
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.08)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#4CAF50',
                    pointBorderColor: '#1a1a2e',
                    pointBorderWidth: 2
                }]
            },
            options: {
                ...defaults,
                scales: {
                    ...defaults.scales,
                    y: {
                        ...defaults.scales.y,
                        suggestedMin: 155,
                        suggestedMax: 185,
                        title: { display: true, text: 'ppm', color: '#a0a0b0', font: { size: 11 } }
                    }
                },
                plugins: {
                    ...defaults.plugins,
                    tooltip: {
                        ...defaults.plugins.tooltip,
                        callbacks: {
                            label: (ctx) => `Cadencia: ${ctx.parsed.y} ppm`
                        }
                    }
                }
            },
            plugins: [refLinePlugin]
        });
        this.state.charts.push(chart);
    }
};

// Register with router
Router.registerView('stats-view', StatsView);
