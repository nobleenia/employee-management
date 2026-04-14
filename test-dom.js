const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('public/app.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
const window = dom.window;

window.addEventListener("error", (event) => {
  console.error("Script error:", event.error);
});

const scriptContent = fs.readFileSync('public/script.js', 'utf8');
const scriptEl = window.document.createElement("script");
scriptEl.textContent = scriptContent;
window.document.body.appendChild(scriptEl);

setTimeout(() => {
  try {
     const evt = window.document.createEvent("Event");
     evt.initEvent("DOMContentLoaded", true, true);
     window.document.dispatchEvent(evt);
     console.log("DOMContentLoaded fired successfully.");
  } catch (e) {
     console.error("Error during DOMContentLoaded:", e);
  }
}, 100);
