const fs = require('fs');
let s = fs.readFileSync('public/app.html', 'utf8');

const target = `                        <div class="form-group">
                            <label>Emergency Contact</label>
                            <input type="text" id="profile-emergency" placeholder="Name and Phone">
                        </div>`;

const replace = `                        <div class="form-group">
                            <label>Emergency Contact Name</label>
                            <input type="text" id="profile-emergency-name" placeholder="Contact Name">
                        </div>
                        <div class="form-group">
                            <label>Emergency Contact Phone</label>
                            <input type="text" id="profile-emergency-phone" placeholder="Contact Phone">
                        </div>`;

if(s.includes(target)) {
    s = s.replace(target, replace);
    fs.writeFileSync('public/app.html', s);
    console.log("Replaced");
} else {
    console.log("Not found");
}
