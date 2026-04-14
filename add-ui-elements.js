const fs = require('fs');
let html = fs.readFileSync('public/app.html', 'utf8');

// Insert nav links
const newNavs = `
                <a href="#" data-target="profile" class="nav-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span class="nav-text">My Profile</span>
                </a>
                <a href="#" data-target="leaves" class="nav-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span class="nav-text">Leave Requests</span>
                </a>
`;
html = html.replace('</nav>', newNavs + '</nav>');

// Insert Pages
const newPages = `
            <!-- Profile Page -->
            <div id="page-profile" class="page-content" style="display: none;">
                <div class="page-header">
                    <div>
                        <h2>My Profile</h2>
                        <p class="subtitle">Manage your personal information</p>
                    </div>
                </div>
                <div class="card" style="max-width: 600px;">
                    <form id="profile-form">
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="text" id="profile-phone" placeholder="Enter your phone number">
                        </div>
                        <div class="form-group">
                            <label>Address</label>
                            <input type="text" id="profile-address" placeholder="Enter your home address">
                        </div>
                        <div class="form-group">
                            <label>Emergency Contact</label>
                            <input type="text" id="profile-emergency" placeholder="Name and Phone">
                        </div>
                        <button type="submit" class="btn btn-dark">Save Profile</button>
                    </form>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;"/>
                    <div id="profile-dept-info" style="color: #64748b; font-size: 14px;">
                        Loading department access status...
                    </div>
                </div>
            </div>

            <!-- Leaves Page -->
            <div id="page-leaves" class="page-content" style="display: none;">
                <div class="page-header">
                    <div>
                        <h2>Leave Requests</h2>
                        <p class="subtitle">Submit and track your time off</p>
                    </div>
                    <button class="btn btn-dark" onclick="openModal('leave-modal')">Request Leave</button>
                </div>
                <div class="card table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Type</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th id="leave-action-header" style="display:none;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="leave-table-body">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Leave Modal -->
            <div id="leave-modal" class="modal-overlay" style="display: none;">
                <div class="modal">
                    <div class="modal-header">
                        <h3 id="leave-modal-title">Request Time Off</h3>
                        <button class="close-modal" onclick="closeModal('leave-modal')">&times;</button>
                    </div>
                    <form id="leave-modal-form">
                        <div class="form-group">
                            <label>Type</label>
                            <select id="leave-type" required>
                                <option value="PTO">PTO (Paid Time Off)</option>
                                <option value="Sick">Sick Leave</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Start Date</label>
                            <input type="date" id="leave-start" required>
                        </div>
                        <div class="form-group">
                            <label>End Date</label>
                            <input type="date" id="leave-end" required>
                        </div>
                        <button type="submit" class="btn btn-dark btn-block">Submit Request</button>
                    </form>
                </div>
            </div>
`;
html = html.replace('</main>', newPages + '</main>');
fs.writeFileSync('public/app.html', html);
