const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('public/app.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
const window = dom.window;

const scriptContent = fs.readFileSync('public/script.js', 'utf8');
const scriptEl = window.document.createElement("script");
scriptEl.textContent = scriptContent;
window.document.body.appendChild(scriptEl);

setTimeout(() => {
  try {
     const evt = window.document.createEvent("Event");
     evt.initEvent("DOMContentLoaded", true, true);
     window.document.dispatchEvent(evt);
     
     // Inspect the HTML to see if my changes are there!
     const appView = window.document.getElementById('emp-view-grid');
     console.log("emp-view-grid found:", !!appView);
     
     const deptViewList = window.document.getElementById('dept-view-list');
     console.log("dept-view-list found:", !!deptViewList);
     
     // simulate clicking emp-view-grid
     appView.click();
     console.log("empViewMode after click:", window.empViewMode);
  } catch (e) {
     console.error("Error during flow:", e);
  }
}, 100);
