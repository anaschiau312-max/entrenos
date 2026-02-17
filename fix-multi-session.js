const fs = require('fs');

// Fix db.js - saveWorkoutLog to include session index
let dbContent = fs.readFileSync('public/js/db.js', 'utf8');

const oldSaveCode = `    async saveWorkoutLog(uid, logData) {
        const logId = \`log_\${logData.date.replace(/-/g, '')}\`;`;

const newSaveCode = `    async saveWorkoutLog(uid, logData) {
        // Include session index in logId for multiple sessions per day
        const sessionIdx = logData.sessionIndex !== undefined ? \`_s\${logData.sessionIndex}\` : '';
        const logId = \`log_\${logData.date.replace(/-/g, '')}\${sessionIdx}\`;`;

dbContent = dbContent.replace(oldSaveCode, newSaveCode);
fs.writeFileSync('public/js/db.js', dbContent);
console.log('db.js updated');

// Now update workout-log.js to include sessionIndex and fix existing log loading
let wlContent = fs.readFileSync('public/js/views/workout-log.js', 'utf8');

// 1. Fix loadDayData to load the correct log for active session
const oldLoadLog = `        // Check for existing log
        const uid = window.currentUser.uid;
        const logId = \`log_\${s.selectedDate.replace(/-/g, '')}\`;
        const logs = await DB.getWorkoutLogs(uid);
        s.existingLog = logs ? logs[logId] : null;`;

const newLoadLog = `        // Check for existing log (include session index)
        const uid = window.currentUser.uid;
        const baseLogId = \`log_\${s.selectedDate.replace(/-/g, '')}\`;
        const logs = await DB.getWorkoutLogs(uid);
        // Will be set per session in getExistingLogForSession
        s.allLogs = logs || {};`;

wlContent = wlContent.replace(oldLoadLog, newLoadLog);

// 2. Add helper method to get log for specific session
const helperMethod = `
    getExistingLogForSession(sessionIndex) {
        const s = this.state;
        const baseLogId = \`log_\${s.selectedDate.replace(/-/g, '')}\`;
        // Try session-specific log first, then fall back to base log
        const sessionLogId = \`\${baseLogId}_s\${sessionIndex}\`;
        return s.allLogs[sessionLogId] || s.allLogs[baseLogId] || null;
    },

`;

// Insert after loadDayData
const insertAfter = `        // Pick first uncompleted session, or first one
        s.activeSessionIndex = 0;
        if (s.sessions.length > 1) {
            const idx = s.sessions.findIndex(ses => !ses.completed);
            if (idx !== -1) s.activeSessionIndex = idx;
        }
    },`;

wlContent = wlContent.replace(insertAfter, insertAfter + helperMethod);

// 3. Update renderRunningForm, renderStrengthCardioForm etc. to use getExistingLogForSession
// For running form
wlContent = wlContent.replace(
    `    renderRunningForm(session) {
        const log = this.state.existingLog;`,
    `    renderRunningForm(session) {
        const log = this.getExistingLogForSession(this.state.activeSessionIndex);`
);

// For cycling form
wlContent = wlContent.replace(
    `    renderCyclingForm(session) {
        const log = this.state.existingLog;`,
    `    renderCyclingForm(session) {
        const log = this.getExistingLogForSession(this.state.activeSessionIndex);`
);

// For strength cardio form
wlContent = wlContent.replace(
    `    renderStrengthCardioForm(session) {
        const log = this.state.existingLog;`,
    `    renderStrengthCardioForm(session) {
        const log = this.getExistingLogForSession(this.state.activeSessionIndex);`
);

// For strength form
wlContent = wlContent.replace(
    `    renderStrengthForm(session) {
        const log = this.state.existingLog;`,
    `    renderStrengthForm(session) {
        const log = this.getExistingLogForSession(this.state.activeSessionIndex);`
);

// For common fields
wlContent = wlContent.replace(
    `    renderCommonFields() {
        const log = this.state.existingLog;`,
    `    renderCommonFields() {
        const log = this.getExistingLogForSession(this.state.activeSessionIndex);`
);

// 4. Update collectFormData to include sessionIndex
wlContent = wlContent.replace(
    `        const base = {
            date: s.selectedDate,
            sessionId: session.id,
            weekId: s.dayData ? s.dayData.weekId : null,
            sessionType: session.type,`,
    `        const base = {
            date: s.selectedDate,
            sessionIndex: s.activeSessionIndex,
            sessionId: session.id,
            weekId: s.dayData ? s.dayData.weekId : null,
            sessionType: session.type,`
);

// 5. Update isEditing check in renderForm
wlContent = wlContent.replace(
    `const isEditing = !!s.existingLog;`,
    `const isEditing = !!this.getExistingLogForSession(s.activeSessionIndex);`
);

fs.writeFileSync('public/js/views/workout-log.js', wlContent);
console.log('workout-log.js updated');

console.log('All fixes applied!');
