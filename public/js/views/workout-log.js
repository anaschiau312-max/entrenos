// Workout Log View — Manual registration form
// Supports running and strength session types

const WorkoutLogView = {

    state: {
        selectedDate: null,
        dayData: null,
        sessions: [],
        allExercises: null,
        existingLog: null,
        activeSessionIndex: 0
    },

    async render() {
        const s = this.state;
        s.selectedDate = Utils.formatDate(new Date());
        s.allExercises = await DB.getAllExercises();

        // Load day data and existing log
        await this.loadDayData();

        return this.renderForm();
    },

    async loadDayData() {
        const s = this.state;
        s.dayData = await DB.getDayData(s.selectedDate);
        s.sessions = (s.dayData && s.dayData.day && s.dayData.day.sessions) ? s.dayData.day.sessions : [];

        // Check for existing log
        const uid = window.currentUser.uid;
        const logId = `log_${s.selectedDate.replace(/-/g, '')}`;
        const logs = await DB.getWorkoutLogs(uid);
        s.existingLog = logs ? logs[logId] : null;

        // Pick first uncompleted session, or first one
        s.activeSessionIndex = 0;
        if (s.sessions.length > 1) {
            const idx = s.sessions.findIndex(ses => !ses.completed);
            if (idx !== -1) s.activeSessionIndex = idx;
        }
    },

    renderForm() {
        const s = this.state;
        const dateDisplay = Utils.formatDateDisplay(s.selectedDate);
        const isEditing = !!s.existingLog;

        let html = `
        <div class="wl-header">
            <h1 class="section-title">${isEditing ? 'Editar registro' : 'Registrar entrenamiento'}</h1>
        </div>

        <div class="form-group">
            <label for="wl-date">Fecha</label>
            <input type="date" id="wl-date" class="form-control" value="${s.selectedDate}">
            <div class="wl-date-display text-sm text-muted mt-8">${dateDisplay}</div>
        </div>`;

        // No sessions for this date
        if (s.sessions.length === 0) {
            html += `
            <div class="card wl-no-session">
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <p class="empty-state-text">No hay sesión planificada para este día.</p>
                </div>
            </div>`;
            return html;
        }

        // Session selector tabs (if multiple sessions)
        if (s.sessions.length > 1) {
            html += `<div class="wl-session-tabs">`;
            s.sessions.forEach((ses, i) => {
                const icon = ses.type === 'running' ? '🏃' : '💪';
                const active = i === s.activeSessionIndex ? 'active' : '';
                html += `<button class="wl-session-tab ${active}" data-session-idx="${i}">${icon} ${ses.title}</button>`;
            });
            html += `</div>`;
        }

        // Active session
        const session = s.sessions[s.activeSessionIndex];

        // Reference section
        html += this.renderReference(session);

        // Form fields per type
        if (session.type === 'running') {
            html += this.renderRunningForm(session);
        } else if (session.type === 'strength') {
            html += this.renderStrengthForm(session);
        }

        // Common section
        html += this.renderCommonFields();

        // Save button
        html += `
        <button class="btn btn-primary btn-full wl-save-btn" id="wl-save">
            💾 Guardar registro
        </button>

        <div class="wl-confirm" id="wl-confirm" style="display:none;">
            <div class="wl-confirm-icon">✅</div>
            <p class="wl-confirm-text">¡Registro guardado correctamente!</p>
            <button class="btn btn-secondary btn-full mt-16" id="wl-go-dashboard">Volver al dashboard</button>
        </div>`;

        return html;
    },

    renderReference(session) {
        const icon = session.type === 'running' ? '🏃' : '💪';
        const badgeClass = session.type === 'running' ? 'badge-running' : 'badge-strength';
        const typeLabel = session.type === 'running' ? 'Carrera' : 'Fuerza';

        let detailsHtml = '';
        if (session.type === 'running' && session.details) {
            detailsHtml = `
                <div class="wl-ref-details">
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

        if (session.type === 'strength' && session.exerciseGroup && this.state.allExercises) {
            detailsHtml = '<div class="wl-ref-details">';
            for (const groupKey of session.exerciseGroup) {
                const group = this.state.allExercises[groupKey];
                if (!group || !group.exercises) continue;
                detailsHtml += `<div class="dash-exercise-group-name">${group.name}</div>`;
                for (const [, ex] of Object.entries(group.exercises)) {
                    detailsHtml += `
                        <div class="dash-exercise-item">
                            <span class="dash-exercise-name">${ex.name}</span>
                            <span class="dash-exercise-sets">${ex.sets} x ${ex.reps}</span>
                        </div>`;
                }
            }
            detailsHtml += '</div>';
        }

        return `
        <div class="card wl-reference" data-expandable>
            <div class="expandable-header" data-toggle="expand">
                <div class="wl-ref-header">
                    <span class="wl-ref-icon">${icon}</span>
                    <div class="wl-ref-info">
                        <div class="wl-ref-title">${session.title}</div>
                        <div class="wl-ref-meta">
                            <span class="badge ${badgeClass}">${typeLabel}</span>
                            <span class="text-sm text-muted">${session.duration}</span>
                        </div>
                    </div>
                </div>
                <span class="expand-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                </span>
            </div>
            <div class="expandable-body">
                ${detailsHtml}
            </div>
        </div>`;
    },

    renderRunningForm(session) {
        const log = this.state.existingLog;
        const a = log ? (log.actual || {}) : {};

        // Parse existing duration
        let durH = '', durM = '', durS = '';
        if (a.duration) {
            const parts = a.duration.split(':');
            if (parts.length === 3) { durH = parts[0]; durM = parts[1]; durS = parts[2]; }
            else if (parts.length === 2) { durH = '0'; durM = parts[0]; durS = parts[1]; }
        }

        return `
        <div class="card wl-form-card" id="wl-running-form">
            <div class="card-header">
                <span class="card-title">Datos de carrera</span>
            </div>

            <div class="form-group">
                <label for="wl-distance">Distancia (km)</label>
                <input type="number" id="wl-distance" class="form-control" inputmode="decimal" step="0.01" min="0" placeholder="Ej: 8.5" value="${a.distance_km || ''}">
            </div>

            <div class="form-group">
                <label>Duración</label>
                <div class="wl-duration-inputs">
                    <div class="wl-duration-field">
                        <input type="number" id="wl-dur-h" class="form-control" inputmode="numeric" min="0" max="23" placeholder="HH" value="${durH}">
                        <span class="wl-duration-label">h</span>
                    </div>
                    <span class="wl-duration-sep">:</span>
                    <div class="wl-duration-field">
                        <input type="number" id="wl-dur-m" class="form-control" inputmode="numeric" min="0" max="59" placeholder="MM" value="${durM}">
                        <span class="wl-duration-label">min</span>
                    </div>
                    <span class="wl-duration-sep">:</span>
                    <div class="wl-duration-field">
                        <input type="number" id="wl-dur-s" class="form-control" inputmode="numeric" min="0" max="59" placeholder="SS" value="${durS}">
                        <span class="wl-duration-label">seg</span>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="wl-pace">Ritmo medio (min/km)</label>
                <input type="text" id="wl-pace" class="form-control" placeholder="Ej: 5:30" value="${a.pace_avg || ''}">
                <div class="text-xs text-muted mt-8" id="wl-pace-auto"></div>
            </div>

            <div class="wl-metrics-grid">
                <div class="form-group">
                    <label for="wl-hr">FC media (bpm)</label>
                    <input type="number" id="wl-hr" class="form-control" inputmode="numeric" min="0" max="250" placeholder="Ej: 155" value="${a.heart_rate_avg || ''}">
                </div>
                <div class="form-group">
                    <label for="wl-cadence">Cadencia (ppm)</label>
                    <input type="number" id="wl-cadence" class="form-control" inputmode="numeric" min="0" max="300" placeholder="Ej: 172" value="${a.cadence || ''}">
                </div>
            </div>

            <div class="wl-metrics-grid">
                <div class="form-group">
                    <label for="wl-steps">Pasos totales</label>
                    <input type="number" id="wl-steps" class="form-control" inputmode="numeric" min="0" placeholder="Ej: 8500" value="${a.steps || ''}">
                </div>
                <div class="form-group">
                    <label for="wl-stride">Longitud paso (m)</label>
                    <input type="number" id="wl-stride" class="form-control" inputmode="decimal" step="0.01" min="0" placeholder="Ej: 1.05" value="${a.stride_length || ''}">
                </div>
            </div>

            <div class="wl-metrics-grid">
                <div class="form-group">
                    <label for="wl-elevation">Ascenso total (m)</label>
                    <input type="number" id="wl-elevation" class="form-control" inputmode="numeric" min="0" placeholder="Ej: 120" value="${a.elevation_gain || ''}">
                </div>
                <div class="form-group">
                    <label for="wl-power">Potencia (W)</label>
                    <input type="number" id="wl-power" class="form-control" inputmode="numeric" min="0" placeholder="Ej: 230" value="${a.power || ''}">
                </div>
            </div>

            <div class="wl-advanced-toggle" id="wl-advanced-toggle">
                <span>Datos avanzados</span>
                <span class="expand-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                </span>
            </div>
            <div class="wl-advanced-body" id="wl-advanced-body">
                <div class="form-group">
                    <label for="wl-gct-balance">Equilibrio contacto suelo (%)</label>
                    <input type="text" id="wl-gct-balance" class="form-control" placeholder="Ej: 49.8/50.2" value="${a.gct_balance || ''}">
                </div>
                <div class="form-group">
                    <label for="wl-gct">Tiempo contacto suelo (ms)</label>
                    <input type="number" id="wl-gct" class="form-control" inputmode="numeric" min="0" placeholder="Ej: 245" value="${a.ground_contact_time || ''}">
                </div>
                <div class="form-group">
                    <label for="wl-vo2max">VO2 Max estimado</label>
                    <input type="number" id="wl-vo2max" class="form-control" inputmode="decimal" step="0.1" min="0" placeholder="Ej: 42.5" value="${a.vo2max || ''}">
                </div>
            </div>
        </div>`;
    },

    renderStrengthForm(session) {
        const log = this.state.existingLog;
        const logExercises = log && log.actual ? (log.actual.exercises || {}) : {};
        const allExercises = this.state.allExercises;

        let exercisesHtml = '';

        if (session.exerciseGroup && allExercises) {
            for (const groupKey of session.exerciseGroup) {
                const group = allExercises[groupKey];
                if (!group || !group.exercises) continue;

                exercisesHtml += `<div class="wl-exercise-group-title">${group.name}</div>`;

                for (const [exId, ex] of Object.entries(group.exercises)) {
                    const logEx = logExercises[exId] || {};
                    const isChecked = !!logEx.done;

                    exercisesHtml += `
                    <div class="wl-exercise-item" data-exercise-id="${exId}">
                        <div class="wl-exercise-check-row">
                            <label class="wl-checkbox-label">
                                <input type="checkbox" class="wl-exercise-check" data-ex-id="${exId}" ${isChecked ? 'checked' : ''}>
                                <span class="wl-checkbox-custom"></span>
                                <span class="wl-exercise-name">${ex.name}</span>
                            </label>
                            <span class="text-xs text-muted">${ex.sets} x ${ex.reps}</span>
                        </div>
                        <div class="wl-exercise-fields ${isChecked ? 'open' : ''}" data-fields-for="${exId}">
                            <div class="wl-exercise-inputs">
                                <div class="form-group">
                                    <label>Peso (kg)</label>
                                    <input type="number" class="form-control wl-ex-weight" data-ex-id="${exId}" inputmode="decimal" step="0.5" min="0" placeholder="kg" value="${logEx.weight || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Series</label>
                                    <input type="number" class="form-control wl-ex-sets" data-ex-id="${exId}" inputmode="numeric" min="0" max="20" placeholder="3" value="${logEx.sets || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Reps</label>
                                    <input type="number" class="form-control wl-ex-reps" data-ex-id="${exId}" inputmode="numeric" min="0" max="100" placeholder="10" value="${logEx.reps || ''}">
                                </div>
                            </div>
                            <div class="form-group">
                                <input type="text" class="form-control wl-ex-notes" data-ex-id="${exId}" placeholder="Notas del ejercicio..." value="${logEx.notes || ''}">
                            </div>
                        </div>
                    </div>`;
                }
            }
        }

        return `
        <div class="card wl-form-card" id="wl-strength-form">
            <div class="card-header">
                <span class="card-title">Ejercicios realizados</span>
            </div>
            ${exercisesHtml}
        </div>`;
    },

    renderCommonFields() {
        const log = this.state.existingLog;
        const feeling = log ? (log.feeling || '') : '';
        const rpe = log ? (log.rpe || 5) : 5;
        const notes = log ? (log.notes || '') : '';

        const feelings = [
            { value: 'muy_duro', emoji: '😫', label: 'Muy duro' },
            { value: 'normal', emoji: '😐', label: 'Normal' },
            { value: 'bien', emoji: '😊', label: 'Bien' },
            { value: 'genial', emoji: '😁', label: 'Genial' },
            { value: 'increible', emoji: '🔥', label: 'Increíble' }
        ];

        let feelingHtml = '';
        for (const f of feelings) {
            const selected = feeling === f.value ? 'selected' : '';
            feelingHtml += `
                <button class="wl-feeling-btn ${selected}" data-feeling="${f.value}">
                    <span class="wl-feeling-emoji">${f.emoji}</span>
                    <span class="wl-feeling-label">${f.label}</span>
                </button>`;
        }

        return `
        <div class="card wl-form-card">
            <div class="card-header">
                <span class="card-title">¿Cómo te has sentido?</span>
            </div>

            <div class="form-group">
                <div class="wl-feeling-row">
                    ${feelingHtml}
                </div>
                <input type="hidden" id="wl-feeling" value="${feeling}">
            </div>

            <div class="form-group">
                <label for="wl-rpe">RPE (Esfuerzo percibido): <strong id="wl-rpe-value">${rpe}</strong>/10</label>
                <div class="wl-rpe-container">
                    <span class="wl-rpe-label-end">Fácil</span>
                    <input type="range" id="wl-rpe" class="wl-rpe-slider" min="1" max="10" step="1" value="${rpe}">
                    <span class="wl-rpe-label-end">Máximo</span>
                </div>
                <div class="wl-rpe-marks">
                    ${[1,2,3,4,5,6,7,8,9,10].map(n => `<span class="wl-rpe-mark">${n}</span>`).join('')}
                </div>
            </div>

            <div class="form-group">
                <label for="wl-notes">Notas</label>
                <textarea id="wl-notes" class="form-control" rows="3" placeholder="¿Algo que destacar del entrenamiento?">${notes}</textarea>
            </div>
        </div>`;
    },

    mount() {
        // Date change
        const dateInput = document.getElementById('wl-date');
        if (dateInput) {
            dateInput.addEventListener('change', async (e) => {
                this.state.selectedDate = e.target.value;
                await this.loadDayData();
                document.getElementById('main-content').querySelector('.view-container').innerHTML = this.renderForm();
                this.mount();
            });
        }

        // Session tabs
        document.querySelectorAll('.wl-session-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.state.activeSessionIndex = parseInt(e.currentTarget.dataset.sessionIdx);
                document.getElementById('main-content').querySelector('.view-container').innerHTML = this.renderForm();
                this.mount();
            });
        });

        // Expandable reference
        document.querySelectorAll('[data-toggle="expand"]').forEach(header => {
            header.addEventListener('click', () => {
                header.classList.toggle('expanded');
                const body = header.nextElementSibling;
                body.classList.toggle('open');
            });
        });

        // Running form: auto pace calculation
        const distInput = document.getElementById('wl-distance');
        const durHInput = document.getElementById('wl-dur-h');
        const durMInput = document.getElementById('wl-dur-m');
        const durSInput = document.getElementById('wl-dur-s');
        const paceInput = document.getElementById('wl-pace');

        if (distInput && durHInput) {
            const calcPace = () => {
                const dist = parseFloat(distInput.value);
                const h = parseInt(durHInput.value) || 0;
                const m = parseInt(durMInput.value) || 0;
                const s = parseInt(durSInput.value) || 0;
                const totalSec = h * 3600 + m * 60 + s;

                if (dist > 0 && totalSec > 0) {
                    const duration = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                    const pace = Utils.calculatePace(dist, duration);
                    if (pace) {
                        document.getElementById('wl-pace-auto').textContent = `Calculado: ${pace} min/km`;
                        // Only auto-fill if pace field is empty or was auto-filled
                        if (!paceInput.dataset.manual) {
                            paceInput.value = pace;
                        }
                    }
                } else {
                    document.getElementById('wl-pace-auto').textContent = '';
                }
            };

            distInput.addEventListener('input', calcPace);
            durHInput.addEventListener('input', calcPace);
            durMInput.addEventListener('input', calcPace);
            durSInput.addEventListener('input', calcPace);

            // Mark pace as manually edited
            paceInput.addEventListener('input', () => {
                paceInput.dataset.manual = 'true';
            });
        }

        // Advanced toggle
        const advToggle = document.getElementById('wl-advanced-toggle');
        const advBody = document.getElementById('wl-advanced-body');
        if (advToggle && advBody) {
            advToggle.addEventListener('click', () => {
                advToggle.classList.toggle('expanded');
                advBody.classList.toggle('open');
            });
        }

        // Strength checkboxes — toggle fields
        document.querySelectorAll('.wl-exercise-check').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const exId = e.target.dataset.exId;
                const fields = document.querySelector(`[data-fields-for="${exId}"]`);
                if (fields) {
                    fields.classList.toggle('open', e.target.checked);
                }
            });
        });

        // Feeling selector
        document.querySelectorAll('.wl-feeling-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.wl-feeling-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                document.getElementById('wl-feeling').value = btn.dataset.feeling;
            });
        });

        // RPE slider
        const rpeSlider = document.getElementById('wl-rpe');
        const rpeValue = document.getElementById('wl-rpe-value');
        if (rpeSlider && rpeValue) {
            rpeSlider.addEventListener('input', () => {
                rpeValue.textContent = rpeSlider.value;
            });
        }

        // Save button
        const saveBtn = document.getElementById('wl-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
        }

        // Go to dashboard
        const dashBtn = document.getElementById('wl-go-dashboard');
        if (dashBtn) {
            dashBtn.addEventListener('click', () => Router.navigate('dashboard'));
        }
    },

    async handleSave() {
        const s = this.state;
        const session = s.sessions[s.activeSessionIndex];
        if (!session) return;

        const saveBtn = document.getElementById('wl-save');
        const errorMsg = this.validate(session);
        if (errorMsg) {
            this.showError(errorMsg);
            return;
        }

        // Disable button, show loading
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<div class="spinner"></div> Guardando...';

        try {
            const logData = this.collectFormData(session);
            await DB.saveWorkoutLog(window.currentUser.uid, logData);

            // Show confirmation
            saveBtn.style.display = 'none';
            document.getElementById('wl-confirm').style.display = 'block';

            // Scroll to confirmation
            document.getElementById('wl-confirm').scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (err) {
            console.error('Error saving workout log:', err);
            saveBtn.disabled = false;
            saveBtn.innerHTML = '💾 Guardar registro';
            this.showError('Error al guardar. Inténtalo de nuevo.');
        }
    },

    validate(session) {
        if (session.type === 'running') {
            const dist = parseFloat(document.getElementById('wl-distance').value);
            const h = parseInt(document.getElementById('wl-dur-h').value) || 0;
            const m = parseInt(document.getElementById('wl-dur-m').value) || 0;
            const sec = parseInt(document.getElementById('wl-dur-s').value) || 0;
            if (!dist || dist <= 0) return 'Introduce la distancia recorrida.';
            if (h + m + sec === 0) return 'Introduce la duración del entrenamiento.';
        }

        if (session.type === 'strength') {
            const checked = document.querySelectorAll('.wl-exercise-check:checked');
            if (checked.length === 0) return 'Marca al menos un ejercicio como realizado.';
        }

        return null;
    },

    collectFormData(session) {
        const s = this.state;

        const base = {
            date: s.selectedDate,
            sessionId: session.id,
            weekId: s.dayData ? s.dayData.weekId : null,
            sessionType: session.type,
            planned: {
                title: session.title,
                type: session.type,
                duration: session.duration
            }
        };

        if (session.type === 'running') {
            const h = parseInt(document.getElementById('wl-dur-h').value) || 0;
            const m = parseInt(document.getElementById('wl-dur-m').value) || 0;
            const sec = parseInt(document.getElementById('wl-dur-s').value) || 0;
            const duration = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

            base.actual = {
                completed: true,
                distance_km: parseFloat(document.getElementById('wl-distance').value) || 0,
                duration,
                pace_avg: document.getElementById('wl-pace').value || null,
                heart_rate_avg: parseInt(document.getElementById('wl-hr').value) || null,
                cadence: parseInt(document.getElementById('wl-cadence').value) || null,
                steps: parseInt(document.getElementById('wl-steps').value) || null,
                stride_length: parseFloat(document.getElementById('wl-stride').value) || null,
                elevation_gain: parseInt(document.getElementById('wl-elevation').value) || null,
                power: parseInt(document.getElementById('wl-power').value) || null,
                gct_balance: document.getElementById('wl-gct-balance').value || null,
                ground_contact_time: parseInt(document.getElementById('wl-gct').value) || null,
                vo2max: parseFloat(document.getElementById('wl-vo2max').value) || null
            };
        }

        if (session.type === 'strength') {
            const exercises = {};
            document.querySelectorAll('.wl-exercise-check:checked').forEach(cb => {
                const exId = cb.dataset.exId;
                exercises[exId] = {
                    done: true,
                    weight: parseFloat(document.querySelector(`.wl-ex-weight[data-ex-id="${exId}"]`).value) || null,
                    sets: parseInt(document.querySelector(`.wl-ex-sets[data-ex-id="${exId}"]`).value) || null,
                    reps: parseInt(document.querySelector(`.wl-ex-reps[data-ex-id="${exId}"]`).value) || null,
                    notes: document.querySelector(`.wl-ex-notes[data-ex-id="${exId}"]`).value || ''
                };
            });

            base.actual = {
                completed: true,
                exercises
            };
        }

        // Common fields
        base.feeling = document.getElementById('wl-feeling').value || null;
        base.rpe = parseInt(document.getElementById('wl-rpe').value) || null;
        base.notes = document.getElementById('wl-notes').value || '';

        return base;
    },

    showError(msg) {
        // Remove any existing error
        const existing = document.querySelector('.wl-error');
        if (existing) existing.remove();

        const saveBtn = document.getElementById('wl-save');
        const errDiv = document.createElement('div');
        errDiv.className = 'wl-error';
        errDiv.textContent = msg;
        saveBtn.parentNode.insertBefore(errDiv, saveBtn);

        setTimeout(() => errDiv.remove(), 4000);
    }
};

// Register with router
Router.registerView('workout-log', WorkoutLogView);
