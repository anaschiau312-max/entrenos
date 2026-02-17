const fs = require('fs');
let content = fs.readFileSync('public/js/views/stats-view.js', 'utf8');

// Insert currentWeekNum loading before return this.renderPage()
content = content.replace(
    /(\s+)return this\.renderPage\(\);/,
    `
        // Get current plan week number
        const currentWeek = await DB.getCurrentWeek();
        s.currentWeekNum = currentWeek ? currentWeek.weekNumber : null;

$1return this.renderPage();`
);

fs.writeFileSync('public/js/views/stats-view.js', content);
console.log('Render fixed');
