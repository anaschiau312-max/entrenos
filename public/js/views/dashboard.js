// Dashboard View — "Hoy"

const DashboardView = {

    async render() {
        const today = Utils.formatDate(new Date());
        const [todayData, phases, weekData, allExercises, logs, tecnica] = await Promise.all([
            DB.getToday(),
            DB.getPhases(),
            DB.getCurrentWeek(),
            DB.getAllExercises(),
            DB.getWorkoutLogs(window.currentUser.uid),
            DB.getTecnicaRespiracion()
        ]);

        // Check if today has a log already
        const todayLogId = `log_${today.replace(/-/g, '')}`;
        const todayLog = logs ? logs[todayLogId] : null;

        // Phase info
        const phaseKey = todayData ? todayData.phase : (weekData ? weekData.phase : null);
        const phase = phaseKey && phases ? phases[phaseKey] : null;
        const weekNumber = todayData ? todayData.weekNumber : (weekData ? weekData.weekNumber : null);

        // Week progress
        let weekProgress = null;
        if (weekData && weekData.days) {
            const totalSessions = Object.values(weekData.days)
                .reduce((sum, day) => sum + (day.sessions ? day.sessions.length : 0), 0);
            const completedSessions = Object.values(weekData.days)
                .reduce((sum, day) => {
                    if (!day.sessions) return sum;
                    return sum + day.sessions.filter(s => s.completed).length;
                }, 0);
            weekProgress = { total: totalSessions, completed: completedSessions };
        }

        // Day data
        const day = todayData ? todayData.day : null;
        const sessions = day ? (day.sessions || []) : [];
        const isRestDay = sessions.length === 0;

        // Tip of the day (rotate based on day of year)
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const tips = tecnica ? tecnica.tips : [];
        const tipOfDay = tips.length > 0 ? tips[dayOfYear % tips.length] : null;

        let html = '';

        // === Date header ===
        html += `
            <div class="dash-date">
                <h1 class="dash-date-main">${Utils.formatDateDisplay(today)}</h1>
            </div>`;

        // === Phase badge + week ===
        if (phase && weekNumber) {
            html += `
            <div class="dash-phase">
                <span class="badge badge-phase" style="background-color: ${phase.color}20; color: ${phase.color};">
                    ${phase.name}
                </span>
                <span class="dash-week-label">Semana ${weekNumber} de 18</span>
            </div>`;
        }

        // === Week progress bar ===
        if (weekProgress && weekProgress.total > 0) {
            const pct = Math.round((weekProgress.completed / weekProgress.total) * 100);
            html += `
            <div class="dash-progress card">
                <div class="dash-progress-header">
                    <span class="text-sm">Progreso semanal</span>
                    <span class="text-sm fw-bold">${weekProgress.completed}/${weekProgress.total} sesiones</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${pct}%"></div>
                </div>
            </div>`;
        }

        // === Schedule card ===
        if (day) {
            html += `
            <div class="card dash-schedule">
                <div class="dash-schedule-row">
                    <span class="dash-schedule-icon">🕐</span>
                    <div>
                        <div class="text-sm text-muted">Horario de trabajo</div>
                        <div class="fw-bold">${day.workSchedule}</div>
                    </div>
                </div>
                <div class="dash-schedule-row">
                    <span class="dash-schedule-icon">⚡</span>
                    <div>
                        <div class="text-sm text-muted">Momento ideal</div>
                        <div class="fw-bold">${day.bestMoment}</div>
                    </div>
                </div>
            </div>`;
        }

        // === Session card or rest day ===
        if (isRestDay) {
            html += this.renderRestDay(tipOfDay);
        } else {
            for (const session of sessions) {
                html += await this.renderSessionCard(session, todayData, todayLog, allExercises);
            }
        }

        // === Tip of the day (only if not rest day, since rest day already shows tip) ===
        if (!isRestDay && tipOfDay) {
            html += `
            <div class="card dash-tip">
                <div class="card-header">
                    <span class="card-title">Tip del día</span>
                </div>
                <div class="dash-tip-content">
                    <span class="dash-tip-topic">${tipOfDay.topic}</span>
                    <span class="dash-tip-advice">${tipOfDay.advice}</span>
                </div>
            </div>`;
        }

        // === No data fallback ===
        if (!todayData && !weekData) {
            html = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <p class="empty-state-text">No hay datos del plan para hoy.<br>El plan cubre del 2 feb al 17 may 2026.</p>
            </div>`;
        }

        return html;
    },

    renderRestDay(tipOfDay) {
        let tipHtml = '';
        if (tipOfDay) {
            tipHtml = `
                <div class="divider"></div>
                <div class="dash-tip-content">
                    <span class="dash-tip-topic">${tipOfDay.topic}</span>
                    <span class="dash-tip-advice">${tipOfDay.advice}</span>
                </div>`;
        }

        return `
        <div class="card dash-rest">
            <div class="dash-rest-icon">🧘</div>
            <h3 class="dash-rest-title">Día de descanso</h3>
            <p class="dash-rest-text">Hoy toca recuperar. Hidrátate bien, estira si te apetece, y descansa.</p>
            ${tipHtml}
        </div>`;
    },

    async renderSessionCard(session, todayData, todayLog, allExercises) {
        const isRunning = session.type === 'running';
        const isCycling = session.type === 'cycling';
        const isStrength = session.type === 'strength';
        const isStrengthUpper = session.type === 'strength_upper';
        const isStrengthLower = session.type === 'strength_lower';
        const icon = isRunning ? '🏃' : isCycling ? '🚴' : isStrengthUpper ? '💪' : isStrengthLower ? '🦵' : isStrength ? '💪' : '🧘';
        const badgeClass = isRunning ? 'badge-running' : isCycling ? 'badge-cycling' : (isStrength || isStrengthUpper || isStrengthLower) ? 'badge-strength' : 'badge-rest';
        const typeLabel = isRunning ? 'Carrera' : isCycling ? 'Ciclismo' : isStrengthUpper ? 'Fuerza superior' : isStrengthLower ? 'Fuerza inferior' : isStrength ? 'Fuerza' : 'Otro';
        const isCompleted = session.completed || (todayLog && todayLog.actual && todayLog.actual.completed);

        // Build expandable details
        let detailsHtml = '';

        if (isRunning && session.details) {
            detailsHtml = `
                <div class="dash-session-details">
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

        if (isStrength && session.exerciseGroup && allExercises) {
            let exerciseListHtml = '';
            for (const groupKey of session.exerciseGroup) {
                const group = allExercises[groupKey];
                if (!group || !group.exercises) continue;
                exerciseListHtml += `<div class="dash-exercise-group-name">${group.name}</div>`;
                for (const [, ex] of Object.entries(group.exercises)) {
                    exerciseListHtml += `
                        <div class="dash-exercise-item">
                            <span class="dash-exercise-name">${ex.name}</span>
                            <span class="dash-exercise-sets">${ex.sets} x ${ex.reps}</span>
                        </div>`;
                }
            }
            detailsHtml = `<div class="dash-session-details">${exerciseListHtml}</div>`;
        }

        // Completed log summary
        let logSummaryHtml = '';
        if (isCompleted && todayLog && todayLog.actual) {
            const a = todayLog.actual;
            logSummaryHtml = `
                <div class="divider"></div>
                <div class="dash-log-summary">
                    <div class="dash-log-badge">✅ Registrado</div>
                    <div class="dash-log-stats">
                        ${a.distance_km ? `<div class="dash-log-stat"><span class="dash-log-stat-value">${a.distance_km}</span><span class="dash-log-stat-label">km</span></div>` : ''}
                        ${a.duration ? `<div class="dash-log-stat"><span class="dash-log-stat-value">${a.duration}</span><span class="dash-log-stat-label">tiempo</span></div>` : ''}
                        ${a.pace_avg ? `<div class="dash-log-stat"><span class="dash-log-stat-value">${a.pace_avg}</span><span class="dash-log-stat-label">ritmo</span></div>` : ''}
                        ${a.heart_rate_avg ? `<div class="dash-log-stat"><span class="dash-log-stat-value">${a.heart_rate_avg}</span><span class="dash-log-stat-label">FC</span></div>` : ''}
                    </div>
                </div>`;
        }

        // Action button
        const actionBtn = isCompleted
            ? ''
            : `<button class="btn btn-primary btn-full dash-register-btn" data-session-id="${session.id}">📝 Registrar entrenamiento</button>`;

        return `
        <div class="card dash-session" data-expandable>
            <div class="expandable-header" data-toggle="expand">
                <div class="dash-session-header">
                    <span class="dash-session-icon">${icon}</span>
                    <div class="dash-session-info">
                        <div class="dash-session-title">${session.title}</div>
                        <div class="dash-session-meta">
                            <span class="badge ${badgeClass}">${typeLabel}</span>
                            <span class="text-sm text-muted">${session.duration}</span>
                            ${isCompleted ? '<span class="text-success text-sm fw-bold">✓ Completado</span>' : ''}
                        </div>
                    </div>
                </div>
                <span class="expand-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                </span>
            </div>
            <div class="expandable-body">
                ${detailsHtml}
                ${logSummaryHtml}
                ${actionBtn}
            </div>
        </div>`;
    },

    mount() {
        // Expandable cards
        document.querySelectorAll('[data-toggle="expand"]').forEach(header => {
            header.addEventListener('click', () => {
                header.classList.toggle('expanded');
                const body = header.nextElementSibling;
                body.classList.toggle('open');
            });
        });

        // Register workout buttons
        document.querySelectorAll('.dash-register-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                Router.navigate('workout-log');
            });
        });
    }
};

// Register with router
Router.registerView('dashboard', DashboardView);
