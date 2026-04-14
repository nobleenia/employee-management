const fs = require('fs');
let html = fs.readFileSync('public/app.html', 'utf8');

if (!html.includes('id="confirm-modal"')) {
    const confirmModal = `
    <!-- Confirm Modal -->
    <div id="confirm-modal" class="modal-overlay" style="display:none; align-items:center; justify-content:center; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000;">
        <div class="modal-card" style="background:#fff; padding:20px; border-radius:8px; max-width:400px; width:100%;">
            <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 id="confirm-modal-title" style="margin:0;">Confirm Action</h3>
                <button class="close-btn" onclick="closeModal('confirm-modal')" style="background:none;border:none;font-size:1.2rem;cursor:pointer;">&times;</button>
            </div>
            <div class="modal-body" style="margin-bottom:20px;">
                <p id="confirm-modal-msg">Are you sure?</p>
            </div>
            <div class="modal-actions" style="display:flex; justify-content:flex-end; gap:10px;">
                <button class="btn btn-outline" onclick="closeModal('confirm-modal')">Cancel</button>
                <button class="btn btn-dark" onclick="if(window.pendingDeleteAction) { window.pendingDeleteAction(); closeModal('confirm-modal'); }" style="background-color: #ef4444; border-color: #ef4444;">Confirm</button>
            </div>
        </div>
    </div>
    `;
    html = html.replace('</body>', confirmModal + '\n  </body>');
    fs.writeFileSync('public/app.html', html);
}
