// SPA Router for RunTracker PWA

const Router = {
    currentView: null,
    mainContent: null,
    navItems: null,

    // View registry — each view module must expose a render() function
    views: {
        dashboard: { label: 'Hoy', module: null },
        weekly: { label: 'Plan', module: null },
        'workout-log': { label: 'Registrar', module: null },
        'stats-view': { label: 'Stats', module: null },
        exercises: { label: 'Ejercicios', module: null },
        settings: { label: 'Ajustes', module: null },
        calendar: { label: 'Calendario', module: null },
        'edit-plan': { label: 'Editar Plan', module: null }
    },

    // Default view
    defaultView: 'dashboard',

    init() {
        this.mainContent = document.getElementById('main-content');
        this.navItems = document.querySelectorAll('.nav-item[data-view]');

        // Nav click handlers
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                this.navigate(view);
            });
        });

        // Settings button handler
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.navigate('settings'));
        }

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const view = (e.state && e.state.view) || this.defaultView;
            this.loadView(view, false);
        });

        // Load initial view from URL hash or default
        const hash = window.location.hash.replace('#', '');
        const initialView = (hash && this.views[hash]) ? hash : this.defaultView;
        this.navigate(initialView, true);
    },

    navigate(viewName, replace = false) {
        if (!this.views[viewName]) {
            viewName = this.defaultView;
        }

        // Update browser history
        if (replace) {
            history.replaceState({ view: viewName }, '', `#${viewName}`);
        } else {
            history.pushState({ view: viewName }, '', `#${viewName}`);
        }

        this.loadView(viewName);
    },

    async loadView(viewName) {
        if (!this.views[viewName]) return;

        this.currentView = viewName;

        // Update active nav item
        this.updateActiveNav(viewName);

        // Show loading
        this.mainContent.innerHTML = '<div class="loading-screen"><div class="spinner"></div></div>';

        // Render the view
        try {
            const module = this.views[viewName].module;
            if (module && typeof module.render === 'function') {
                const html = await module.render();
                this.mainContent.innerHTML = `<div class="view-container">${html}</div>`;
                // Call mount if the view has post-render logic
                if (typeof module.mount === 'function') {
                    module.mount();
                }
            } else {
                this.mainContent.innerHTML = `
                    <div class="view-container">
                        <div class="empty-state">
                            <div class="empty-state-icon">🚧</div>
                            <p class="empty-state-text">Vista "${this.views[viewName].label}" en construcción</p>
                        </div>
                    </div>`;
            }
        } catch (error) {
            console.error(`Error loading view ${viewName}:`, error);
            this.mainContent.innerHTML = `
                <div class="view-container">
                    <div class="empty-state">
                        <div class="empty-state-icon">⚠️</div>
                        <p class="empty-state-text">Error al cargar la vista</p>
                    </div>
                </div>`;
        }
    },

    updateActiveNav(viewName) {
        this.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });
    },

    // Register a view module
    registerView(name, module) {
        if (this.views[name]) {
            this.views[name].module = module;
        }
    }
};
