const fs = require('fs');

let content = fs.readFileSync('public/js/views/stats-view.js', 'utf8');

// Replace the buildDistanceChart function
const oldDistanceChart = `    // === 1. Weekly distance bar chart ===
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

        const labels = sortedWeeks.map(w => \`S\${w}\`);
        const data = sortedWeeks.map(w => Math.round(weekData[w].km * 10) / 10);
        const bgColors = sortedWeeks.map(w => {
            if (w === currentWeek) return '#e94560';
            return weekData[w].phase ? weekData[w].phase + '99' : 'rgba(255,255,255,0.15)';
        });
        const borderColors = sortedWeeks.map(w => {
            if (w === currentWeek) return '#e94560';
            return weekData[w].phase || 'rgba(255,255,255,0.3)';
        });`;

const newDistanceChart = `    // === 1. Weekly distance bar chart ===
    buildDistanceChart(runLogs) {
        const canvas = document.getElementById('st-chart-distance');
        if (!canvas) return;

        // Group by plan week number (from weekId like "week_04")
        const weekData = {};
        for (const log of runLogs) {
            // Extract week number from weekId (e.g., "week_04" -> 4)
            let wn = null;
            if (log.weekId) {
                const match = log.weekId.match(/week_(\\d+)/);
                if (match) wn = parseInt(match[1], 10);
            }
            if (!wn) continue; // Skip logs without weekId

            if (!weekData[wn]) weekData[wn] = { km: 0, phase: null };
            weekData[wn].km += log.actual.distance_km || 0;
        }

        // Map weeks to phases from plan
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

        // Get current plan week from DB
        const currentWeek = this.state.currentWeekNum || null;

        const labels = sortedWeeks.map(w => \`S\${w}\`);
        const data = sortedWeeks.map(w => Math.round(weekData[w].km * 10) / 10);
        const bgColors = sortedWeeks.map(w => {
            if (w === currentWeek) return '#e94560';
            return weekData[w].phase ? weekData[w].phase + '99' : 'rgba(255,255,255,0.15)';
        });
        const borderColors = sortedWeeks.map(w => {
            if (w === currentWeek) return '#e94560';
            return weekData[w].phase || 'rgba(255,255,255,0.3)';
        });`;

content = content.replace(oldDistanceChart, newDistanceChart);

// Also update the render function to load currentWeekNum
const oldRender = `    async render() {
        const uid = window.currentUser.uid;

        // Load workout logs and phases
        const [logs, phases] = await Promise.all([
            DB.getWorkoutLogs(uid),
            DB.getPhases()
        ]);`;

const newRender = `    async render() {
        const uid = window.currentUser.uid;

        // Load workout logs, phases, and current week
        const [logs, phases, currentWeek] = await Promise.all([
            DB.getWorkoutLogs(uid),
            DB.getPhases(),
            DB.getCurrentWeek()
        ]);

        this.state.currentWeekNum = currentWeek ? currentWeek.weekNumber : null;`;

content = content.replace(oldRender, newRender);

fs.writeFileSync('public/js/views/stats-view.js', content);
console.log('stats-view.js updated');
