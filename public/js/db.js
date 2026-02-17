// Database CRUD module for RunTracker PWA
// Uses global `db` (firebase.database()) from firebase-config.js
// Uses `Offline` from offline.js for caching

const DB = {

    // ===== PLAN =====

    async getPlan() {
        return await Offline.fetch('plan', 'plan');
    },

    async getWeek(weekId) {
        return await Offline.fetch(`plan/weeks/${weekId}`, `week_${weekId}`);
    },

    async getToday() {
        const today = Utils.formatDate(new Date());
        // Find which week contains today
        const plan = await this.getPlan();
        if (!plan || !plan.weeks) return null;

        for (const [weekId, week] of Object.entries(plan.weeks)) {
            if (week.days && week.days[today]) {
                return {
                    weekId,
                    weekNumber: week.weekNumber,
                    phase: week.phase,
                    day: week.days[today],
                    date: today
                };
            }
        }
        return null;
    },

    async getDayData(date) {
        const plan = await this.getPlan();
        if (!plan || !plan.weeks) return null;

        for (const [weekId, week] of Object.entries(plan.weeks)) {
            if (week.days && week.days[date]) {
                return {
                    weekId,
                    weekNumber: week.weekNumber,
                    phase: week.phase,
                    day: week.days[date],
                    date
                };
            }
        }
        return null;
    },

    // Get the current week based on today's date
    async getCurrentWeek() {
        const today = Utils.formatDate(new Date());
        const plan = await this.getPlan();
        if (!plan || !plan.weeks) return null;

        for (const [weekId, week] of Object.entries(plan.weeks)) {
            if (!week.days) continue;
            const dates = Object.keys(week.days).sort();
            if (dates.length > 0 && today >= dates[0] && today <= dates[dates.length - 1]) {
                return { weekId, ...week };
            }
        }
        return null;
    },

    // ===== EXERCISES =====

    async getExercises(group) {
        return await Offline.fetch(`exercises/${group}`, `exercises_${group}`);
    },

    async getAllExercises() {
        return await Offline.fetch('exercises', 'exercises_all');
    },

    async getCalentamiento() {
        return await Offline.fetch('exercises/calentamiento', 'exercises_calentamiento');
    },

    async getVueltaCalma() {
        return await Offline.fetch('exercises/vuelta_calma', 'exercises_vuelta_calma');
    },

    async getTecnicaRespiracion() {
        return await Offline.fetch('exercises/tecnica_respiracion', 'exercises_tecnica_respiracion');
    },

    // ===== WORKOUT LOGS =====

    async saveWorkoutLog(uid, logData) {
        // Include session index in logId for multiple sessions per day
        const sessionIdx = logData.sessionIndex !== undefined ? `_s${logData.sessionIndex}` : '';
        const logId = `log_${logData.date.replace(/-/g, '')}${sessionIdx}`;
        const path = `workoutLogs/${uid}/${logId}`;
        const data = {
            ...logData,
            createdAt: new Date().toISOString()
        };

        const success = await Offline.write(path, data, 'set');

        // Also update session completed status in the plan
        if (logData.sessionId && logData.weekId) {
            const sessionsPath = `plan/weeks/${logData.weekId}/days/${logData.date}/sessions`;
            try {
                const snapshot = await db.ref(sessionsPath).once('value');
                const sessions = snapshot.val();
                if (Array.isArray(sessions)) {
                    const idx = sessions.findIndex(s => s.id === logData.sessionId);
                    if (idx !== -1) {
                        await db.ref(`${sessionsPath}/${idx}/completed`).set(true);
                        // Invalidar caché para que se recarguen los datos actualizados
                        Offline.removeCache('plan');
                        Offline.removeCache(`week_${logData.weekId}`);
                    }
                }
            } catch (e) {
                console.warn('Could not update session completed status:', e.message);
            }
        }

        // Update local cache
        const cacheKey = `workoutLogs_${uid}`;
        const cached = Offline.getCache(cacheKey) || {};
        cached[logId] = data;
        Offline.setCache(cacheKey, cached);

        return logId;
    },

    async getWorkoutLogs(uid, dateFrom, dateTo) {
        const logs = await Offline.fetch(`workoutLogs/${uid}`, `workoutLogs_${uid}`);
        if (!logs) return {};

        if (!dateFrom && !dateTo) return logs;

        // Filter by date range
        const filtered = {};
        for (const [logId, log] of Object.entries(logs)) {
            if (dateFrom && log.date < dateFrom) continue;
            if (dateTo && log.date > dateTo) continue;
            filtered[logId] = log;
        }
        return filtered;
    },

    async getWorkoutLog(uid, logId) {
        return await Offline.fetch(`workoutLogs/${uid}/${logId}`, `workoutLog_${uid}_${logId}`);
    },

    // ===== SESSIONS (coach) =====

    async updateSession(weekId, date, sessionIndex, sessionData) {
        const path = `plan/weeks/${weekId}/days/${date}/sessions/${sessionIndex}`;
        const success = await Offline.write(path, sessionData, 'set');
        if (success) {
            Offline.removeCache('plan');
            Offline.removeCache(`week_${weekId}`);
        }
        return success;
    },

    async addSession(weekId, date, sessionData) {
        const path = `plan/weeks/${weekId}/days/${date}/sessions`;
        try {
            const snapshot = await db.ref(path).once('value');
            const sessions = snapshot.val() || [];
            sessions.push(sessionData);
            await db.ref(path).set(sessions);
            Offline.removeCache('plan');
            Offline.removeCache(`week_${weekId}`);
            return true;
        } catch (error) {
            console.error('Error adding session:', error);
            Offline.addToQueue({ type: 'set', path, data: sessionData });
            return false;
        }
    },

    async deleteSession(weekId, date, sessionId) {
        const path = `plan/weeks/${weekId}/days/${date}/sessions`;
        try {
            const snapshot = await db.ref(path).once('value');
            const sessions = snapshot.val() || [];
            const filtered = sessions.filter(s => s.id !== sessionId);
            await db.ref(path).set(filtered);
            Offline.removeCache('plan');
            Offline.removeCache(`week_${weekId}`);
            return true;
        } catch (error) {
            console.error('Error deleting session:', error);
            return false;
        }
    },

    // ===== PHASES =====

    async getPhases() {
        return await Offline.fetch('phases', 'phases');
    },

    // ===== USERS =====

    async getUserRole(uid) {
        return await Offline.fetch(`users/${uid}/role`, `role_${uid}`);
    },

    async getUserProfile(uid) {
        return await Offline.fetch(`users/${uid}`, `profile_${uid}`);
    },

    // ===== HELPERS PARA LOGS =====

    // Obtiene todos los logs de una fecha específica (incluyendo multi-sesión)
    getLogsForDate(logs, dateStr) {
        const prefix = `log_${dateStr.replace(/-/g, '')}`;
        const dayLogs = {};
        for (const [logId, log] of Object.entries(logs || {})) {
            if (logId === prefix || logId.startsWith(prefix + '_s')) {
                dayLogs[logId] = log;
            }
        }
        return dayLogs;
    },

    // Verifica si una sesión está completada (con fallback a logs)
    isSessionCompleted(session, logsForDay) {
        // Primero verificar flag directo en el plan
        if (session.completed) return true;

        // Fallback: buscar log que coincida con sessionId
        for (const log of Object.values(logsForDay || {})) {
            if (log.sessionId === session.id && log.actual && log.actual.completed) {
                return true;
            }
        }
        return false;
    },

    // Obtiene el log específico de una sesión
    getLogForSession(session, sessionIndex, logsForDay) {
        // Buscar por sessionId primero
        for (const log of Object.values(logsForDay || {})) {
            if (log.sessionId === session.id) return log;
        }
        // Fallback: buscar por sessionIndex
        for (const log of Object.values(logsForDay || {})) {
            if (log.sessionIndex === sessionIndex) return log;
        }
        return null;
    }
};
