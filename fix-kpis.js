const fs = require('fs');
let content = fs.readFileSync('public/script.js', 'utf8');

const target1 = `                        <div class="kpi-value">38</div>`;
const replace1 = `                        <div class="kpi-value">\${window.cachedTotalEmployees || 0}</div>`;

const target2 = `                        <div class="kpi-value">6</div>`;
const replace2 = `                        <div class="kpi-value">\${data.length ? Math.round((window.cachedTotalEmployees || 0) / data.length) : 0}</div>`;

content = content.replace(target1, replace1).replace(target2, replace2);

// We need to inject caching the total employees somewhere. E.g. when dashboard or employees data is loaded.
const dashboardInject = `const data = await res.json();
        window.cachedTotalEmployees = data.kpis.totalEmployees;`;
content = content.replace(`const data = await res.json();`, dashboardInject);

fs.writeFileSync('public/script.js', content);
