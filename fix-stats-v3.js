const fs = require('fs');

let content = fs.readFileSync('public/js/views/stats-view.js', 'utf8');

// Find and replace line by line
const lines = content.split('\n');
const newLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Replace the week grouping logic
    if (line.includes('// Group by week number')) {
        newLines.push('        // Group by plan week number (from weekId)');
        continue;
    }

    if (line.includes('const d = Utils.parseDate(log.date);')) {
        newLines.push('            let wn = null;');
        newLines.push('            if (log.weekId) {');
        newLines.push('                const match = log.weekId.match(/week_(\\d+)/);');
        newLines.push('                if (match) wn = parseInt(match[1], 10);');
        newLines.push('            }');
        newLines.push('            if (!wn) continue;');
        // Skip the next line too (the old getWeekNumber line)
        i++;
        continue;
    }

    newLines.push(line);
}

fs.writeFileSync('public/js/views/stats-view.js', newLines.join('\n'));
console.log('stats-view.js fixed v3');
