const fs = require('fs');
let s = fs.readFileSync('public/script.js', 'utf8');

const targetStr = `                    <button class="action-btn" title="Toggle Status"`;
const appendStr = `                    <button class="action-btn" title="Copy Invite Link" onclick="navigator.clipboard.writeText(window.location.origin + '/app.html?invite=' + '\${emp._id}'); showToast('Invitation link copied');"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></button>\n`;

s = s.replace(targetStr, appendStr + targetStr);
fs.writeFileSync('public/script.js', s);
