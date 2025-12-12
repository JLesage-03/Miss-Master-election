// ===== ADMIN DASHBOARD SCRIPT =====

let db;
let currentFilter = 'all';
let adminSession = null;

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    db = new Database();
    
    // Initialize default data if empty
    if (db.candidates.length === 0) {
        initializeDefaultData();
    }
    
    checkAdminSession();
    initializeEventListeners();
});

// Initialize default data for demo
function initializeDefaultData() {
    const defaultCandidates = [
        {
            id: 'candidate-1',
            category: 'miss',
            name: 'Amara Ndeze',
            program: 'Computer Science',
            department: 'Faculty of Engineering',
            email: 'amara.ndeze@nfonap.edu.cm',
            bio: 'Passionate about technology and community development. Active in student organizations.',
            manifesto: 'Dedicated to improving campus technology infrastructure and fostering innovation.',
            createdAt: new Date().toISOString()
        },
        {
            id: 'candidate-2',
            category: 'miss',
            name: 'Christelle Tanyi',
            program: 'Business Administration',
            department: 'Faculty of Business',
            email: 'christelle.tanyi@nfonap.edu.cm',
            bio: 'Entrepreneur and business enthusiast with a focus on sustainable development.',
            manifesto: 'Committed to promoting entrepreneurship and supporting student businesses.',
            createdAt: new Date().toISOString()
        },
        {
            id: 'candidate-3',
            category: 'master',
            name: 'David Ngufor',
            program: 'Software Engineering',
            department: 'Faculty of Engineering',
            email: 'david.ngufor@nfonap.edu.cm',
            bio: 'Tech leader with experience in software development and project management.',
            manifesto: 'Working towards digital transformation and excellence in academic excellence.',
            createdAt: new Date().toISOString()
        },
        {
            id: 'candidate-4',
            category: 'master',
            name: 'Benjamin Nkwa',
            program: 'Finance',
            department: 'Faculty of Business',
            email: 'benjamin.nkwa@nfonap.edu.cm',
            bio: 'Economics scholar focused on development and financial inclusion.',
            manifesto: 'Advocating for economic growth and student welfare improvement.',
            createdAt: new Date().toISOString()
        }
    ];

    db.candidates = defaultCandidates;
    db.saveData();
}



// Initialize event listeners
function initializeEventListeners() {
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            modal.style.display = 'none';
        });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
}

// ===== LOGIN FUNCTIONS =====
function login() {
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    if (!username || !password) {
        Toast.show('Please enter username and password', 'warning');
        return;
    }

    // Vérifie le mot de passe stocké
    let storedPassword = localStorage.getItem('adminPassword');
    if (!storedPassword) {
        storedPassword = CONFIG.ADMIN_CREDENTIALS.password;
    }
    if (username === CONFIG.ADMIN_CREDENTIALS.username && password === storedPassword) {
        adminSession = {
            username: username,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };
        sessionStorage.setItem('adminSession', JSON.stringify(adminSession));
        document.getElementById('admin-username').value = '';
        document.getElementById('admin-password').value = '';
        showDashboard();
        Toast.show('Login successful!', 'success');
    } else {
        Toast.show('Invalid username or password', 'error');
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminSession');
        adminSession = null;
        showLoginForm();
        Toast.show('Logged out successfully', 'info');
    }
}

function showLoginForm() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
    document.querySelector('.nav button').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    document.querySelector('.nav button').style.display = 'inline-block';
    
    // Update welcome info
    document.getElementById('admin-name').textContent = adminSession.username;
    updateLastLoginTime();
    
    // Load dashboard data
    refreshDashboard();
}

function updateLastLoginTime() {
    const loginTime = new Date(adminSession.loginTime);
    document.getElementById('last-login').textContent = loginTime.toLocaleString();
}

// ===== DASHBOARD FUNCTIONS =====
function refreshDashboard() {
    db.loadData();
    updateStatistics();
    loadCandidatesTable();
}

function updateStatistics() {
    const totalCandidates = db.candidates.length;
    const missCandidates = db.candidates.filter(c => c.category === 'miss').length;
    const masterCandidates = db.candidates.filter(c => c.category === 'master').length;
    const totalVotes = db.votes.length;

    document.getElementById('admin-total-candidates').textContent = totalCandidates;
    document.getElementById('admin-total-votes').textContent = totalVotes;
    document.getElementById('admin-miss-candidates').textContent = missCandidates;
    document.getElementById('admin-master-candidates').textContent = masterCandidates;
}

function loadCandidatesTable() {
    const container = document.getElementById('candidates-table');
    let candidates = db.candidates;

    // Filter candidates
    if (currentFilter === 'miss') {
        candidates = candidates.filter(c => c.category === 'miss');
    } else if (currentFilter === 'master') {
        candidates = candidates.filter(c => c.category === 'master');
    }

    if (candidates.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No candidates found</p>';
        return;
    }

    let html = '<table class="table" style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">';
    html += '<th style="padding: 1rem; text-align: left;">Name</th>';
    html += '<th style="padding: 1rem; text-align: left;">Category</th>';
    html += '<th style="padding: 1rem; text-align: left;">Program</th>';
    html += '<th style="padding: 1rem; text-align: left;">Votes</th>';
    html += '<th style="padding: 1rem; text-align: center;">Actions</th>';
    html += '</tr></thead><tbody>';

    candidates.forEach(candidate => {
        const voteCount = db.votes.filter(v => v.candidateId === candidate.id).length;
        const categoryLabel = candidate.category === 'miss' ? '👩 Miss' : '👨 Master';
        
        html += `<tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 1rem;">${candidate.name}</td>
            <td style="padding: 1rem;">${categoryLabel}</td>
            <td style="padding: 1rem;">${candidate.program}</td>
            <td style="padding: 1rem;"><strong>${voteCount}</strong></td>
            <td style="padding: 1rem; text-align: center;">
                <button class="btn btn-sm btn-info" onclick="editCandidate('${candidate.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCandidate('${candidate.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function filterCandidates(filter) {
    currentFilter = filter;
    loadCandidatesTable();
}

// ===== CANDIDATE MANAGEMENT =====
function showAddCandidateModal() {
    document.getElementById('add-candidate-modal').style.display = 'flex';
    document.getElementById('add-candidate-form').reset();
}

function closeAddCandidateModal() {
    document.getElementById('add-candidate-modal').style.display = 'none';
}

function addCandidate() {
    const category = document.getElementById('candidate-category').value;
    const name = document.getElementById('candidate-name').value.trim();
    const program = document.getElementById('candidate-program').value.trim();
    const department = document.getElementById('candidate-department').value.trim();
    const email = document.getElementById('candidate-email').value.trim();
    const bio = document.getElementById('candidate-bio').value.trim();
    const manifesto = document.getElementById('candidate-manifesto').value.trim();

    // Validation
    if (!category || !name || !program || !department || !bio) {
        Toast.show('Please fill in all required fields', 'warning');
        return;
    }

    // Create candidate object
    const candidate = {
        id: 'candidate-' + Date.now(),
        category,
        name,
        program,
        department,
        email,
        bio,
        manifesto,
        createdAt: new Date().toISOString()
    };

    // Add to database
    db.candidates.push(candidate);
    db.saveData();

    // Clear form and close modal
    document.getElementById('add-candidate-form').reset();
    closeAddCandidateModal();

    // Refresh dashboard
    refreshDashboard();
    Toast.show('Candidate added successfully!', 'success');
}

function editCandidate(candidateId) {
    const candidate = db.candidates.find(c => c.id === candidateId);
    if (!candidate) {
        Toast.show('Candidate not found', 'error');
        return;
    }

    // Fill form with candidate data
    document.getElementById('edit-candidate-id').value = candidate.id;
    document.getElementById('edit-candidate-category').value = candidate.category;
    document.getElementById('edit-candidate-name').value = candidate.name;
    document.getElementById('edit-candidate-program').value = candidate.program;
    document.getElementById('edit-candidate-department').value = candidate.department;
    document.getElementById('edit-candidate-email').value = candidate.email || '';
    document.getElementById('edit-candidate-bio').value = candidate.bio;
    document.getElementById('edit-candidate-manifesto').value = candidate.manifesto || '';

    // Show modal
    document.getElementById('edit-candidate-modal').style.display = 'flex';
}

function closeEditCandidateModal() {
    document.getElementById('edit-candidate-modal').style.display = 'none';
}

function updateCandidate() {
    const candidateId = document.getElementById('edit-candidate-id').value;
    const category = document.getElementById('edit-candidate-category').value;
    const name = document.getElementById('edit-candidate-name').value.trim();
    const program = document.getElementById('edit-candidate-program').value.trim();
    const department = document.getElementById('edit-candidate-department').value.trim();
    const email = document.getElementById('edit-candidate-email').value.trim();
    const bio = document.getElementById('edit-candidate-bio').value.trim();
    const manifesto = document.getElementById('edit-candidate-manifesto').value.trim();

    // Validation
    if (!category || !name || !program || !department || !bio) {
        Toast.show('Please fill in all required fields', 'warning');
        return;
    }

    // Find and update candidate
    const candidateIndex = db.candidates.findIndex(c => c.id === candidateId);
    if (candidateIndex === -1) {
        Toast.show('Candidate not found', 'error');
        return;
    }

    db.candidates[candidateIndex] = {
        ...db.candidates[candidateIndex],
        category,
        name,
        program,
        department,
        email,
        bio,
        manifesto,
        updatedAt: new Date().toISOString()
    };

    db.saveData();
    closeEditCandidateModal();
    refreshDashboard();
    Toast.show('Candidate updated successfully!', 'success');
}

function deleteCandidate(candidateId) {
    if (!confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
        return;
    }

    // Find and remove candidate
    const index = db.candidates.findIndex(c => c.id === candidateId);
    if (index === -1) {
        Toast.show('Candidate not found', 'error');
        return;
    }

    // Also remove all votes for this candidate
    db.votes = db.votes.filter(v => v.candidateId !== candidateId);

    db.candidates.splice(index, 1);
    db.saveData();

    refreshDashboard();
    Toast.show('Candidate deleted successfully!', 'success');
}

// ===== DATABASE MANAGEMENT =====
function backupDatabase() {
    db.loadData();
    
    const backup = {
        timestamp: new Date().toISOString(),
        candidates: db.candidates,
        votes: db.votes,
        voters: db.voters,
        settings: db.settings
    };

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nfonap-elections-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Toast.show('Database backed up successfully!', 'success');
}

function restoreDatabase() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const backup = JSON.parse(event.target.result);
                
                // Validate backup structure
                if (!backup.candidates || !backup.votes || !backup.voters || !backup.settings) {
                    throw new Error('Invalid backup file format');
                }

                db.candidates = backup.candidates;
                db.votes = backup.votes;
                db.voters = backup.voters;
                db.settings = backup.settings;
                db.saveData();

                refreshDashboard();
                Toast.show('Database restored successfully!', 'success');
            } catch (error) {
                Toast.show('Error restoring database: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function resetDatabase() {
    const confirmed = confirm('⚠️ WARNING! This will permanently delete ALL data (candidates, votes, etc.). This action cannot be undone. Are you sure?');
    
    if (!confirmed) {
        Toast.show('Reset cancelled', 'info');
        return;
    }

    const finalConfirm = confirm('This is your LAST warning. Type "RESET" in the next prompt to confirm.');
    
    if (!finalConfirm) {
        Toast.show('Reset cancelled', 'info');
        return;
    }

    const userInput = prompt('Type "RESET" to confirm permanent data deletion:');
    
    if (userInput === 'RESET') {
        db.candidates = [];
        db.votes = [];
        db.voters = [];
        db.settings = {
            electionTitle: 'NFONAP Miss & Master Elections 2025',
            votingDeadline: CONFIG.VOTING_DEADLINE.toISOString(),
            allowVoting: true
        };
        db.saveData();

        refreshDashboard();
        Toast.show('Database has been reset!', 'success');
    } else {
        Toast.show('Reset cancelled', 'info');
    }
}

// ===== EXPORT DATA =====
function exportData() {
    db.loadData();
    
    // Create CSV content
    let csv = 'Name,Category,Program,Department,Email,Votes\n';
    
    db.candidates.forEach(candidate => {
        const voteCount = db.votes.filter(v => v.candidateId === candidate.id).length;
        const row = [
            candidate.name,
            candidate.category,
            candidate.program,
            candidate.department,
            candidate.email || '',
            voteCount
        ].map(val => `"${val}"`).join(',');
        csv += row + '\n';
    });

    const dataBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nfonap-elections-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Toast.show('Data exported successfully!', 'success');
}

// ===== PASSWORD MANAGEMENT =====
function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        Toast.show('Please fill in all password fields', 'warning');
        return;
    }

    let storedPassword = localStorage.getItem('adminPassword');
    if (!storedPassword) {
        storedPassword = CONFIG.ADMIN_CREDENTIALS.password;
    }
    if (currentPassword !== storedPassword) {
        Toast.show('Current password is incorrect', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        Toast.show('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 6) {
        Toast.show('New password must be at least 6 characters', 'warning');
        return;
    }

    // Met à jour le mot de passe dans localStorage
    localStorage.setItem('adminPassword', newPassword);

    // Clear form and close modal
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    closePasswordModal();

    Toast.show('Password changed successfully!', 'success');
}

function closePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
}

// ===== UTILITY FUNCTIONS =====
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('active');
}
