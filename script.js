// ===== NFONAP ELECTION PLATFORM - MAIN JAVASCRIPT =====

// Configuration
const CONFIG = {
    VOTING_DEADLINE: new Date('December 13, 2025 13:00:00'),
    STORAGE_KEYS: {
        CANDIDATES: 'nfonap_candidates_v2',
        VOTES: 'nfonap_votes_v2',
        VOTERS: 'nfonap_voters_v2',
        SETTINGS: 'nfonap_settings_v2'
    },
    ADMIN_CREDENTIALS: {
        username: 'admin',
        password: 'nfonap2025'
    },
    SESSION_TIMEOUT: 30 // minutes
};

// Toast Notification System
class Toast {
    static show(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toast-container') || this.createContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${this.getIcon(type)}
            </div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => this.remove(toast), duration);
        
        // Close button
        toast.querySelector('.toast-close').onclick = () => this.remove(toast);
    }
    
    static createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
    
    static getIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || 'ℹ';
    }
    
    static remove(toast) {
        toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }
}

// Database Manager
class Database {
    constructor() {
        this.loadData();
    }
    
    loadData() {
        // Load candidates
        const candidatesData = localStorage.getItem(CONFIG.STORAGE_KEYS.CANDIDATES);
        this.candidates = candidatesData ? JSON.parse(candidatesData) : [];
        
        // Load votes
        const votesData = localStorage.getItem(CONFIG.STORAGE_KEYS.VOTES);
        this.votes = votesData ? JSON.parse(votesData) : [];
        
        // Load voters
        const votersData = localStorage.getItem(CONFIG.STORAGE_KEYS.VOTERS);
        this.voters = votersData ? JSON.parse(votersData) : [];
        
        // Load settings
        const settingsData = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
        this.settings = settingsData ? JSON.parse(settingsData) : {
            electionTitle: 'NFONAP Miss & Master Elections 2025',
            votingDeadline: CONFIG.VOTING_DEADLINE.toISOString(),
            allowVoting: true
        };
    }
    
    saveData() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.CANDIDATES, JSON.stringify(this.candidates));
        localStorage.setItem(CONFIG.STORAGE_KEYS.VOTES, JSON.stringify(this.votes));
        localStorage.setItem(CONFIG.STORAGE_KEYS.VOTERS, JSON.stringify(this.voters));
        localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    }
    
    backupData() {
        return {
            candidates: this.candidates,
            votes: this.votes,
            voters: this.voters,
            settings: this.settings,
            timestamp: new Date().toISOString(),
            version: '2.0'
        };
    }
    
    restoreData(backup) {
        if (!backup.candidates || !backup.votes || !backup.voters || !backup.settings) {
            throw new Error('Invalid backup file');
        }
        
        this.candidates = backup.candidates;
        this.votes = backup.votes;
        this.voters = backup.voters;
        this.settings = backup.settings;
        this.saveData();
    }
    
    isVotingOpen() {
        const now = new Date();
        const deadline = new Date(this.settings.votingDeadline || CONFIG.VOTING_DEADLINE);
        return now < deadline && this.settings.allowVoting !== false;
    }
    
    getCandidates(category = null) {
        return category 
            ? this.candidates.filter(c => c.category === category && c.status === 'active')
            : this.candidates.filter(c => c.status === 'active');
    }
    
    getCandidateById(id) {
        return this.candidates.find(c => c.id === id);
    }
    
    getCandidateVotes(candidateId) {
        return this.votes.filter(v => v.candidateId === candidateId);
    }
    
    getCandidateVoteCount(candidateId) {
        return this.getCandidateVotes(candidateId).length;
    }
    
    vote(candidateId, voterEmail, voterName) {
        // Validate voting status
        if (!this.isVotingOpen()) {
            throw new Error('Voting has ended! The deadline was December 13, 2025 at 1:00 PM.');
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(voterEmail)) {
            throw new Error('Please enter a valid email address.');
        }
        
        // Check if voter has already voted
        const hasVoted = this.voters.some(v => v.email === voterEmail);
        if (hasVoted) {
            throw new Error('You have already voted! Each person can only vote once.');
        }
        
        // Get candidate
        const candidate = this.getCandidateById(candidateId);
        if (!candidate) {
            throw new Error('Candidate not found.');
        }
        
        // Create vote record
        const vote = {
            id: this.generateId(),
            candidateId,
            candidateName: candidate.name,
            category: candidate.category,
            voterEmail,
            voterName,
            timestamp: new Date().toISOString(),
            ip: this.getClientIP()
        };
        
        // Add vote and voter
        this.votes.push(vote);
        this.voters.push({
            email: voterEmail,
            name: voterName,
            votedAt: new Date().toISOString(),
            lastVote: candidateId
        });
        
        // Save data
        this.saveData();
        
        return vote;
    }
    
    addCandidate(candidateData) {
        const candidate = {
            id: this.generateId(),
            ...candidateData,
            status: 'active',
            createdAt: new Date().toISOString(),
            votes: 0,
            token: this.generateToken()
        };
        
        this.candidates.push(candidate);
        this.saveData();
        
        return candidate;
    }
    
    deleteCandidate(candidateId) {
        const index = this.candidates.findIndex(c => c.id === candidateId);
        if (index !== -1) {
            this.candidates.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    
    generateToken() {
        return Math.random().toString(36).substr(2, 16);
    }
    
    getClientIP() {
        // This is a simplified version - in production, you'd get real IP
        return 'local';
    }
    
    getStatistics() {
        const totalVotes = this.votes.length;
        const totalCandidates = this.candidates.length;
        const missCandidates = this.candidates.filter(c => c.category === 'miss').length;
        const masterCandidates = this.candidates.filter(c => c.category === 'master').length;
        
        return {
            totalVotes,
            totalCandidates,
            missCandidates,
            masterCandidates,
            votingOpen: this.isVotingOpen()
        };
    }
    
    getRecentVotes(limit = 10) {
        return [...this.votes].reverse().slice(0, limit);
    }
}

// Initialize database
const db = new Database();

// Common Utility Functions
class ElectionUtils {
    static initMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('.nav');
        
        if (menuBtn && nav) {
            menuBtn.addEventListener('click', () => {
                nav.classList.toggle('active');
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.className = nav.classList.contains('active') 
                        ? 'fas fa-times' 
                        : 'fas fa-bars';
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav') && !e.target.closest('.mobile-menu-btn')) {
                    nav.classList.remove('active');
                    const icon = menuBtn.querySelector('i');
                    if (icon) icon.className = 'fas fa-bars';
                }
            });
        }
    }
    
    static initCountdown() {
        const countdownElement = document.getElementById('countdown');
        if (!countdownElement) return;
        
        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minutesEl = document.getElementById('countdown-minutes');
        const secondsEl = document.getElementById('countdown-seconds');
        
        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;
        
        const updateCountdown = () => {
            const now = new Date();
            const deadline = new Date(db.settings.votingDeadline || CONFIG.VOTING_DEADLINE);
            const diff = deadline - now;
            
            if (diff <= 0) {
                daysEl.textContent = '00';
                hoursEl.textContent = '00';
                minutesEl.textContent = '00';
                secondsEl.textContent = '00';
                
                // Update all vote buttons to disabled
                document.querySelectorAll('.vote-btn').forEach(btn => {
                    btn.disabled = true;
                    btn.textContent = 'Voting Ended';
                    btn.classList.add('disabled');
                });
                
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            daysEl.textContent = days.toString().padStart(2, '0');
            hoursEl.textContent = hours.toString().padStart(2, '0');
            minutesEl.textContent = minutes.toString().padStart(2, '0');
            secondsEl.textContent = seconds.toString().padStart(2, '0');
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
    
    static initHeaderScroll() {
        const header = document.querySelector('.header');
        if (header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }
    }
    
    static showVoteModal(candidateId, candidateName, category) {
        const modal = document.getElementById('vote-modal');
        if (!modal) return;
        
        // Set candidate info
        document.getElementById('modal-candidate-name').textContent = candidateName;
        document.getElementById('modal-candidate-category').textContent = 
            category === 'miss' ? 'Miss NFONAP' : 'Master NFONAP';
        document.getElementById('modal-candidate-id').value = candidateId;
        
        // Clear form
        document.getElementById('voter-email').value = '';
        document.getElementById('voter-name').value = '';
        
        // Show modal
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
    
    static closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    static async submitVote() {
        const candidateId = document.getElementById('modal-candidate-id').value;
        const voterEmail = document.getElementById('voter-email').value.trim();
        const voterName = document.getElementById('voter-name').value.trim();
        
        // Validation
        if (!voterEmail || !voterName) {
            Toast.show('Please fill in all required fields', 'error');
            return;
        }
        
        if (!candidateId) {
            Toast.show('Invalid candidate selection', 'error');
            return;
        }
        
        try {
            // Disable submit button
            const submitBtn = document.querySelector('#vote-modal .btn-primary');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading"></span> Processing...';
            submitBtn.disabled = true;
            
            // Process vote
            const vote = db.vote(candidateId, voterEmail, voterName);
            
            // Success
            Toast.show(`Thank you for voting for ${vote.candidateName}!`, 'success');
            
            // Close modal
            this.closeModal('vote-modal');
            
            // Update UI if on candidates page
            if (window.location.pathname.includes('miss.html') || 
                window.location.pathname.includes('master.html')) {
                setTimeout(() => window.location.reload(), 1500);
            }
            
        } catch (error) {
            Toast.show(error.message, 'error');
        } finally {
            // Re-enable submit button
            const submitBtn = document.querySelector('#vote-modal .btn-primary');
            if (submitBtn) {
                submitBtn.innerHTML = 'Submit Vote';
                submitBtn.disabled = false;
            }
        }
    }
    
    static formatDate(date) {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    static formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }
}

// Page-specific Functions
class PageFunctions {
    static initHomePage() {
        // Update statistics
        this.updateHomeStatistics();
        
        // Initialize animations
        this.initAnimations();
    }
    
    static updateHomeStatistics() {
        const stats = db.getStatistics();
        
        if (document.getElementById('total-candidates')) {
            document.getElementById('total-candidates').textContent = stats.totalCandidates;
        }
        
        if (document.getElementById('total-votes')) {
            document.getElementById('total-votes').textContent = stats.totalVotes.toLocaleString();
        }
        
        if (document.getElementById('miss-count')) {
            document.getElementById('miss-count').textContent = stats.missCandidates;
        }
        
        if (document.getElementById('master-count')) {
            document.getElementById('master-count').textContent = stats.masterCandidates;
        }
    }
    
    static initAnimations() {
        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, observerOptions);
        
        // Observe elements with animation classes
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }
    
    static loadCandidatesPage(category) {
        const container = document.getElementById('candidates-container');
        if (!container) return;
        
        const candidates = db.getCandidates(category);
        const votingOpen = db.isVotingOpen();
        
        if (candidates.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="padding: 4rem;">
                    <i class="fas fa-users" style="font-size: 4rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--gray-600);">No ${category === 'miss' ? 'Miss' : 'Master'} Candidates Yet</h3>
                    <p style="color: var(--gray-500); max-width: 400px; margin: 0 auto;">
                        ${category === 'miss' ? 'Miss' : 'Master'} candidates will be announced soon. Check back later!
                    </p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = candidates.map(candidate => {
            const voteCount = db.getCandidateVoteCount(candidate.id);
            const totalVotes = db.votes.length;
            const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
            
            return `
                <div class="candidate-card animate-on-scroll">
                    <div class="candidate-image">
                        <img src="${candidate.photo || 'assets/default-avatar.jpg'}" 
                             alt="${candidate.name}"
                             onerror="this.src='assets/default-avatar.jpg'">
                        <div class="candidate-category">
                            ${candidate.category === 'miss' ? '👑 Miss' : '👑 Master'}
                        </div>
                    </div>
                    <div class="candidate-info">
                        <h3 class="candidate-name">${candidate.name}</h3>
                        <div class="candidate-program">
                            <i class="fas fa-graduation-cap"></i> ${candidate.program}
                        </div>
                        <div class="candidate-department">
                            <i class="fas fa-university"></i> ${candidate.department}
                        </div>
                        <p class="candidate-bio">${candidate.bio || 'No biography available.'}</p>
                        
                        <div class="candidate-stats">
                            <div class="vote-count">
                                <i class="fas fa-vote-yea"></i> ${voteCount} votes
                            </div>
                            <div class="vote-percentage">
                                ${percentage}%
                            </div>
                        </div>
                        
                        <button class="btn btn-primary vote-btn ${!votingOpen ? 'disabled' : ''}" 
                                onclick="ElectionUtils.showVoteModal('${candidate.id}', '${candidate.name}', '${category}')"
                                ${!votingOpen ? 'disabled' : ''}>
                            <i class="fas fa-vote-yea"></i>
                            ${votingOpen ? 'Vote Now' : 'Voting Ended'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    static initCandidatePortal() {
        const urlParams = new URLSearchParams(window.location.search);
        const candidateId = urlParams.get('id');
        
        if (!candidateId) {
            this.showPortalError('Invalid access link. Please use the monitoring link provided by the admin.');
            return;
        }
        
        const candidate = db.getCandidateById(candidateId);
        if (!candidate) {
            this.showPortalError('Candidate not found. Please check your monitoring link.');
            return;
        }
        
        // Display candidate dashboard
        this.displayCandidateDashboard(candidate);
        
        // Set up auto-refresh
        setInterval(() => this.updateCandidateDashboard(candidate), 10000);
    }
    
    static displayCandidateDashboard(candidate) {
        const container = document.getElementById('portal-content');
        if (!container) return;
        
        const voteCount = db.getCandidateVoteCount(candidate.id);
        const totalVotes = db.votes.length;
        const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
        const recentVotes = db.getRecentVotes(5).filter(v => v.candidateId === candidate.id);
        
        container.innerHTML = `
            <div class="dashboard-grid">
                <div class="candidate-profile-card">
                    <img src="${candidate.photo || 'assets/default-avatar.jpg'}" 
                         alt="${candidate.name}" 
                         class="profile-image"
                         onerror="this.src='assets/default-avatar.jpg'">
                    <h2>${candidate.name}</h2>
                    <div class="category-badge" style="margin-bottom: 1rem;">
                        ${candidate.category === 'miss' ? 'Miss NFONAP' : 'Master NFONAP'}
                    </div>
                    
                    <div class="text-left" style="margin-top: 2rem;">
                        <h4><i class="fas fa-graduation-cap"></i> Program</h4>
                        <p>${candidate.program}</p>
                        
                        <h4><i class="fas fa-university"></i> Department</h4>
                        <p>${candidate.department}</p>
                        
                        ${candidate.email ? `
                            <h4><i class="fas fa-envelope"></i> Email</h4>
                            <p>${candidate.email}</p>
                        ` : ''}
                    </div>
                </div>
                
                <div class="stats-card">
                    <h2>Vote Statistics</h2>
                    
                    <div class="stat-row">
                        <span>Total Votes:</span>
                        <strong id="vote-count">${voteCount}</strong>
                    </div>
                    
                    <div class="stat-row">
                        <span>Percentage:</span>
                        <strong id="vote-percentage">${percentage}%</strong>
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" id="vote-progress" style="width: ${percentage}%"></div>
                    </div>
                    
                    <h3 style="margin-top: 2rem;">Recent Votes</h3>
                    <div class="votes-history" id="recent-votes">
                        ${recentVotes.length > 0 
                            ? recentVotes.map(vote => `
                                <div class="vote-record">
                                    <div>
                                        <strong>${vote.voterName}</strong>
                                        <small style="display: block; color: var(--gray-600);">
                                            ${ElectionUtils.formatTimeAgo(vote.timestamp)}
                                        </small>
                                    </div>
                                    <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                                </div>
                            `).join('')
                            : '<p style="text-align: center; color: var(--gray-500); padding: 2rem;">No votes yet</p>'
                        }
                    </div>
                    
                    <div style="margin-top: 2rem; padding: 1rem; background: var(--gray-100); border-radius: var(--radius-md);">
                        <h4>Voting Status</h4>
                        <p>Deadline: <strong>December 13, 2025 at 1:00 PM</strong></p>
                        <p>Status: <span class="status-badge ${db.isVotingOpen() ? 'status-open' : 'status-closed'}">
                            ${db.isVotingOpen() ? 'Voting Open' : 'Voting Closed'}
                        </span></p>
                        <small style="color: var(--gray-600);">Auto-refreshes every 10 seconds</small>
                    </div>
                </div>
            </div>
        `;
        
        // Show content
        document.getElementById('portal-loading').style.display = 'none';
        document.getElementById('info-section').style.display = 'block';
    }
    
    static updateCandidateDashboard(candidate) {
        if (!candidate) return;
        
        const voteCount = db.getCandidateVoteCount(candidate.id);
        const totalVotes = db.votes.length;
        const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
        const recentVotes = db.getRecentVotes(5).filter(v => v.candidateId === candidate.id);
        
        // Update vote count
        const voteCountEl = document.getElementById('vote-count');
        if (voteCountEl) voteCountEl.textContent = voteCount;
        
        // Update percentage
        const votePercentageEl = document.getElementById('vote-percentage');
        if (votePercentageEl) votePercentageEl.textContent = `${percentage}%`;
        
        // Update progress bar
        const progressBar = document.getElementById('vote-progress');
        if (progressBar) progressBar.style.width = `${percentage}%`;
        
        // Update recent votes
        const recentVotesEl = document.getElementById('recent-votes');
        if (recentVotesEl) {
            recentVotesEl.innerHTML = recentVotes.length > 0 
                ? recentVotes.map(vote => `
                    <div class="vote-record">
                        <div>
                            <strong>${vote.voterName}</strong>
                            <small style="display: block; color: var(--gray-600);">
                                ${ElectionUtils.formatTimeAgo(vote.timestamp)}
                            </small>
                        </div>
                        <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                    </div>
                `).join('')
                : '<p style="text-align: center; color: var(--gray-500); padding: 2rem;">No votes yet</p>';
        }
    }
    
    static showPortalError(message) {
        const container = document.getElementById('portal-content');
        if (container) {
            container.innerHTML = `
                <div class="text-center" style="padding: 4rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--warning-color); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--danger-color);">Access Error</h3>
                    <p style="color: var(--gray-600); max-width: 400px; margin: 1rem auto 2rem;">
                        ${message}
                    </p>
                    <a href="index.html" class="btn btn-primary">
                        <i class="fas fa-home"></i> Return to Home
                    </a>
                </div>
            `;
            document.getElementById('portal-loading').style.display = 'none';
        }
    }
}

// Initialize platform on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize common components
    ElectionUtils.initMobileMenu();
    ElectionUtils.initHeaderScroll();
    ElectionUtils.initCountdown();
    
    // Initialize modals
    const modalCloseBtns = document.querySelectorAll('.modal-close, [data-close-modal]');
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) ElectionUtils.closeModal(modal.id);
        });
    });
    
    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                ElectionUtils.closeModal(modal.id);
            }
        });
    });
    
    // Initialize page-specific functions
    const path = window.location.pathname;
    
    if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
        PageFunctions.initHomePage();
    } else if (path.endsWith('miss.html')) {
        PageFunctions.loadCandidatesPage('miss');
    } else if (path.endsWith('master.html')) {
        PageFunctions.loadCandidatesPage('master');
    } else if (path.endsWith('candidate-portal.html')) {
        PageFunctions.initCandidatePortal();
    } else if (path.endsWith('admin.html')) {
        // Admin page has its own script
    }
    
    // Initialize sample data on first visit
    if (db.candidates.length === 0 && !path.includes('admin.html')) {
        PageFunctions.initializeSampleData();
    }
});

// Global functions for HTML onclick attributes
window.showVoteModal = ElectionUtils.showVoteModal.bind(ElectionUtils);
window.submitVote = ElectionUtils.submitVote.bind(ElectionUtils);
window.closeModal = ElectionUtils.closeModal.bind(ElectionUtils);

// Initialize sample data
PageFunctions.initializeSampleData = function() {
    // Only initialize if no candidates exist
    if (db.candidates.length > 0) return;
    
    const sampleCandidates = [
        {
            id: 'miss1',
            category: 'miss',
            name: 'Alice Johnson',
            program: 'Computer Science',
            department: 'Faculty of Engineering',
            bio: 'A passionate computer science student with leadership experience in student clubs and community service. Committed to academic excellence and student welfare.',
            manifesto: 'Improve campus WiFi infrastructure, establish tech mentorship programs, promote STEM education for girls, and create more internship opportunities.',
            email: 'alice.j@nfonap.edu.cm',
            photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 'miss2',
            category: 'miss',
            name: 'Sarah Williams',
            program: 'Business Administration',
            department: 'Faculty of Management',
            bio: 'Business student with excellent communication skills and experience in organizing campus events. Dedicated to creating opportunities for all students.',
            manifesto: 'Increase internship partnerships, improve library resources, create business networking events, and establish student feedback system.',
            email: 'sarah.w@nfonap.edu.cm',
            photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 'master1',
            category: 'master',
            name: 'John Anderson',
            program: 'Medicine',
            department: 'Faculty of Health Sciences',
            bio: 'Medical student passionate about healthcare advocacy and student welfare. Served as class representative for two consecutive years.',
            manifesto: 'Improve health services on campus, create mental health support programs, establish peer tutoring system, and promote sports activities.',
            email: 'john.a@nfonap.edu.cm',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 'master2',
            category: 'master',
            name: 'David Chen',
            program: 'Law',
            department: 'Faculty of Law and Political Science',
            bio: 'Law student with strong advocacy skills and experience in student government. Committed to justice, equality, and student rights.',
            manifesto: 'Establish legal aid clinic for students, create debate and public speaking clubs, improve campus security, and promote civic education.',
            email: 'david.c@nfonap.edu.cm',
            photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
            status: 'active',
            createdAt: new Date().toISOString()
        }
    ];
    
    sampleCandidates.forEach(candidate => {
        db.candidates.push(candidate);
    });
    
    db.saveData();
    Toast.show('Sample data initialized for testing', 'info');
};