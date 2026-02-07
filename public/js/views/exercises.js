// Exercises View — Exercise library with categorized tabs

const ExercisesView = {

    state: {
        allExercises: null,
        activeTab: 'tren_inferior'
    },

    categories: [
        { key: 'tren_inferior', icon: '🦵', label: 'Tren Inferior' },
        { key: 'tren_superior', icon: '💪', label: 'Tren Superior' },
        { key: 'pliometria', icon: '⚡', label: 'Pliometría' },
        { key: 'calentamiento', icon: '🔥', label: 'Calentamiento' },
        { key: 'vuelta_calma', icon: '🧘', label: 'Vuelta a la calma' },
        { key: 'tecnica_respiracion', icon: '🧠', label: 'Técnica y Respiración' }
    ],

    async render() {
        this.state.allExercises = await DB.getAllExercises();
        return this.renderPage();
    },

    renderPage() {
        const s = this.state;

        // Tabs
        let tabsHtml = '';
        for (const cat of this.categories) {
            const active = cat.key === s.activeTab ? 'active' : '';
            tabsHtml += `<button class="ex-tab ${active}" data-tab="${cat.key}">${cat.icon} ${cat.label}</button>`;
        }

        // Content
        const contentHtml = this.renderCategory(s.activeTab);

        return `
        <div class="ex-header">
            <h1 class="section-title">Biblioteca de ejercicios</h1>
        </div>

        <div class="ex-tabs-scroll">
            <div class="ex-tabs">
                ${tabsHtml}
            </div>
        </div>

        <div class="ex-content" id="ex-content">
            ${contentHtml}
        </div>`;
    },

    renderCategory(key) {
        const data = this.state.allExercises ? this.state.allExercises[key] : null;
        if (!data) return '<div class="empty-state"><div class="empty-state-icon">📭</div><p class="empty-state-text">No hay datos disponibles.</p></div>';

        switch (key) {
            case 'tren_inferior':
            case 'tren_superior':
            case 'pliometria':
                return this.renderExerciseCards(data);
            case 'calentamiento':
                return this.renderWarmupTimeline(data);
            case 'vuelta_calma':
                return this.renderCooldownList(data);
            case 'tecnica_respiracion':
                return this.renderTechniqueCards(data);
            default:
                return '';
        }
    },

    // === Strength / Plyometrics exercise cards ===
    renderExerciseCards(data) {
        if (!data.exercises) return '';

        let html = `<div class="ex-category-name">${data.name}</div><div class="ex-cards">`;

        for (const [exId, ex] of Object.entries(data.exercises)) {
            const hasVideo = ex.videoUrl && ex.videoUrl.length > 0;

            html += `
            <div class="card ex-card" data-exercise-id="${exId}">
                <div class="ex-card-image">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3">
                        <path d="M6.5 6.5L17.5 17.5"/>
                        <path d="M3 10L7 6"/><path d="M10 3L6 7"/>
                        <path d="M17.5 6.5L21 10"/><path d="M14 3L17.5 6.5"/>
                        <path d="M6.5 17.5L3 14"/><path d="M10 21L6.5 17.5"/>
                        <path d="M14 21L17.5 17.5"/><path d="M21 14L17.5 17.5"/>
                    </svg>
                    <span class="ex-card-image-name">${ex.name}</span>
                </div>
                <div class="ex-card-body">
                    <div class="ex-card-title">${ex.name}</div>
                    <div class="ex-card-badges">
                        <span class="ex-badge ex-badge-sets">${ex.sets} &times; ${ex.reps}</span>
                        ${ex.rest ? `<span class="ex-badge ex-badge-rest">⏱ ${ex.rest}</span>` : ''}
                    </div>
                    ${ex.tips ? `<div class="ex-card-tips">${ex.tips}</div>` : ''}
                    ${hasVideo ? `
                    <div class="ex-card-expand">
                        <a href="${ex.videoUrl}" target="_blank" rel="noopener" class="ex-video-link">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            Ver vídeo
                        </a>
                    </div>` : ''}
                </div>
            </div>`;
        }

        html += '</div>';
        return html;
    },

    // === Warmup timeline ===
    renderWarmupTimeline(data) {
        if (!data.steps) return '';

        const stepIcons = ['🏃‍♀️', '🔄', '🎯'];

        let html = `
        <div class="ex-category-name">${data.name}</div>
        <div class="ex-warmup-intro text-sm text-muted mb-16">Rutina de calentamiento antes de cada sesión de carrera</div>
        <div class="ex-timeline">`;

        data.steps.forEach((step, i) => {
            const isLast = i === data.steps.length - 1;
            html += `
            <div class="ex-timeline-step">
                <div class="ex-timeline-marker">
                    <div class="ex-timeline-icon">${stepIcons[i] || '📌'}</div>
                    ${!isLast ? '<div class="ex-timeline-line"></div>' : ''}
                </div>
                <div class="ex-timeline-content card">
                    <div class="ex-timeline-header">
                        <span class="ex-timeline-part">${step.part}</span>
                        <span class="ex-badge ex-badge-duration">${step.duration}</span>
                    </div>
                    <div class="ex-timeline-text">${step.content}</div>
                </div>
            </div>`;
        });

        html += `
        </div>
        <div class="ex-warmup-total card">
            <span class="text-sm text-muted">Tiempo total aprox.</span>
            <span class="fw-bold">~13 minutos</span>
        </div>`;

        return html;
    },

    // === Cooldown stretching list ===
    renderCooldownList(data) {
        if (!data.stretches) return '';

        const muscleIcons = {
            'Gemelos': '🦵',
            'Isquios': '🦿',
            'Cuádriceps': '🦵',
            'Glúteo': '🍑',
            'Flexor cadera': '🦴'
        };

        let html = `
        <div class="ex-category-name">${data.name}</div>
        <div class="ex-cooldown-intro text-sm text-muted mb-16">Estiramientos después de cada sesión</div>
        <div class="ex-cooldown-list">`;

        for (const stretch of data.stretches) {
            const icon = muscleIcons[stretch.muscle] || '🔵';
            html += `
            <div class="ex-cooldown-item card">
                <div class="ex-cooldown-icon">${icon}</div>
                <div class="ex-cooldown-info">
                    <div class="ex-cooldown-muscle">${stretch.muscle}</div>
                    <div class="ex-cooldown-tips text-sm text-muted">${stretch.tips}</div>
                </div>
                <div class="ex-cooldown-time">${stretch.time}</div>
            </div>`;
        }

        html += '</div>';
        return html;
    },

    // === Technique flashcards ===
    renderTechniqueCards(data) {
        if (!data.tips) return '';

        const topicIcons = {
            'Cadencia': '👣',
            'Pisada': '👟',
            'Brazos': '💪',
            'Respiración': '🌬️',
            'Mental': '🧠'
        };

        const topicColors = {
            'Cadencia': 'var(--success)',
            'Pisada': 'var(--info)',
            'Brazos': 'var(--warning)',
            'Respiración': 'var(--purple)',
            'Mental': 'var(--accent)'
        };

        let html = `
        <div class="ex-category-name">${data.name}</div>
        <div class="ex-tech-intro text-sm text-muted mb-16">Consejos para mejorar tu técnica de carrera</div>
        <div class="ex-flashcards">`;

        for (const tip of data.tips) {
            const icon = topicIcons[tip.topic] || '💡';
            const color = topicColors[tip.topic] || 'var(--accent)';

            html += `
            <div class="ex-flashcard" style="--fc-color: ${color}">
                <div class="ex-flashcard-icon">${icon}</div>
                <div class="ex-flashcard-content">
                    <div class="ex-flashcard-topic">${tip.topic}</div>
                    <div class="ex-flashcard-advice">${tip.advice}</div>
                </div>
            </div>`;
        }

        html += '</div>';
        return html;
    },

    mount() {
        // Tab switching
        document.querySelectorAll('.ex-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const key = e.currentTarget.dataset.tab;
                if (key === this.state.activeTab) return;

                this.state.activeTab = key;

                // Update tab active state
                document.querySelectorAll('.ex-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // Update content with animation
                const content = document.getElementById('ex-content');
                content.style.opacity = '0';
                content.style.transform = 'translateY(8px)';

                setTimeout(() => {
                    content.innerHTML = this.renderCategory(key);
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0)';
                }, 150);
            });
        });

        // Scroll active tab into view
        const activeTab = document.querySelector('.ex-tab.active');
        if (activeTab) {
            activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }
};

// Register with router
Router.registerView('exercises', ExercisesView);
