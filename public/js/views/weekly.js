// Weekly Plan View

const WeeklyView = {
    currentWeekNum: null,
    plan: null,
    phases: null,
    logs: null,

    async render() {
        // Load all data once
        const [plan, phases, logs] = await Promise.all([
            DB.getPlan(),
            DB.getPhases(),
            DB.getWorkoutLogs(window.currentUser.uid)
        ]);

        this.plan = plan;
        this.phases = phases;
        this.logs = logs || {};

        // Determine current week number
        if (!this.currentWeekNum) {
            const currentWeek = await DB.getCurrentWeek();
            this.currentWeekNum = currentWeek ? currentWeek.weekNumber : 4;
        }

        return this.renderWeek();
    },

    renderWeek() {
        const weekId = `week_${String(this.currentWeekNum).padStart(2, '0')}`;
        const week = this.plan && this.plan.weeks ? this.plan.weeks[weekId] : null;

        if (!week) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <p class="empty-state-text">No hay datos para esta semana</p>
                </div>`;
        }

        const phaseKey = week.phase;
        const phase = this.phases ? this.phases[phaseKey] : null;
        const phaseColor = phase ? phase.color : '#a0a0b0';
        const phaseName = phase ? phase.name : '';
        const today = Utils.formatDate(new Date());

        // Week summary stats
        let totalSessions = 0;
        let completedSessions = 0;
        let totalKm = 0;

        // Build day cards
        const days = week.days || {};
        const sortedDates = Object.keys(days).sort();
        let dayCardsHtml = '';

        for (const dateStr of sortedDates) {
            const day = days[dateStr];
            const date = Utils.parseDate(dateStr);
            const dayName = Utils.getDayName(date);
            const dayNum = date.getDate();
            const monthShort = Utils.getMonthName(date.getMonth()).substring(0, 3).toLowerCase();
            const isToday = dateStr === today;
            const sessions = day.sessions || [];
            const isRest = sessions.length === 0;

            totalSessions += sessions.length;
            completedSessions += sessions.filter(s => s.completed).length;

            // Check for logged km
            const logId = `log_${dateStr.replace(/-/g, '')}`;
            const log = this.logs[logId];
            if (log && log.actual && log.actual.distance_km) {
                totalKm += log.actual.distance_km;
            }

            // Session display
            let sessionHtml = '';
            let statusHtml = '';

            if (isRest) {
                sessionHtml = `
                    <div class="week-day-session week-day-rest">
                        <span class="week-day-session-icon">➖</span>
                        <span class="text-muted text-sm">Descanso</span>
                    </div>`;
                statusHtml = '<span class="status-dot rest"></span>';
            } else {
                for (const session of sessions) {
                    const isRunning = session.type === 'running';
                    const isStrength = session.type === 'strength';
                    const icon = isRunning ? '🏃' : isStrength ? '💪' : '🧘';
                    const isCompleted = session.completed;
                    const isPast = dateStr < today && !isCompleted;

                    sessionHtml += `
                        <div class="week-day-session">
                            <span class="week-day-session-icon">${icon}</span>
                            <div class="week-day-session-info">
                                <span class="week-day-session-title">${session.title}</span>
                                <span class="text-muted text-xs">${session.duration}</span>
                            </div>
                            ${isCompleted
                                ? '<span class="text-success text-sm fw-bold">✓</span>'
                                : isPast
                                    ? '<span class="text-danger text-sm">✗</span>'
                                    : '<span class="text-warning text-sm">⏳</span>'}
                        </div>`;
                }

                const allCompleted = sessions.every(s => s.completed);
                const anyCompleted = sessions.some(s => s.completed);
                const isPastDay = dateStr < today;

                if (allCompleted) {
                    statusHtml = '<span class="status-dot completed"></span>';
                } else if (isPastDay && !anyCompleted) {
                    statusHtml = '<span class="status-dot missed"></span>';
                } else {
                    statusHtml = '<span class="status-dot pending"></span>';
                }
            }

            // Expandable details
            let detailsHtml = '';
            for (const session of sessions) {
                if (session.type === 'running' && session.details) {
                    detailsHtml += `
                        <div class="week-day-details">
                            ${session.description ? `<p class="text-sm text-muted mb-8">${session.description}</p>` : ''}
                            <div class="dash-detail-row">
                                <span class="dash-detail-label">Calentamiento</span>
                                <span class="dash-detail-value">${session.details.warmup}</span>
                            </div>
                            <div class="dash-detail-row">
                                <span class="dash-detail-label">Principal</span>
                                <span class="dash-detail-value">${session.details.main}</span>
                            </div>
                            <div class="dash-detail-row">
                                <span class="dash-detail-label">Vuelta a la calma</span>
                                <span class="dash-detail-value">${session.details.cooldown}</span>
                            </div>
                            ${session.notes ? `<div class="dash-detail-row"><span class="dash-detail-label">Notas</span><span class="dash-detail-value">${session.notes}</span></div>` : ''}
                        </div>`;
                }
                if (session.type === 'strength' && session.exerciseGroup) {
                    detailsHtml += `
                        <div class="week-day-details">
                            <p class="text-sm text-muted">${session.title} — ${session.duration}</p>
                        </div>`;
                }
            }

            // Schedule info
            const scheduleHtml = (day.workSchedule || day.bestMoment) ? `
                <div class="week-day-schedule">
                    ${day.workSchedule ? `<span class="chip">🕐 ${day.workSchedule}</span>` : ''}
                    ${day.bestMoment && day.bestMoment !== 'Descanso' ? `<span class="chip">⚡ ${day.bestMoment}</span>` : ''}
                </div>` : '';

            dayCardsHtml += `
            <div class="card week-day-card ${isToday ? 'week-day-today' : ''}" data-expandable>
                <div class="expandable-header" data-toggle="week-expand">
                    <div class="week-day-header">
                        ${statusHtml}
                        <div class="week-day-date">
                            <span class="week-day-name">${dayName}</span>
                            <span class="week-day-num">${dayNum} ${monthShort}</span>
                        </div>
                    </div>
                    <div class="week-day-content">
                        ${sessionHtml}
                    </div>
                    <span class="expand-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </span>
                </div>
                <div class="expandable-body">
                    ${scheduleHtml}
                    ${detailsHtml}
                    <button class="btn btn-secondary btn-sm week-edit-day-btn" data-week="${this.currentWeekNum}" data-date="${dateStr}">
                        ✏️ Editar día
                    </button>
                </div>
            </div>`;
        }

        // Summary
        const completionPct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
        const summaryHtml = `
            <div class="card week-summary">
                <div class="week-summary-title">Resumen de la semana</div>
                <div class="week-summary-stats">
                    <div class="week-summary-stat">
                        <span class="week-summary-stat-value">${completedSessions}/${totalSessions}</span>
                        <span class="week-summary-stat-label">sesiones</span>
                    </div>
                    <div class="week-summary-stat">
                        <span class="week-summary-stat-value">${completionPct}%</span>
                        <span class="week-summary-stat-label">completado</span>
                    </div>
                    <div class="week-summary-stat">
                        <span class="week-summary-stat-value">${totalKm > 0 ? totalKm.toFixed(1) : '—'}</span>
                        <span class="week-summary-stat-label">km</span>
                    </div>
                </div>
                <div class="progress-bar mt-8">
                    <div class="progress-fill" style="width: ${completionPct}%"></div>
                </div>
            </div>`;

        return `
            <div class="week-selector">
                <button class="week-selector-btn" id="weekPrev" aria-label="Semana anterior">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <div class="week-selector-info">
                    <span class="week-selector-label">Semana ${this.currentWeekNum}</span>
                    <span class="badge badge-phase" style="background-color: ${phaseColor}20; color: ${phaseColor};">${phaseName}</span>
                </div>
                <button class="week-selector-btn" id="weekNext" aria-label="Semana siguiente">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
            </div>

            <div class="week-days" id="weekDays">
                ${dayCardsHtml}
            </div>

            ${summaryHtml}
        `;
    },

    mount() {
        // Week navigation
        const prevBtn = document.getElementById('weekPrev');
        const nextBtn = document.getElementById('weekNext');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.changeWeek(-1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.changeWeek(1));
        }

        // Expandable day cards
        document.querySelectorAll('[data-toggle="week-expand"]').forEach(header => {
            header.addEventListener('click', () => {
                header.classList.toggle('expanded');
                const body = header.nextElementSibling;
                body.classList.toggle('open');
            });
        });

        // Edit day buttons
        document.querySelectorAll('.week-edit-day-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const weekNum = parseInt(e.currentTarget.dataset.week);
                if (window.EditPlanView) {
                    window.EditPlanView.state.currentWeekNum = weekNum;
                }
                Router.navigate('edit-plan');
            });
        });

        // Scroll to today's card
        const todayCard = document.querySelector('.week-day-today');
        if (todayCard) {
            todayCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    changeWeek(direction) {
        const newWeek = this.currentWeekNum + direction;
        if (newWeek < 4 || newWeek > 18) return;

        this.currentWeekNum = newWeek;

        // Re-render in place with slide animation
        const container = document.getElementById('main-content');
        const weekDays = document.getElementById('weekDays');
        const slideClass = direction > 0 ? 'slide-left' : 'slide-right';

        if (weekDays) {
            weekDays.classList.add(slideClass);
        }

        setTimeout(() => {
            const html = this.renderWeek();
            container.innerHTML = `<div class="view-container">${html}</div>`;
            this.mount();
        }, 150);
    }
};

// Register with router
Router.registerView('weekly', WeeklyView);
