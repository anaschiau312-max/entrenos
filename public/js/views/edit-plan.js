// Edit Plan View — Available to all authenticated users
// Allows editing weekly plan sessions and exercise library

const EditPlanView = {

    state: {
        plan: null,
        phases: null,
        allExercises: null,
        currentWeekNum: null,
        activeTab: 'plan', // 'plan' or 'exercises'
        exerciseGroup: 'tren_inferior',
        dirty: false
    },

    async render() {
        const s = this.state;
        const [plan, phases, allExercises] = await Promise.all([
            DB.getPlan(),
            DB.getPhases(),
            DB.getAllExercises()
        ]);
        s.plan = plan;
        s.phases = phases || {};
        s.allExercises = allExercises || {};
        s.dirty = false;

        if (!s.currentWeekNum) {
            const cw = await DB.getCurrentWeek();
            s.currentWeekNum = cw ? cw.weekNumber : 4;
        }

        return this.renderPage();
    },

    renderAccessDenied() {
        return `
        <div class="ep-denied">
            <div class="empty-state">
                <div class="empty-state-icon">🔒</div>
                <p class="empty-state-text">Solo el entrenador puede editar el plan.</p>
                <button class="btn btn-primary mt-16" id="ep-go-back">Volver al dashboard</button>
            </div>
        </div>`;
    },

    renderPage() {
        const s = this.state;
        const tabs = [
            { key: 'plan', icon: '📋', label: 'Plan semanal' },
            { key: 'exercises', icon: '💪', label: 'Ejercicios' }
        ];

        let tabsHtml = '';
        for (const t of tabs) {
            const active = t.key === s.activeTab ? 'active' : '';
            tabsHtml += `<button class="ep-tab ${active}" data-tab="${t.key}">${t.icon} ${t.label}</button>`;
        }

        let contentHtml = '';
        if (s.activeTab === 'plan') {
            contentHtml = this.renderPlanEditor();
        } else {
            contentHtml = this.renderExerciseEditor();
        }

        return `
        <div class="ep-header">
            <h1 class="section-title">Editar plan</h1>
        </div>

        <div class="ep-tabs">
            ${tabsHtml}
        </div>

        <div id="ep-content">
            ${contentHtml}
        </div>`;
    },

    // ========== PLAN EDITOR ==========

    renderPlanEditor() {
        const s = this.state;
        const weekId = `week_${String(s.currentWeekNum).padStart(2, '0')}`;
        const week = s.plan && s.plan.weeks ? s.plan.weeks[weekId] : null;

        const phaseKey = week ? week.phase : '';
        const phase = s.phases[phaseKey];
        const phaseColor = phase ? phase.color : '#a0a0b0';
        const phaseName = phase ? phase.name : '';

        // Week selector
        let html = `
        <div class="week-selector">
            <button class="week-selector-btn" id="epWeekPrev">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div class="week-selector-info">
                <span class="week-selector-label">Semana ${s.currentWeekNum}</span>
                <span class="badge badge-phase" style="background-color: ${phaseColor}20; color: ${phaseColor};">${phaseName}</span>
            </div>
            <button class="week-selector-btn" id="epWeekNext">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
        </div>`;

        if (!week || !week.days) {
            html += '<div class="empty-state"><div class="empty-state-icon">📅</div><p class="empty-state-text">No hay datos para esta semana.</p></div>';
            return html;
        }

        const sortedDates = Object.keys(week.days).sort();

        for (const dateStr of sortedDates) {
            const day = week.days[dateStr];
            const dateObj = Utils.parseDate(dateStr);
            const dayName = Utils.getDayName(dateObj);
            const dayNum = dateObj.getDate();
            const monthShort = Utils.getMonthName(dateObj.getMonth()).substring(0, 3);
            const sessions = day.sessions || [];

            html += `
            <div class="card ep-day-card" data-week="${weekId}" data-date="${dateStr}">
                <div class="ep-day-header">
                    <span class="ep-day-name">${dayName} ${dayNum} ${monthShort}</span>
                </div>

                <div class="ep-day-fields">
                    <div class="ep-field-row">
                        <label class="ep-field-label">Horario trabajo</label>
                        <input type="text" class="form-control ep-input-sm ep-work-schedule" data-date="${dateStr}" placeholder="Ej: 9:00-22:00" value="${day.workSchedule || ''}">
                    </div>
                    <div class="ep-field-row">
                        <label class="ep-field-label">Momento ideal</label>
                        <input type="text" class="form-control ep-input-sm ep-best-moment" data-date="${dateStr}" placeholder="Ej: Mañana antes del trabajo" value="${day.bestMoment || ''}">
                    </div>
                </div>

                <div class="ep-sessions" data-date="${dateStr}">
                    ${sessions.map((ses, i) => this.renderSessionEditor(weekId, dateStr, ses, i)).join('')}
                </div>

                <button class="btn btn-secondary ep-add-session-btn" data-week="${weekId}" data-date="${dateStr}">
                    ➕ Añadir sesión
                </button>
            </div>`;
        }

        html += `
        <button class="btn btn-primary btn-full ep-save-btn" id="ep-save-plan">
            💾 Guardar cambios
        </button>
        <div class="ep-confirm" id="ep-confirm-plan" style="display:none;">
            <div class="wl-confirm-icon">✅</div>
            <p class="wl-confirm-text">¡Plan actualizado correctamente!</p>
        </div>`;

        return html;
    },

    renderSessionEditor(weekId, dateStr, session, index) {
        const isRunning = session.type === 'running';
        const isCycling = session.type === 'cycling';
        const isStrength = session.type === 'strength';

        // Exercise group selector for strength
        const exerciseGroups = ['tren_inferior', 'tren_superior', 'pliometria'];
        const groupLabels = { tren_inferior: 'Tren Inferior', tren_superior: 'Tren Superior', pliometria: 'Pliometría' };

        let groupSelectHtml = '';
        if (isStrength) {
            const currentGroups = session.exerciseGroup || [];
            groupSelectHtml = '<div class="ep-field-row"><label class="ep-field-label">Grupos de ejercicios</label><div class="ep-group-checks">';
            for (const g of exerciseGroups) {
                const checked = currentGroups.includes(g) ? 'checked' : '';
                groupSelectHtml += `<label class="ep-check-label"><input type="checkbox" class="ep-ex-group-check" data-date="${dateStr}" data-idx="${index}" value="${g}" ${checked}> ${groupLabels[g]}</label>`;
            }
            groupSelectHtml += '</div></div>';
        }

        // Running details
        let detailsHtml = '';
        if (isRunning || isCycling) {
            const d = session.details || {};
            detailsHtml = `
            <div class="ep-session-details">
                <div class="ep-field-row">
                    <label class="ep-field-label">Calentamiento</label>
                    <input type="text" class="form-control ep-input-sm ep-ses-warmup" data-date="${dateStr}" data-idx="${index}" value="${d.warmup || ''}">
                </div>
                <div class="ep-field-row">
                    <label class="ep-field-label">Principal</label>
                    <textarea class="form-control ep-input-sm ep-ses-main" data-date="${dateStr}" data-idx="${index}" rows="2">${d.main || ''}</textarea>
                </div>
                <div class="ep-field-row">
                    <label class="ep-field-label">Vuelta a la calma</label>
                    <input type="text" class="form-control ep-input-sm ep-ses-cooldown" data-date="${dateStr}" data-idx="${index}" value="${d.cooldown || ''}">
                </div>
            </div>`;
        }

        return `
        <div class="ep-session" data-date="${dateStr}" data-index="${index}">
            <div class="ep-session-header-row">
                <span class="ep-session-num">#${index + 1}</span>
                <button class="ep-session-delete" data-week="${weekId}" data-date="${dateStr}" data-session-id="${session.id || ''}" title="Eliminar sesión">🗑️</button>
            </div>

            <div class="ep-session-fields">
                <div class="ep-field-row">
                    <label class="ep-field-label">Tipo</label>
                    <select class="form-control ep-input-sm ep-ses-type" data-date="${dateStr}" data-idx="${index}">
                        <option value="running" ${session.type === 'running' ? 'selected' : ''}>🏃 Carrera</option>
                        <option value="cycling" ${session.type === 'cycling' ? 'selected' : ''}>🚴 Ciclismo</option>
                        <option value="strength" ${session.type === 'strength' ? 'selected' : ''}>💪 Fuerza</option>
                        <option value="rest" ${session.type === 'rest' ? 'selected' : ''}>🧘 Descanso activo</option>
                        <option value="mobility" ${session.type === 'mobility' ? 'selected' : ''}>🔄 Movilidad</option>
                    </select>
                </div>
                <div class="ep-field-row">
                    <label class="ep-field-label">Título</label>
                    <input type="text" class="form-control ep-input-sm ep-ses-title" data-date="${dateStr}" data-idx="${index}" value="${session.title || ''}" placeholder="Ej: Rodaje suave">
                </div>
                <div class="ep-field-row">
                    <label class="ep-field-label">Duración</label>
                    <input type="text" class="form-control ep-input-sm ep-ses-duration" data-date="${dateStr}" data-idx="${index}" value="${session.duration || ''}" placeholder="Ej: 40-45'">
                </div>
                <div class="ep-field-row">
                    <label class="ep-field-label">Descripción</label>
                    <textarea class="form-control ep-input-sm ep-ses-description" data-date="${dateStr}" data-idx="${index}" rows="2" placeholder="Descripción...">${session.description || ''}</textarea>
                </div>
                <div class="ep-field-row">
                    <label class="ep-field-label">Notas</label>
                    <input type="text" class="form-control ep-input-sm ep-ses-notes" data-date="${dateStr}" data-idx="${index}" value="${session.notes || ''}" placeholder="Notas...">
                </div>
                ${groupSelectHtml}
                ${detailsHtml}
            </div>
        </div>`;
    },

    // ========== EXERCISE EDITOR ==========

    renderExerciseEditor() {
        const s = this.state;
        const groups = [
            { key: 'tren_inferior', label: '🦵 Tren Inferior' },
            { key: 'tren_superior', label: '💪 Tren Superior' },
            { key: 'pliometria', label: '⚡ Pliometría' }
        ];

        let groupTabsHtml = '';
        for (const g of groups) {
            const active = g.key === s.exerciseGroup ? 'active' : '';
            groupTabsHtml += `<button class="ep-group-tab ${active}" data-group="${g.key}">${g.label}</button>`;
        }

        const groupData = s.allExercises[s.exerciseGroup];
        let exercisesHtml = '';

        if (groupData && groupData.exercises) {
            for (const [exId, ex] of Object.entries(groupData.exercises)) {
                exercisesHtml += `
                <div class="card ep-exercise-card" data-ex-id="${exId}" data-group="${s.exerciseGroup}">
                    <div class="ep-exercise-header-row">
                        <span class="ep-exercise-id text-xs text-muted">${exId}</span>
                        <button class="ep-exercise-delete" data-group="${s.exerciseGroup}" data-ex-id="${exId}" title="Eliminar">🗑️</button>
                    </div>
                    <div class="ep-field-row">
                        <label class="ep-field-label">Nombre</label>
                        <input type="text" class="form-control ep-input-sm ep-ex-name" data-group="${s.exerciseGroup}" data-ex-id="${exId}" value="${ex.name || ''}">
                    </div>
                    <div class="ep-exercise-inline">
                        <div class="ep-field-row">
                            <label class="ep-field-label">Series</label>
                            <input type="text" class="form-control ep-input-sm ep-ex-sets" data-group="${s.exerciseGroup}" data-ex-id="${exId}" value="${ex.sets || ''}" placeholder="3">
                        </div>
                        <div class="ep-field-row">
                            <label class="ep-field-label">Reps</label>
                            <input type="text" class="form-control ep-input-sm ep-ex-reps" data-group="${s.exerciseGroup}" data-ex-id="${exId}" value="${ex.reps || ''}" placeholder="10-12">
                        </div>
                        <div class="ep-field-row">
                            <label class="ep-field-label">Descanso</label>
                            <input type="text" class="form-control ep-input-sm ep-ex-rest" data-group="${s.exerciseGroup}" data-ex-id="${exId}" value="${ex.rest || ''}" placeholder="60s">
                        </div>
                    </div>
                    <div class="ep-field-row">
                        <label class="ep-field-label">Tips</label>
                        <input type="text" class="form-control ep-input-sm ep-ex-tips" data-group="${s.exerciseGroup}" data-ex-id="${exId}" value="${ex.tips || ''}" placeholder="Indicaciones...">
                    </div>
                </div>`;
            }
        }

        return `
        <div class="ep-group-tabs">
            ${groupTabsHtml}
        </div>

        <div class="ep-exercises-list" id="ep-exercises-list">
            ${exercisesHtml}
        </div>

        <button class="btn btn-secondary btn-full ep-add-exercise-btn" id="ep-add-exercise" data-group="${s.exerciseGroup}">
            ➕ Añadir ejercicio
        </button>

        <button class="btn btn-primary btn-full ep-save-btn" id="ep-save-exercises">
            💾 Guardar ejercicios
        </button>
        <div class="ep-confirm" id="ep-confirm-exercises" style="display:none;">
            <div class="wl-confirm-icon">✅</div>
            <p class="wl-confirm-text">¡Ejercicios actualizados!</p>
        </div>`;
    },

    // ========== MOUNT ==========

    mount() {
        // Access denied — go back
        const goBack = document.getElementById('ep-go-back');
        if (goBack) {
            goBack.addEventListener('click', () => Router.navigate('dashboard'));
            return;
        }

        // Tab switching
        document.querySelectorAll('.ep-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.state.activeTab = e.currentTarget.dataset.tab;
                document.querySelectorAll('.ep-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const content = document.getElementById('ep-content');
                content.innerHTML = this.state.activeTab === 'plan' ? this.renderPlanEditor() : this.renderExerciseEditor();
                this.mountContent();
            });
        });

        this.mountContent();
    },

    mountContent() {
        if (this.state.activeTab === 'plan') {
            this.mountPlanEditor();
        } else {
            this.mountExerciseEditor();
        }
    },

    // ========== PLAN EDITOR EVENTS ==========

    mountPlanEditor() {
        // Week navigation
        const prevBtn = document.getElementById('epWeekPrev');
        const nextBtn = document.getElementById('epWeekNext');
        if (prevBtn) prevBtn.addEventListener('click', () => this.changeWeek(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.changeWeek(1));

        // Delete session
        document.querySelectorAll('.ep-session-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const el = e.currentTarget;
                const sessionEl = el.closest('.ep-session');
                if (confirm('¿Eliminar esta sesión?')) {
                    sessionEl.remove();
                    this.state.dirty = true;
                }
            });
        });

        // Add session
        document.querySelectorAll('.ep-add-session-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const weekId = e.currentTarget.dataset.week;
                const dateStr = e.currentTarget.dataset.date;
                const sessionsContainer = document.querySelector(`.ep-sessions[data-date="${dateStr}"]`);
                const currentCount = sessionsContainer.querySelectorAll('.ep-session').length;

                const newSession = {
                    id: `ses_${dateStr.replace(/-/g, '')}_${currentCount}`,
                    type: 'running',
                    title: '',
                    duration: '',
                    description: '',
                    notes: '',
                    details: { warmup: '', main: '', cooldown: '' }
                };

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = this.renderSessionEditor(weekId, dateStr, newSession, currentCount);
                const newEl = tempDiv.firstElementChild;
                sessionsContainer.appendChild(newEl);

                // Bind delete for new element
                newEl.querySelector('.ep-session-delete').addEventListener('click', (ev) => {
                    ev.preventDefault();
                    if (confirm('¿Eliminar esta sesión?')) newEl.remove();
                });

                this.state.dirty = true;
                newEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });

        // Save plan
        const saveBtn = document.getElementById('ep-save-plan');
        if (saveBtn) saveBtn.addEventListener('click', () => this.handleSavePlan());
    },

    changeWeek(dir) {
        const nw = this.state.currentWeekNum + dir;
        if (nw < 4 || nw > 18) return;
        this.state.currentWeekNum = nw;
        const content = document.getElementById('ep-content');
        content.innerHTML = this.renderPlanEditor();
        this.mountPlanEditor();
    },

    async handleSavePlan() {
        const s = this.state;
        const weekId = `week_${String(s.currentWeekNum).padStart(2, '0')}`;
        const saveBtn = document.getElementById('ep-save-plan');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<div class="spinner"></div> Guardando...';

        try {
            // Collect all day data from the DOM
            const dayCards = document.querySelectorAll('.ep-day-card');

            for (const card of dayCards) {
                const dateStr = card.dataset.date;

                // Work schedule and best moment
                const workSchedule = card.querySelector('.ep-work-schedule').value.trim();
                const bestMoment = card.querySelector('.ep-best-moment').value.trim();

                // Collect sessions
                const sessionEls = card.querySelectorAll('.ep-session');
                const sessions = [];

                sessionEls.forEach((sesEl, idx) => {
                    const dStr = sesEl.dataset.date;
                    const type = card.querySelector(`.ep-ses-type[data-date="${dStr}"][data-idx="${sesEl.dataset.index}"]`)?.value
                              || sesEl.querySelector('.ep-ses-type')?.value || 'running';
                    const title = sesEl.querySelector('.ep-ses-title')?.value || '';
                    const duration = sesEl.querySelector('.ep-ses-duration')?.value || '';
                    const description = sesEl.querySelector('.ep-ses-description')?.value || '';
                    const notes = sesEl.querySelector('.ep-ses-notes')?.value || '';

                    const session = {
                        id: `ses_${dateStr.replace(/-/g, '')}_${idx}`,
                        type,
                        title: title.trim(),
                        duration: duration.trim(),
                        description: description.trim(),
                        notes: notes.trim()
                    };

                    if (type === 'running') {
                        session.details = {
                            warmup: sesEl.querySelector('.ep-ses-warmup')?.value?.trim() || '',
                            main: sesEl.querySelector('.ep-ses-main')?.value?.trim() || '',
                            cooldown: sesEl.querySelector('.ep-ses-cooldown')?.value?.trim() || ''
                        };
                    }

                    if (type === 'strength') {
                        const checkedGroups = sesEl.querySelectorAll('.ep-ex-group-check:checked');
                        session.exerciseGroup = Array.from(checkedGroups).map(cb => cb.value);
                    }

                    sessions.push(session);
                });

                // Write day data to Firebase
                const dayPath = `plan/weeks/${weekId}/days/${dateStr}`;
                const dayData = { sessions };
                if (workSchedule) dayData.workSchedule = workSchedule;
                if (bestMoment) dayData.bestMoment = bestMoment;

                await db.ref(dayPath).set(dayData);
            }

            // Invalidate caches
            Offline.removeCache('plan');
            Offline.removeCache(`week_${weekId}`);

            saveBtn.style.display = 'none';
            document.getElementById('ep-confirm-plan').style.display = 'block';
            this.state.dirty = false;

            // Re-enable after 3s
            setTimeout(() => {
                saveBtn.style.display = '';
                saveBtn.disabled = false;
                saveBtn.innerHTML = '💾 Guardar cambios';
                document.getElementById('ep-confirm-plan').style.display = 'none';
            }, 3000);

        } catch (err) {
            console.error('Error saving plan:', err);
            saveBtn.disabled = false;
            saveBtn.innerHTML = '💾 Guardar cambios';
            alert('Error al guardar el plan. Inténtalo de nuevo.');
        }
    },

    // ========== EXERCISE EDITOR EVENTS ==========

    mountExerciseEditor() {
        // Group tabs
        document.querySelectorAll('.ep-group-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.state.exerciseGroup = e.currentTarget.dataset.group;
                const content = document.getElementById('ep-content');
                content.innerHTML = this.renderExerciseEditor();
                this.mountExerciseEditor();
            });
        });

        // Delete exercise
        document.querySelectorAll('.ep-exercise-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('¿Eliminar este ejercicio?')) {
                    e.currentTarget.closest('.ep-exercise-card').remove();
                }
            });
        });

        // Add exercise
        const addBtn = document.getElementById('ep-add-exercise');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const group = this.state.exerciseGroup;
                const id = `new_${Date.now()}`;
                const list = document.getElementById('ep-exercises-list');

                const cardHtml = `
                <div class="card ep-exercise-card" data-ex-id="${id}" data-group="${group}">
                    <div class="ep-exercise-header-row">
                        <span class="ep-exercise-id text-xs text-muted">${id}</span>
                        <button class="ep-exercise-delete" data-group="${group}" data-ex-id="${id}" title="Eliminar">🗑️</button>
                    </div>
                    <div class="ep-field-row">
                        <label class="ep-field-label">Nombre</label>
                        <input type="text" class="form-control ep-input-sm ep-ex-name" data-group="${group}" data-ex-id="${id}" value="" placeholder="Nombre del ejercicio">
                    </div>
                    <div class="ep-exercise-inline">
                        <div class="ep-field-row">
                            <label class="ep-field-label">Series</label>
                            <input type="text" class="form-control ep-input-sm ep-ex-sets" data-group="${group}" data-ex-id="${id}" value="" placeholder="3">
                        </div>
                        <div class="ep-field-row">
                            <label class="ep-field-label">Reps</label>
                            <input type="text" class="form-control ep-input-sm ep-ex-reps" data-group="${group}" data-ex-id="${id}" value="" placeholder="10-12">
                        </div>
                        <div class="ep-field-row">
                            <label class="ep-field-label">Descanso</label>
                            <input type="text" class="form-control ep-input-sm ep-ex-rest" data-group="${group}" data-ex-id="${id}" value="" placeholder="60s">
                        </div>
                    </div>
                    <div class="ep-field-row">
                        <label class="ep-field-label">Tips</label>
                        <input type="text" class="form-control ep-input-sm ep-ex-tips" data-group="${group}" data-ex-id="${id}" value="" placeholder="Indicaciones...">
                    </div>
                </div>`;

                const temp = document.createElement('div');
                temp.innerHTML = cardHtml;
                const newCard = temp.firstElementChild;
                list.appendChild(newCard);

                newCard.querySelector('.ep-exercise-delete').addEventListener('click', () => {
                    if (confirm('¿Eliminar este ejercicio?')) newCard.remove();
                });

                newCard.querySelector('.ep-ex-name').focus();
                newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }

        // Save exercises
        const saveBtn = document.getElementById('ep-save-exercises');
        if (saveBtn) saveBtn.addEventListener('click', () => this.handleSaveExercises());
    },

    async handleSaveExercises() {
        const group = this.state.exerciseGroup;
        const saveBtn = document.getElementById('ep-save-exercises');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<div class="spinner"></div> Guardando...';

        try {
            const cards = document.querySelectorAll(`.ep-exercise-card[data-group="${group}"]`);
            const exercises = {};

            cards.forEach(card => {
                const exId = card.dataset.exId;
                const name = card.querySelector('.ep-ex-name')?.value?.trim() || '';
                if (!name) return; // Skip empty

                exercises[exId] = {
                    name,
                    sets: card.querySelector('.ep-ex-sets')?.value?.trim() || '',
                    reps: card.querySelector('.ep-ex-reps')?.value?.trim() || '',
                    rest: card.querySelector('.ep-ex-rest')?.value?.trim() || '',
                    tips: card.querySelector('.ep-ex-tips')?.value?.trim() || '',
                    image: `img/exercises/${exId}.gif`,
                    videoUrl: ''
                };
            });

            await db.ref(`exercises/${group}/exercises`).set(exercises);

            // Invalidate cache
            Offline.removeCache('exercises_all');
            Offline.removeCache(`exercises_${group}`);

            // Update local state
            if (this.state.allExercises[group]) {
                this.state.allExercises[group].exercises = exercises;
            }

            saveBtn.style.display = 'none';
            document.getElementById('ep-confirm-exercises').style.display = 'block';

            setTimeout(() => {
                saveBtn.style.display = '';
                saveBtn.disabled = false;
                saveBtn.innerHTML = '💾 Guardar ejercicios';
                document.getElementById('ep-confirm-exercises').style.display = 'none';
            }, 3000);

        } catch (err) {
            console.error('Error saving exercises:', err);
            saveBtn.disabled = false;
            saveBtn.innerHTML = '💾 Guardar ejercicios';
            alert('Error al guardar ejercicios. Inténtalo de nuevo.');
        }
    }
};

// Register with router
Router.registerView('edit-plan', EditPlanView);
