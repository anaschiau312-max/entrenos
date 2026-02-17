const fs = require('fs');

let content = fs.readFileSync('public/js/db.js', 'utf8');

// Find and replace the saveWorkoutLog function's logId line
const lines = content.split('\n');
const newLines = [];
let found = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for the logId line in saveWorkoutLog
    if (line.includes("const logId = `log_${logData.date.replace(/-/g, '')}`;")) {
        // Add the sessionIdx line first
        newLines.push("        // Include session index in logId for multiple sessions per day");
        newLines.push("        const sessionIdx = logData.sessionIndex !== undefined ? `_s${logData.sessionIndex}` : '';");
        // Then the modified logId line
        newLines.push("        const logId = `log_${logData.date.replace(/-/g, '')}${sessionIdx}`;");
        found = true;
    } else {
        newLines.push(line);
    }
}

if (found) {
    fs.writeFileSync('public/js/db.js', newLines.join('\n'));
    console.log('db.js updated successfully');
} else {
    console.log('Pattern not found - file may already be updated');
}
