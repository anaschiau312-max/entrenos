const fs = require('fs');

let content = fs.readFileSync('public/js/views/stats-view.js', 'utf8');

// Fix 1: Change week grouping to use weekId
const old1 = `        // Group by week number
        const weekData = {};
        for (const log of runLogs) {
            const d = Utils.parseDate(log.date);
            const wn = Utils.getWeekNumber(d);
            if (!weekData[wn]) weekData[wn] = { km: 0, phase: null };
            weekData[wn].km += log.actual.distance_km || 0;
        }`;

const new1 = `        // Group by plan week number (from weekId like "week_04")
        const weekData = {};
        for (const log of runLogs) {
            let wn = null;
            if (log.weekId) {
                const match = log.weekId.match(/week_(\\d+)/);
                if (match) wn = parseInt(match[1], 10);
            }
            if (!wn) continue;
            if (!weekData[wn]) weekData[wn] = { km: 0, phase: null };
            weekData[wn].km += log.actual.distance_km || 0;
        }`;

content = content.replace(old1, new1);

// Fix 2: Change currentWeek calculation
content = content.replace(
    'const currentWeek = Utils.getWeekNumber(new Date());',
    'const currentWeek = this.state.currentWeekNum || null;'
);

// Fix 3: Load currentWeekNum in render
const oldRender = `        s.logs = logs || {};
        s.plan = plan;
        s.phases = phases || {};
        s.charts = [];`;

const newRender = `        s.logs = logs || {};
        s.plan = plan;
        s.phases = phases || {};
        s.charts = [];

        // Get current plan week
        const currentWeek = await DB.getCurrentWeek();
        s.currentWeekNum = currentWeek ? currentWeek.weekNumber : null;`;

content = content.replace(oldRender, newRender);

fs.writeFileSync('public/js/views/stats-view.js', content);
console.log('stats-view.js fixed');
