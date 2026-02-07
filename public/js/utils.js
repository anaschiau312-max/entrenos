// Utility functions for RunTracker PWA

const Utils = {

    // Format Date object to YYYY-MM-DD
    formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },

    // Parse YYYY-MM-DD string to Date
    parseDate(dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    },

    // Get day of week name in Spanish
    getDayName(date) {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[date.getDay()];
    },

    // Get short day name
    getDayShort(date) {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return days[date.getDay()];
    },

    // Get month name in Spanish
    getMonthName(monthIndex) {
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return months[monthIndex];
    },

    // Format date for display: "Lunes, 2 de Febrero"
    formatDateDisplay(dateStr) {
        const date = this.parseDate(dateStr);
        const day = this.getDayName(date);
        return `${day}, ${date.getDate()} de ${this.getMonthName(date.getMonth())}`;
    },

    // Calculate pace from distance (km) and duration (HH:MM:SS)
    calculatePace(distanceKm, duration) {
        if (!distanceKm || distanceKm <= 0) return null;
        const parts = duration.split(':').map(Number);
        let totalSeconds;
        if (parts.length === 3) {
            totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            totalSeconds = parts[0] * 60 + parts[1];
        } else {
            return null;
        }
        const paceSeconds = totalSeconds / distanceKm;
        const paceMin = Math.floor(paceSeconds / 60);
        const paceSec = Math.round(paceSeconds % 60);
        return `${paceMin}:${String(paceSec).padStart(2, '0')}`;
    },

    // Parse pace string "M:SS" to seconds per km
    paceToSeconds(pace) {
        const [m, s] = pace.split(':').map(Number);
        return m * 60 + s;
    },

    // Format seconds to HH:MM:SS
    formatDuration(totalSeconds) {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },

    // Get ISO week number
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    // Get the Monday of the week containing the given date
    getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return d;
    },

    // Add days to a date
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
};
