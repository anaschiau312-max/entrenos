// Calendar View — Monthly

const CalendarView = {
    currentMonth: null, // 0-indexed
    currentYear: null,
    plan: null,
    logs: null,
    planDays: null, // flat map: dateStr -> { sessions, phase, weekNumber }
    selectedDate: null,

    async render() {
        const [plan, logs] = await Promise.all([
            DB.getPlan(),
            DB.getWorkoutLogs(window.currentUser.uid)
        ]);

        this.plan = plan;
        this.logs = logs || {};

        // Build flat day lookup from plan
        this.planDays = {};
        if (plan && plan.weeks) {
            for (const [, week] of Object.entries(plan.weeks)) {
                if (!week.days) continue;
                for (const [dateStr, day] of Object.entries(week.days)) {
                    this.planDays[dateStr] = {
                        sessions: day.sessions || [],
                        phase: week.phase,
                        weekNumber: week.weekNumber,
                        workSchedule: day.workSchedule,
                        bestMoment: day.bestMoment
                    };
                }
            }
        }

        // Default to current month
        if (this.currentMonth === null) {
            const now = new Date();
            this.currentMonth = now.getMonth();
            this.currentYear = now.getFullYear();
        }

        this.selectedDate = null;

        return this.renderMonth();
    },

    renderMonth() {
        const today = Utils.formatDate(new Date());
        const monthName = Utils.getMonthName(this.currentMonth);
        const year = this.currentYear;

        // First day of month and number of days
        const firstDay = new Date(year, this.currentMonth, 1);
        const lastDay = new Date(year, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();

        // Day of week of first day (0=Sun, we need Mon=0)
        let startDow = firstDay.getDay() - 1;
        if (startDow < 0) startDow = 6; // Sunday → 6

        // Previous month padding days
        const prevMonthLast = new Date(year, this.currentMonth, 0).getDate();

        // Month stats
        let monthSessions = 0;
        let monthCompleted = 0;
        let monthKm = 0;

        // Build grid cells
        let cellsHtml = '';
        const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

        for (let i = 0; i < totalCells; i++) {
            const dayNum = i - startDow + 1;
            let dateStr = '';
            let cellClass = 'cal-cell';
            let dotHtml = '';
            let dayLabel = '';
            let isCurrentMonth = false;

            if (dayNum < 1) {
                // Previous month
                dayLabel = prevMonthLast + dayNum;
                cellClass += ' cal-cell-outside';
            } else if (dayNum > daysInMonth) {
                // Next month
                dayLabel = dayNum - daysInMonth;
                cellClass += ' cal-cell-outside';
            } else {
                // Current month
                isCurrentMonth = true;
                dayLabel = dayNum;
                dateStr = `${year}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

                if (dateStr === today) {
                    cellClass += ' cal-cell-today';
                }

                // Determine dot color from plan + logs
                const planDay = this.planDays[dateStr];
                const logId = `log_${dateStr.replace(/-/g, '')}`;
                const log = this.logs[logId];

                if (planDay) {
                    const sessions = planDay.sessions;
                    const hasSessions = sessions.length > 0;

                    if (!hasSessions) {
                        // Rest day
                        dotHtml = '<span class="cal-dot cal-dot-rest"></span>';
                    } else {
                        const allCompleted = sessions.every(s => s.completed);
                        const isRunning = sessions.some(s => s.type === 'running');
                        const isCycling = sessions.some(s => s.type === 'cycling');
                        const isStrength = sessions.some(s => s.type === 'strength');

                        if (allCompleted || (log && log.actual && log.actual.completed)) {
                            // Completed
                            dotHtml = isRunning
                                ? '<span class="cal-dot cal-dot-run-done"></span>'
                                : '<span class="cal-dot cal-dot-strength-done"></span>';
                        } else if (dateStr < today) {
                            // Past and not completed
                            dotHtml = '<span class="cal-dot cal-dot-missed"></span>';
                        } else {
                            // Pending (today or future)
                            dotHtml = '<span class="cal-dot cal-dot-pending"></span>';
                        }
                    }
                }

                // Count stats
                if (planDay && planDay.sessions.length > 0) {
                    monthSessions += planDay.sessions.length;
                    monthCompleted += planDay.sessions.filter(s => s.completed).length;
                    if (log && log.actual && log.actual.completed) {
                        monthCompleted = Math.max(monthCompleted, planDay.sessions.length);
                    }
                }
                if (log && log.actual && log.actual.distance_km) {
                    monthKm += log.actual.distance_km;
                }
            }

            const clickAttr = isCurrentMonth ? `data-date="${dateStr}"` : '';
            cellsHtml += `
                <div class="${cellClass}" ${clickAttr}>
                    <span class="cal-day-num">${dayLabel}</span>
                    ${dotHtml}
                </div>`;
        }

        // Header days of week
        const dowLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
        const dowHtml = dowLabels.map(d => `<div class="cal-dow">${d}</div>`).join('');

        // Month progress
        const completionPct = monthSessions > 0 ? Math.round((monthCompleted / monthSessions) * 100) : 0;
        const trainingDays = new Set();
        const completedDays = new Set();
        for (const [dateStr, pd] of Object.entries(this.planDays)) {
            if (!dateStr.startsWith(`${year}-${String(this.currentMonth + 1).padStart(2, '0')}`)) continue;
            if (pd.sessions.length > 0) {
                trainingDays.add(dateStr);
                if (pd.sessions.every(s => s.completed)) {
                    completedDays.add(dateStr);
                }
            }
        }

        return `
            <div class="cal-header">
                <button class="week-selector-btn" id="calPrev" aria-label="Mes anterior">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <span class="cal-month-label">${monthName} ${year}</span>
                <button class="week-selector-btn" id="calNext" aria-label="Mes siguiente">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
            </div>

            <div class="cal-legend">
                <span class="cal-legend-item"><span class="cal-dot cal-dot-run-done"></span> Carrera</span>
                <span class="cal-legend-item"><span class="cal-dot cal-dot-strength-done"></span> Fuerza</span>
                <span class="cal-legend-item"><span class="cal-dot cal-dot-pending"></span> Pendiente</span>
                <span class="cal-legend-item"><span class="cal-dot cal-dot-missed"></span> No hecho</span>
                <span class="cal-legend-item"><span class="cal-dot cal-dot-rest"></span> Descanso</span>
            </div>

            <div class="cal-grid">
                ${dowHtml}
                ${cellsHtml}
            </div>

            <div id="calDayPanel" class="cal-day-panel"></div>

            <div class="card cal-month-summary">
                <div class="week-summary-title">Resumen del mes</div>
                <div class="week-summary-stats">
                    <div class="week-summary-stat">
                        <span class="week-summary-stat-value">${completedDays.size}/${trainingDays.size}</span>
                        <span class="week-summary-stat-label">días entreno</span>
                    </div>
                    <div class="week-summary-stat">
                        <span class="week-summary-stat-value">${completionPct}%</span>
                        <span class="week-summary-stat-label">completado</span>
                    </div>
                    <div class="week-summary-stat">
                        <span class="week-summary-stat-value">${monthKm > 0 ? monthKm.toFixed(1) : '—'}</span>
                        <span class="week-summary-stat-label">km</span>
                    </div>
                </div>
                <div class="progress-bar mt-8">
                    <div class="progress-fill" style="width: ${completionPct}%"></div>
                </div>
            </div>
        `;
    },

    renderDayPanel(dateStr) {
        const planDay = this.planDays[dateStr];
        const logId = `log_${dateStr.replace(/-/g, '')}`;
        const log = this.logs[logId];
        const today = Utils.formatDate(new Date());
        const dateDisplay = Utils.formatDateDisplay(dateStr);

        let html = `<div class="cal-panel-header">${dateDisplay}</div>`;

        if (!planDay) {
            html += `<p class="text-sm text-muted">Sin datos del plan para este día</p>`;
            return html;
        }

        const sessions = planDay.sessions;

        if (sessions.length === 0) {
            html += `<div class="cal-panel-rest">🧘 Descanso planificado</div>`;
            return html;
        }

        for (const session of sessions) {
            const isRunning = session.type === 'running';
            const isCycling = session.type === 'cycling';
            const isStrengthLower = session.type === 'strength_lower';
            const icon = isRunning ? '🏃' : isCycling ? '🚴' : isStrengthLower ? '🦵' : '💪';
            const isCompleted = session.completed;

            html += `
                <div class="cal-panel-session">
                    <span class="cal-panel-session-icon">${icon}</span>
                    <div class="cal-panel-session-info">
                        <span class="cal-panel-session-title">${session.title}</span>
                        <span class="text-xs text-muted">${session.duration}</span>
                    </div>
                    ${isCompleted ? '<span class="text-success fw-bold">✓</span>' : ''}
                </div>`;
        }

        // Show log summary if exists
        if (log && log.actual) {
            const a = log.actual;
            html += `
                <div class="divider"></div>
                <div class="dash-log-stats">
                    ${a.distance_km ? `<div class="dash-log-stat"><span class="dash-log-stat-value">${a.distance_km}</span><span class="dash-log-stat-label">km</span></div>` : ''}
                    ${a.duration ? `<div class="dash-log-stat"><span class="dash-log-stat-value">${a.duration}</span><span class="dash-log-stat-label">tiempo</span></div>` : ''}
                    ${a.pace_avg ? `<div class="dash-log-stat"><span class="dash-log-stat-value">${a.pace_avg}</span><span class="dash-log-stat-label">ritmo</span></div>` : ''}
                    ${a.heart_rate_avg ? `<div class="dash-log-stat"><span class="dash-log-stat-value">${a.heart_rate_avg}</span><span class="dash-log-stat-label">FC</span></div>` : ''}
                </div>`;
        }

        // Action button
        if (!log && dateStr <= today) {
            html += `<button class="btn btn-primary btn-full mt-8 cal-register-btn">📝 Registrar</button>`;
        }

        return html;
    },

    mount() {
        // Month navigation
        document.getElementById('calPrev')?.addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('calNext')?.addEventListener('click', () => this.changeMonth(1));

        // Day click
        document.querySelectorAll('.cal-cell[data-date]').forEach(cell => {
            cell.addEventListener('click', () => {
                const dateStr = cell.dataset.date;
                this.selectDay(dateStr, cell);
            });
        });
    },

    selectDay(dateStr, cell) {
        // Deselect previous
        document.querySelectorAll('.cal-cell-selected').forEach(c => c.classList.remove('cal-cell-selected'));

        // Select new
        cell.classList.add('cal-cell-selected');
        this.selectedDate = dateStr;

        // Render panel
        const panel = document.getElementById('calDayPanel');
        panel.innerHTML = this.renderDayPanel(dateStr);
        panel.classList.add('open');

        // Register button
        panel.querySelector('.cal-register-btn')?.addEventListener('click', () => {
            Router.navigate('workout-log');
        });
    },

    changeMonth(direction) {
        this.currentMonth += direction;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }

        const container = document.getElementById('main-content');
        const html = this.renderMonth();
        container.innerHTML = `<div class="view-container">${html}</div>`;
        this.mount();
    }
};

// Register with router
Router.registerView('calendar', CalendarView);
