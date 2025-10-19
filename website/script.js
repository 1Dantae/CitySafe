// ===================================
// SAFECITY COMPLETE DASHBOARD SCRIPT
// ===================================

console.log('SafeCity Dashboard Loading...');

// ===================================
// TEST ACCOUNTS & AUTHENTICATION
// ===================================

// Test accounts with default passwords
const testAccounts = [
    { email: 'admin@safecity.com', password: 'Admin123!', role: 'admin', firstLogin: false },
    { email: 'jdf@safecity.com', password: 'DefaultJDF123', role: 'law-enforcement', department: 'JDF', firstLogin: true },
    { email: 'jcf@safecity.com', password: 'DefaultJCF123', role: 'law-enforcement', department: 'JCF', firstLogin: true },
    { email: 'security@safecity.com', password: 'DefaultNS123', role: 'law-enforcement', department: 'National Security', firstLogin: true }
];

// ===================================
// ADD USER MODAL FUNCTIONALITY
// ===================================

/**
 * Opens the Add User modal
 */
function openAddUserModal() {
    console.log('openAddUserModal called');
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Modal opened successfully');
    } else {
        console.error('ERROR: Modal element with id "addUserModal" not found!');
    }
}

/**
 * Closes the Add User modal and resets the form
 */
function closeAddUserModal() {
    console.log('closeAddUserModal called');
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = 'auto';
    
    // Reset form
    const form = document.getElementById('addUserForm');
    if (form) {
        form.reset();
    }
    
    // Reset password strength indicator
    const strengthBar = document.getElementById('passwordStrengthBar');
    if (strengthBar) {
        strengthBar.className = 'password-strength-bar';
    }
}

/**
 * Checks password strength and updates visual indicator
 */
function checkPasswordStrength() {
    const password = document.getElementById('password');
    const strengthBar = document.getElementById('passwordStrengthBar');
    
    if (!password || !strengthBar) return;
    
    const passwordValue = password.value;
    
    // Reset classes
    strengthBar.className = 'password-strength-bar';
    
    // Calculate strength
    let strength = 0;
    
    // Length check
    if (passwordValue.length >= 8) strength++;
    
    // Mixed case check
    if (passwordValue.match(/[a-z]/) && passwordValue.match(/[A-Z]/)) strength++;
    
    // Number check
    if (passwordValue.match(/[0-9]/)) strength++;
    
    // Special character check
    if (passwordValue.match(/[^a-zA-Z0-9]/)) strength++;
    
    // Apply appropriate class based on strength
    if (strength >= 4) {
        strengthBar.classList.add('strong');
    } else if (strength >= 2) {
        strengthBar.classList.add('medium');
    } else if (strength >= 1) {
        strengthBar.classList.add('weak');
    }
}

/**
 * Handles form submission for adding new user
 * @param {Event} event - Form submit event
 */
function handleAddUser(event) {
    event.preventDefault();
    console.log('handleAddUser called');
    
    // Get password values
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match! Please re-enter your passwords.');
        return;
    }
    
    // Validate password strength
    if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }
    
    // Collect form data
    const formData = {
        role: document.querySelector('input[name="role"]:checked').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        badgeId: document.getElementById('badgeId').value,
        department: document.getElementById('department').value,
        username: document.getElementById('username').value,
        password: password,
        accessLevel: document.getElementById('accessLevel').value,
        dateCreated: new Date().toISOString()
    };
    
    // Log the data (in production, send to backend)
    console.log('New User Data:', formData);
    
    // TODO: Send data to backend API
    // Example:
    // fetch('/api/users/create', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    // })
    // .then(response => response.json())
    // .then(data => {
    //     addUserCardToGrid(formData);
    //     closeAddUserModal();
    // })
    // .catch(error => {
    //     alert('Failed to create user. Please try again.');
    // });
    
    // For now, show success message
    const roleText = formData.role === 'admin' ? 'System Admin' : 'Law Enforcement Personnel';
    alert(`✓ User created successfully!\n\nName: ${formData.firstName} ${formData.lastName}\nRole: ${roleText}\nEmail: ${formData.email}\nUsername: ${formData.username}`);
    
    // Add user card to the grid immediately
    addUserCardToGrid(formData);
    
    // Close modal
    closeAddUserModal();
}

/**
 * Adds a new user card to the users grid
 * @param {Object} userData - User data object
 */
function addUserCardToGrid(userData) {
    const usersGrid = document.querySelector('.users-grid');
    
    if (!usersGrid) {
        console.error('Users grid not found');
        return;
    }
    
    // Create user card element
    const userCard = document.createElement('div');
    userCard.className = 'user-card';
    
    // Get current date for "Joined" info
    const joinedDate = new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
    });
    
    userCard.innerHTML = `
        <div class="user-avatar">👤</div>
        <h4>${userData.firstName} ${userData.lastName}</h4>
        <p>${userData.email}</p>
        <span class="tag green">Active</span>
        <p class="small-text">Reports: 0 | Joined: ${joinedDate}</p>
    `;
    
    // Add to grid
    usersGrid.appendChild(userCard);
    console.log('User card added to grid');
}

// ===================================
// PASSWORD TOGGLE FUNCTIONS
// ===================================

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordInput && eyeIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            eyeIcon.textContent = '👁️';
        }
    }
}

function toggleNewPassword() {
    const passwordInput = document.getElementById('newPassword');
    const eyeIcon = document.getElementById('eyeIcon1');
    
    if (passwordInput && eyeIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            eyeIcon.textContent = '👁️';
        }
    }
}

function toggleConfirmPassword() {
    const passwordInput = document.getElementById('confirmPassword');
    const eyeIcon = document.getElementById('eyeIcon2');
    
    if (passwordInput && eyeIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            eyeIcon.textContent = '👁️';
        }
    }
}

// ===================================
// LOGIN HANDLERS
// ===================================

// Admin Login Handler
function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Find matching account
    const account = testAccounts.find(acc => acc.email === email && acc.password === password);
    
    if (account) {
        // Store user data
        localStorage.setItem('userType', account.role);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userDepartment', account.department || 'admin');
        
        // Check if first login
        if (account.firstLogin) {
            localStorage.setItem('requiresPasswordChange', 'true');
            window.location.href = 'change-password.html';
        } else {
            if (account.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'law-enforcement-dashboard.html';
            }
        }
    } else {
        alert('Invalid email or password');
    }
}

// Law Enforcement Login Handler
function handleLawEnforcementLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const account = testAccounts.find(acc => acc.email === email && acc.password === password);
    
    if (account) {
        localStorage.setItem('userType', account.role);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userDepartment', account.department);
        localStorage.setItem('badgeNumber', account.department + '-12345');
        localStorage.setItem('department', account.department);
        
        if (account.firstLogin) {
            localStorage.setItem('requiresPasswordChange', 'true');
            window.location.href = 'change-password.html';
        } else {
            window.location.href = 'law-enforcement-dashboard.html';
        }
    } else {
        alert('Invalid email or password');
    }
}

// ===================================
// CHANGE PASSWORD HANDLER
// ===================================

function handleChangePassword(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('passwordError');
    
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match!';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (newPassword.length < 8) {
        errorDiv.textContent = 'Password must be at least 8 characters long!';
        errorDiv.style.display = 'block';
        return;
    }
    
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    if (!hasNumber || !hasSpecial) {
        errorDiv.textContent = 'Password must contain at least one number and one special character!';
        errorDiv.style.display = 'block';
        return;
    }
    
    errorDiv.style.display = 'none';
    
    const userType = localStorage.getItem('userType');
    
    localStorage.setItem('passwordChanged', 'true');
    localStorage.removeItem('requiresPasswordChange');
    
    alert('Password changed successfully!\n\nWelcome to SafeCity!');
    
    if (userType === 'admin') {
        window.location.href = 'admin-dashboard.html';
    } else if (userType === 'law-enforcement') {
        window.location.href = 'law-enforcement-dashboard.html';
    } else {
        window.location.href = 'admin-login.html';
    }
}

// ===================================
// DASHBOARD FUNCTIONS
// ===================================

// Show/Hide Dashboard Sections
function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    const activeNavItem = document.querySelector(`[href="#${sectionId}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    const pageTitleElement = document.getElementById('pageTitle');
    if (pageTitleElement) {
        const titles = {
            'overview': 'Dashboard Overview',
            'reports': 'Crime Reports',
            'chatrooms': 'Chat Monitoring',
            'users': 'User Management',
            'alerts': 'Emergency Alerts',
            'settings': 'Settings',
            'emergencies': 'Active Emergencies',
            'map': 'Crime Map',
            'analytics': 'Analytics'
        };
        pageTitleElement.textContent = titles[sectionId] || 'Dashboard';
    }
}

// Chat Selection
let currentChatId = 1;

function selectChat(chatId) {
    currentChatId = chatId;
    
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        item.classList.remove('active');
    });
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    loadChatMessages(chatId);
}

function loadChatMessages(chatId) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const mockChats = {
        1: [
            { type: 'user', text: 'Hello, I need to report suspicious activity', time: '10:30 AM' },
            { type: 'ai', text: 'Hello! I\'m here to help. Can you please provide more details?', time: '10:31 AM' },
            { type: 'user', text: 'There\'s someone hanging around acting strange', time: '10:32 AM' },
            { type: 'ai', text: 'Thank you. Can you provide the location?', time: '10:32 AM' }
        ],
        2: [
            { type: 'user', text: 'This is an emergency!', time: '10:40 AM' },
            { type: 'ai', text: 'I understand this is urgent. What is happening?', time: '10:40 AM' },
            { type: 'user', text: 'Someone is breaking into my neighbor\'s house!', time: '10:41 AM' },
            { type: 'ai', text: '🚨 ESCALATING TO AUTHORITIES. Please stay safe.', time: '10:41 AM' }
        ],
        3: [
            { type: 'user', text: 'I want to report a theft', time: '09:00 AM' },
            { type: 'ai', text: 'I can help with that. When did this occur?', time: '09:01 AM' },
            { type: 'user', text: 'Yesterday evening around 7 PM', time: '09:02 AM' },
            { type: 'ai', text: 'Report filed. Reference #00234', time: '09:03 AM' }
        ]
    };
    
    const messages = mockChats[chatId] || [];
    
    chatMessages.innerHTML = messages.map(msg => {
        if (msg.type === 'ai') {
            return `
                <div class="message ai">
                    <div class="ai-badge">🤖 AI</div>
                    <div class="message-content">
                        <p>${msg.text}</p>
                        <span class="message-time">${msg.time}</span>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="message user">
                    <div class="message-content">
                        <p>${msg.text}</p>
                        <span class="message-time">${msg.time}</span>
                    </div>
                </div>
            `;
        }
    }).join('');
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Take Over Chat
function takeOverChat() {
    alert('You are now in control of this chat. The AI assistant has been paused.');
    
    const aiStatus = document.querySelector('.ai-status');
    if (aiStatus) {
        aiStatus.innerHTML = '<span class="status-indicator red"></span> Admin Live Chat - You are responding';
        aiStatus.style.background = 'rgba(220, 38, 38, 0.1)';
    }
}

// Escalate Chat
function escalateChat() {
    const confirmed = confirm('Escalate this chat to JDF, JCDF, and National Security?');
    
    if (confirmed) {
        alert('Chat escalated successfully!\n\nNotifications sent to:\n- Jamaica Defence Force (JDF)\n- Jamaica Constabulary Force (JCDF)\n- National Security\n- Admin Team');
        
        const aiStatus = document.querySelector('.ai-status');
        if (aiStatus) {
            aiStatus.innerHTML = '<span class="status-indicator red pulse"></span> 🚨 ESCALATED - Authorities Notified';
            aiStatus.style.background = 'rgba(220, 38, 38, 0.2)';
        }
    }
}

// Send Message
function sendMessage() {
    const messageInput = document.getElementById('adminMessage');
    if (!messageInput) return;
    
    const messageText = messageInput.value.trim();
    if (!messageText) return;
    
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageHTML = `
        <div class="message user">
            <div class="message-content">
                <p>${messageText}</p>
                <span class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        </div>
    `;
    
    chatMessages.innerHTML += messageHTML;
    messageInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Logout
function logout() {
    const confirmed = confirm('Are you sure you want to logout?');
    
    if (confirmed) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// Real-time notifications simulation
function simulateNotifications() {
    const notificationBadge = document.querySelector('.notification-badge');
    if (!notificationBadge) return;
    
    setInterval(() => {
        const currentCount = parseInt(notificationBadge.textContent);
        if (Math.random() > 0.7) {
            notificationBadge.textContent = currentCount + 1;
        }
    }, 30000);
}

// ===================================
// EVENT LISTENERS & INITIALIZATION
// ===================================

/**
 * Close modal when clicking outside of it
 */
window.onclick = function(event) {
    const modal = document.getElementById('addUserModal');
    if (event.target === modal) {
        closeAddUserModal();
    }
}

/**
 * Close modal with Escape key
 */
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('addUserModal');
        if (modal && modal.classList.contains('active')) {
            closeAddUserModal();
        }
    }
});

/**
 * Initialize on page load
 */
window.addEventListener('DOMContentLoaded', function() {
    console.log('=== SafeCity Dashboard Initializing ===');
    
    const currentPage = window.location.pathname;
    
    // Check if on change password page
    if (currentPage.includes('change-password')) {
        const requiresPasswordChange = localStorage.getItem('requiresPasswordChange');
        if (!requiresPasswordChange) {
            window.location.href = 'admin-login.html';
        }
        
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', handleChangePassword);
        }
    }
    
    // Check if on admin login page
    if (currentPage.includes('admin-login')) {
        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', handleAdminLogin);
        }
    }
    
    // Check if on law enforcement login page
    if (currentPage.includes('law-enforcement-login')) {
        const lawEnforcementLoginForm = document.getElementById('lawEnforcementLoginForm');
        if (lawEnforcementLoginForm) {
            lawEnforcementLoginForm.addEventListener('submit', handleLawEnforcementLogin);
        }
    }
    
    // Check if on dashboard
    if (currentPage.includes('dashboard')) {
        const userType = localStorage.getItem('userType');
        const userEmail = localStorage.getItem('userEmail');
        
        if (!userType || !userEmail) {
            window.location.href = 'index.html';
            return;
        }
        
        // Display user info
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            if (userType === 'law-enforcement') {
                const badgeNumber = localStorage.getItem('badgeNumber');
                const department = localStorage.getItem('department');
                userNameElement.textContent = `Officer ${badgeNumber || ''}`;
                
                const deptElement = document.getElementById('userDept');
                if (deptElement) {
                    deptElement.textContent = department ? department.toUpperCase() : '';
                }
            } else {
                userNameElement.textContent = userEmail;
            }
        }
        
        // Check if modal exists
        const modal = document.getElementById('addUserModal');
        if (modal) {
            console.log('✓ Modal found on page');
        } else {
            console.warn('⚠ Modal NOT found on page');
        }
    }
    
    // Initialize notifications
    simulateNotifications();
    
    // Initialize filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Handle Enter key for messages
    const messageInput = document.getElementById('adminMessage');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    console.log('=== SafeCity Dashboard Ready ===');
});

console.log('SafeCity Script Loaded Successfully');
// ===================================
// CREATE ALERT MODAL FUNCTIONALITY
// ===================================

/**
 * Opens the Create Alert modal
 */
function openCreateAlertModal() {
    console.log('openCreateAlertModal called');
    const modal = document.getElementById('createAlertModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Create Alert Modal opened successfully');
    } else {
        console.error('ERROR: Create Alert Modal element not found!');
    }
}

/**
 * Closes the Create Alert modal and resets the form
 */
function closeCreateAlertModal() {
    console.log('closeCreateAlertModal called');
    const modal = document.getElementById('createAlertModal');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = 'auto';
    
    // Reset form
    const form = document.getElementById('createAlertForm');
    if (form) {
        form.reset();
    }
}

/**
 * Handles form submission for creating alert
 * @param {Event} event - Form submit event
 */
function handleCreateAlert(event) {
    event.preventDefault();
    console.log('handleCreateAlert called');
    
    // Get selected agencies
    const agencyCheckboxes = document.querySelectorAll('input[name="agencies"]:checked');
    const selectedAgencies = Array.from(agencyCheckboxes).map(cb => cb.value);
    
    // Validate at least one agency is selected
    if (selectedAgencies.length === 0) {
        alert('Please select at least one agency to notify.');
        return;
    }
    
    // Collect form data
    const alertData = {
        priority: document.querySelector('input[name="priority"]:checked').value,
        title: document.getElementById('alertTitle').value,
        type: document.getElementById('alertType').value,
        location: document.getElementById('alertLocation').value,
        parish: document.getElementById('alertParish').value,
        description: document.getElementById('alertDescription').value,
        suspectDescription: document.getElementById('suspectDescription').value,
        vehicleInfo: document.getElementById('vehicleInfo').value,
        agencies: selectedAgencies,
        sendSMS: document.getElementById('sendSMS').checked,
        publicAlert: document.getElementById('publicAlert').checked,
        timestamp: new Date().toISOString(),
        createdBy: localStorage.getItem('userEmail') || 'admin@safecity.com',
        status: 'Active',
        alertId: 'ALT-' + Date.now()
    };
    
    // Log the data (in production, send to backend)
    console.log('New Alert Data:', alertData);
    
    // TODO: Send data to backend API
    // Example:
    // fetch('/api/alerts/create', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(alertData)
    // })
    // .then(response => response.json())
    // .then(data => {
    //     addAlertToList(alertData);
    //     closeCreateAlertModal();
    //     showAlertNotification(alertData);
    // })
    // .catch(error => {
    //     alert('Failed to create alert. Please try again.');
    // });
    
    // Format priority for display
    const priorityText = alertData.priority.charAt(0).toUpperCase() + alertData.priority.slice(1);
    const priorityEmoji = {
        'critical': '🚨',
        'high': '⚠️',
        'medium': '⚡'
    }[alertData.priority];
    
    // Show success message with summary
    const agenciesList = selectedAgencies.map(a => `- ${a}`).join('\n');
    alert(`${priorityEmoji} ALERT CREATED SUCCESSFULLY!\n\nPriority: ${priorityText}\nTitle: ${alertData.title}\nLocation: ${alertData.location}, ${getParishName(alertData.parish)}\n\nNotifying:\n${agenciesList}\n\nAlert ID: ${alertData.alertId}`);
    
    // Add alert to the list immediately
    addAlertToList(alertData);
    
    // Show notification banner
    showAlertNotification(alertData);
    
    // Close modal
    closeCreateAlertModal();
}

/**
 * Adds a new alert card to the alerts list
 * @param {Object} alertData - Alert data object
 */
function addAlertToList(alertData) {
    const alertsList = document.querySelector('.alerts-list');
    
    if (!alertsList) {
        console.error('Alerts list not found');
        return;
    }
    
    // Create alert card element
    const alertCard = document.createElement('div');
    alertCard.className = 'alert-card urgent';
    
    // Get time ago
    const timeAgo = 'Just now';
    
    // Get priority icon
    const priorityIcon = {
        'critical': '🚨',
        'high': '⚠️',
        'medium': '⚡'
    }[alertData.priority] || '🚨';
    
    // Format type for display
    const typeDisplay = alertData.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    alertCard.innerHTML = `
        <div class="alert-header">
            <h3>${priorityIcon} ${alertData.title}</h3>
            <span class="alert-time">${timeAgo}</span>
        </div>
        <p><strong>Location:</strong> ${alertData.location}, ${getParishName(alertData.parish)}</p>
        <p><strong>Type:</strong> ${typeDisplay}</p>
        <p><strong>Status:</strong> Notifying ${alertData.agencies.join(', ')}</p>
        ${alertData.suspectDescription ? `<p><strong>Suspect:</strong> ${alertData.suspectDescription}</p>` : ''}
        ${alertData.vehicleInfo ? `<p><strong>Vehicle:</strong> ${alertData.vehicleInfo}</p>` : ''}
        <div class="alert-actions">
            <button class="btn btn-danger" onclick="viewAlertDetails('${alertData.alertId}')">View Details</button>
            <button class="btn btn-secondary" onclick="updateAlertStatus('${alertData.alertId}')">Update Status</button>
        </div>
    `;
    
    // Add to top of list
    alertsList.insertBefore(alertCard, alertsList.firstChild);
    console.log('Alert card added to list');
}

/**
 * Shows a notification banner for the new alert
 * @param {Object} alertData - Alert data object
 */
function showAlertNotification(alertData) {
    // Find the alerts section
    const alertsSection = document.getElementById('alerts');
    if (!alertsSection) return;
    
    // Create notification banner
    const banner = document.createElement('div');
    banner.className = 'alert-banner urgent';
    banner.innerHTML = `
        <div class="alert-icon">🚨</div>
        <div>
            <strong>ALERT BROADCAST SUCCESSFUL</strong><br>
            <span style="font-size: 0.9rem;">Emergency alert sent to ${alertData.agencies.length} agencies</span>
        </div>
    `;
    
    // Insert at top of section
    const sectionHeader = alertsSection.querySelector('.section-header');
    if (sectionHeader) {
        sectionHeader.insertAdjacentElement('afterend', banner);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            banner.style.opacity = '0';
            setTimeout(() => banner.remove(), 300);
        }, 10000);
    }
}

/**
 * Helper function to get parish display name
 * @param {string} parishValue - Parish value from form
 * @returns {string} Display name
 */
function getParishName(parishValue) {
    const parishNames = {
        'kingston': 'Kingston',
        'st_andrew': 'St. Andrew',
        'st_thomas': 'St. Thomas',
        'portland': 'Portland',
        'st_mary': 'St. Mary',
        'st_ann': 'St. Ann',
        'trelawny': 'Trelawny',
        'st_james': 'St. James',
        'hanover': 'Hanover',
        'westmoreland': 'Westmoreland',
        'st_elizabeth': 'St. Elizabeth',
        'manchester': 'Manchester',
        'clarendon': 'Clarendon',
        'st_catherine': 'St. Catherine'
    };
    return parishNames[parishValue] || parishValue;
}

/**
 * View alert details (placeholder function)
 * @param {string} alertId - Alert ID
 */
function viewAlertDetails(alertId) {
    alert(`Viewing details for Alert: ${alertId}\n\nThis would open a detailed view of the alert.`);
    console.log('View alert details:', alertId);
}

/**
 * Update alert status (placeholder function)
 * @param {string} alertId - Alert ID
 */
function updateAlertStatus(alertId) {
    const newStatus = prompt('Enter new status:\n- Active\n- Dispatched\n- Resolved\n- Cancelled');
    if (newStatus) {
        alert(`Alert ${alertId} status updated to: ${newStatus}`);
        console.log('Update alert status:', alertId, newStatus);
    }
}

// Update the window.onclick to handle both modals
const originalWindowClick = window.onclick;
window.onclick = function(event) {
    const addUserModal = document.getElementById('addUserModal');
    const createAlertModal = document.getElementById('createAlertModal');
    
    if (event.target === addUserModal) {
        closeAddUserModal();
    }
    if (event.target === createAlertModal) {
        closeCreateAlertModal();
    }
}

// Update the keydown listener to handle both modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const addUserModal = document.getElementById('addUserModal');
        const createAlertModal = document.getElementById('createAlertModal');
        
        if (addUserModal && addUserModal.classList.contains('active')) {
            closeAddUserModal();
        }
        if (createAlertModal && createAlertModal.classList.contains('active')) {
            closeCreateAlertModal();
        }
    }
});

console.log('Create Alert Modal functions loaded');
// ===================================
// ALERT ACTION MODALS FUNCTIONALITY
// ===================================

// Mock alert data (in production, this would come from your database)
const mockAlertData = {
    'alert-5678': {
        id: 'ALT-5678',
        userId: '#5678',
        title: 'Emergency Call - User #5678',
        type: 'Assault in Progress',
        location: 'Kingston Central',
        parish: 'Kingston',
        fullAddress: '123 Main Street, Kingston Central',
        description: 'User reported an assault in progress. Multiple individuals involved.',
        status: 'Dispatched to JDF',
        priority: 'Critical',
        timestamp: '2 minutes ago',
        reportedBy: 'Anonymous User',
        phone: '+1 876-555-0123',
        agencies: ['JDF'],
        officers: '2 units dispatched'
    },
    'chat-9012': {
        id: 'CHT-9012',
        userId: '#5678',
        chatId: '#9012',
        title: 'AI Escalation - Chat #9012',
        reason: 'Threatening Language Detected',
        aiConfidence: 'High (95%)',
        status: 'Awaiting Review',
        priority: 'High',
        timestamp: '10 minutes ago',
        duration: '5 minutes',
        keywords: ['weapon', 'hurt', 'tonight'],
        sentiment: 'Hostile',
        transcript: [
            { sender: 'User #5678', type: 'user', time: '14:25', text: 'I need to report something serious', flagged: false },
            { sender: 'AI Assistant', type: 'ai', time: '14:25', text: 'I\'m here to help. What would you like to report?', flagged: false },
            { sender: 'User #5678', type: 'user', time: '14:26', text: 'Someone is threatening me with a weapon', flagged: true },
            { sender: 'AI Assistant', type: 'ai', time: '14:26', text: 'This sounds very serious. Can you provide more details about your location?', flagged: false },
            { sender: 'User #5678', type: 'user', time: '14:27', text: 'They said they would hurt me tonight', flagged: true },
            { sender: 'AI Assistant', type: 'ai', time: '14:27', text: '⚠️ ESCALATING TO AUTHORITIES. Please stay in a safe location.', flagged: false }
        ]
    }
};

// ===================================
// VIEW DETAILS MODAL
// ===================================

function viewAlertDetails(alertId) {
    console.log('Viewing details for:', alertId);
    const modal = document.getElementById('viewDetailsModal');
    const content = document.getElementById('alertDetailsContent');
    
    // Get alert data (in production, fetch from server)
    const alert = mockAlertData[alertId] || mockAlertData['alert-5678'];
    
    content.innerHTML = `
        <h3 class="detail-section-title">📋 Alert Information</h3>
        <div class="detail-row">
            <div class="detail-label">Alert ID:</div>
            <div class="detail-value">${alert.id}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Title:</div>
            <div class="detail-value">${alert.title}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Type:</div>
            <div class="detail-value"><span class="tag red">${alert.type}</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Priority:</div>
            <div class="detail-value"><span class="tag red">${alert.priority}</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value"><span class="tag green">${alert.status}</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Time:</div>
            <div class="detail-value">${alert.timestamp}</div>
        </div>

        <h3 class="detail-section-title">📍 Location Details</h3>
        <div class="detail-row">
            <div class="detail-label">Location:</div>
            <div class="detail-value">${alert.fullAddress || alert.location}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Parish:</div>
            <div class="detail-value">${alert.parish}</div>
        </div>

        <h3 class="detail-section-title">ℹ️ Incident Description</h3>
        <div style="padding: 1rem; background: var(--background); border-radius: 8px;">
            <p>${alert.description}</p>
        </div>

        <h3 class="detail-section-title">👤 Reporter Information</h3>
        <div class="detail-row">
            <div class="detail-label">User ID:</div>
            <div class="detail-value">${alert.userId}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Reported By:</div>
            <div class="detail-value">${alert.reportedBy}</div>
        </div>
        ${alert.phone ? `
        <div class="detail-row">
            <div class="detail-label">Contact:</div>
            <div class="detail-value">${alert.phone}</div>
        </div>
        ` : ''}

        <h3 class="detail-section-title">🚔 Response Status</h3>
        <div class="detail-row">
            <div class="detail-label">Agencies Notified:</div>
            <div class="detail-value">${alert.agencies.join(', ')}</div>
        </div>
        ${alert.officers ? `
        <div class="detail-row">
            <div class="detail-label">Units Dispatched:</div>
            <div class="detail-value">${alert.officers}</div>
        </div>
        ` : ''}
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeViewDetailsModal() {
    const modal = document.getElementById('viewDetailsModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ===================================
// CONTACT USER MODAL
// ===================================

function contactUser(alertId) {
    console.log('Contacting user for:', alertId);
    const modal = document.getElementById('contactUserModal');
    const content = document.getElementById('userContactDetails');
    
    const alert = mockAlertData[alertId] || mockAlertData['alert-5678'];
    
    content.innerHTML = `
        <p><strong>User ID:</strong> ${alert.userId}</p>
        <p><strong>Phone:</strong> ${alert.phone || 'Not available'}</p>
        <p><strong>Location:</strong> ${alert.location}</p>
        <p><strong>Status:</strong> <span class="tag green">Online</span></p>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeContactUserModal() {
    const modal = document.getElementById('contactUserModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function initiateCall() {
    alert('📞 Initiating voice call to user...\n\nConnecting to: +1 876-555-0123');
    console.log('Initiating call');
}

function sendSMS() {
    alert('💬 SMS message sent successfully!\n\nUser will receive your message shortly.');
    console.log('Sending SMS');
}

function openChat() {
    alert('💭 Opening live chat with user...\n\nRedirecting to chat interface.');
    console.log('Opening chat');
    // In production: window.location.href = 'chat.html?userId=5678';
}

function sendQuickMessage() {
    const message = document.getElementById('contactMessage').value;
    if (!message.trim()) {
        alert('Please enter a message.');
        return;
    }
    alert(`✓ Message sent successfully!\n\n"${message}"`);
    closeContactUserModal();
}

// ===================================
// REVIEW CHAT MODAL
// ===================================

function reviewChat(chatId) {
    console.log('Reviewing chat:', chatId);
    const modal = document.getElementById('reviewChatModal');
    const content = document.getElementById('chatTranscriptContent');
    
    const chat = mockAlertData[chatId] || mockAlertData['chat-9012'];
    
    // Update chat info
    document.getElementById('reviewChatId').textContent = chat.chatId || chatId;
    document.getElementById('reviewUserId').textContent = chat.userId;
    document.getElementById('chatDuration').textContent = chat.duration;
    
    // Build transcript
    let transcriptHTML = '';
    chat.transcript.forEach(msg => {
        const messageClass = msg.flagged ? 'transcript-message flagged' : `transcript-message ${msg.type}`;
        transcriptHTML += `
            <div class="${messageClass}">
                <div class="message-header">
                    <span class="message-sender">${msg.sender}</span>
                    <span class="message-time">${msg.time}</span>
                </div>
                <div class="message-text">${msg.text}</div>
                ${msg.flagged ? '<span class="message-flag">⚠️ FLAGGED BY AI</span>' : ''}
            </div>
        `;
    });
    
    content.innerHTML = transcriptHTML;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeReviewChatModal() {
    const modal = document.getElementById('reviewChatModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function markAsFalsePositive() {
    const notes = document.getElementById('reviewNotes').value;
    const confirmed = confirm('Mark this alert as a false positive?\n\nThis will dismiss the alert and update the AI training data.');
    
    if (confirmed) {
        console.log('Marked as false positive. Notes:', notes);
        alert('✓ Alert marked as false positive.\n\nAI system will be updated to improve future detection.');
        closeReviewChatModal();
    }
}

function escalateFromReview() {
    closeReviewChatModal();
    setTimeout(() => {
        openEscalateModal('chat-9012');
    }, 300);
}

// ===================================
// ESCALATE MODAL
// ===================================

function openEscalateModal(alertId) {
    console.log('Opening escalation for:', alertId);
    const modal = document.getElementById('escalateModal');
    const content = document.getElementById('escalationAlertInfo');
    
    const alert = mockAlertData[alertId] || mockAlertData['chat-9012'];
    
    content.innerHTML = `
        <p><strong>Alert ID:</strong> ${alert.id || alert.chatId}</p>
        <p><strong>Type:</strong> <span class="tag red">${alert.type || alert.reason}</span></p>
        <p><strong>Location:</strong> ${alert.location || 'Kingston Central'}</p>
        <p><strong>Current Status:</strong> ${alert.status}</p>
        <p><strong>Time:</strong> ${alert.timestamp}</p>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeEscalateModal() {
    const modal = document.getElementById('escalateModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function confirmEscalation() {
    const agencies = Array.from(document.querySelectorAll('input[name="escalateAgencies"]:checked')).map(cb => cb.value);
    const priority = document.getElementById('escalationPriority').value;
    const reason = document.getElementById('escalationReason').value;
    const dispatchUnits = document.getElementById('dispatchUnits').checked;
    const notifyCommander = document.getElementById('notifyCommander').checked;
    
    if (agencies.length === 0) {
        alert('Please select at least one agency to notify.');
        return;
    }
    
    if (!reason.trim()) {
        alert('Please provide a reason for escalation.');
        return;
    }
    
    const agenciesList = agencies.map(a => `- ${a}`).join('\n');
    const confirmed = confirm(`🚨 CONFIRM ESCALATION\n\nPriority: ${priority.toUpperCase()}\n\nNotifying:\n${agenciesList}\n\n${dispatchUnits ? '✓ Units will be dispatched\n' : ''}${notifyCommander ? '✓ Duty Commander will be notified\n' : ''}\nProceed with escalation?`);
    
    if (confirmed) {
        console.log('Escalation confirmed', { agencies, priority, reason, dispatchUnits, notifyCommander });
        alert(`🚨 ESCALATION SUCCESSFUL\n\nAgencies notified: ${agencies.join(', ')}\nPriority: ${priority}\n\nResponse units are being deployed.`);
        closeEscalateModal();
    }
}

// Update window.onclick to handle all modals
window.onclick = function(event) {
    const modals = ['addUserModal', 'createAlertModal', 'viewDetailsModal', 'contactUserModal', 'reviewChatModal', 'escalateModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Update keydown listener for all modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = ['addUserModal', 'createAlertModal', 'viewDetailsModal', 'contactUserModal', 'reviewChatModal', 'escalateModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
});

console.log('Alert action modals loaded successfully');

// --------- API INTEGRATION (inject) ----------
const API_BASE = (function() {
    // Adjust when deploying
    return 'http://localhost:8000';
})();

async function postAlertToBackend(alertData) {
    const fd = new FormData();
    // map fields to form data (backend expects simple keys; adjust if backend schema differs)
    fd.append('priority', alertData.priority || '');
    fd.append('title', alertData.title || '');
    fd.append('type', alertData.type || '');
    fd.append('location', alertData.location || '');
    fd.append('parish', alertData.parish || '');
    fd.append('description', alertData.description || '');
    fd.append('suspectDescription', alertData.suspectDescription || '');
    fd.append('vehicleInfo', alertData.vehicleInfo || '');
    fd.append('timestamp', alertData.timestamp || new Date().toISOString());
    fd.append('createdBy', alertData.createdBy || 'web-ui');
    fd.append('status', alertData.status || 'Active');
    // append agencies as repeated fields
    if (Array.isArray(alertData.agencies)) {
        alertData.agencies.forEach(a => fd.append('agencies', a));
    }

    // if there's a file input with id "alertMedia", append first file
    const mediaInput = document.getElementById('alertMedia');
    if (mediaInput && mediaInput.files && mediaInput.files.length) {
        fd.append('media', mediaInput.files[0]);
    }

    const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        body: fd
    });

    if (!res.ok) {
        const text = await res.text().catch(()=>null);
        throw new Error(text || `HTTP ${res.status}`);
    }

    return res.json();
}

// Replace existing handler to attempt backend POST then fallback to local behavior
async function handleCreateAlert(event) {
    event.preventDefault();
    console.log('handleCreateAlert called (API-aware)');

    // Get selected agencies
    const agencyCheckboxes = document.querySelectorAll('input[name="agencies"]:checked');
    const selectedAgencies = Array.from(agencyCheckboxes).map(cb => cb.value);

    if (selectedAgencies.length === 0) {
        alert('Please select at least one agency to notify.');
        return;
    }

    const alertData = {
        priority: document.querySelector('input[name="priority"]:checked').value,
        title: document.getElementById('alertTitle').value,
        type: document.getElementById('alertType').value,
        location: document.getElementById('alertLocation').value,
        parish: document.getElementById('alertParish').value,
        description: document.getElementById('alertDescription').value,
        suspectDescription: document.getElementById('suspectDescription').value,
        vehicleInfo: document.getElementById('vehicleInfo').value,
        agencies: selectedAgencies,
        sendSMS: document.getElementById('sendSMS') ? document.getElementById('sendSMS').checked : false,
        publicAlert: document.getElementById('publicAlert') ? document.getElementById('publicAlert').checked : false,
        timestamp: new Date().toISOString(),
        createdBy: localStorage.getItem('userEmail') || 'admin@safecity.com',
        status: 'Active',
        alertId: 'ALT-' + Date.now()
    };

    // Try sending to backend, fallback to local flow on error
    try {
        const created = await postAlertToBackend(alertData);
        console.log('Alert created on backend:', created);

        // prefer backend returned object when rendering to list
        const renderData = (created && (created._id || created.id)) ? Object.assign({}, alertData, created) : alertData;

        alert(`✅ Server: Alert created (${renderData.id || renderData._id || renderData.alertId || 'OK'})`);
        addAlertToList(renderData);
        showAlertNotification(renderData);
        closeCreateAlertModal();

        // optional: refresh reports table if you add fetchReports() usage elsewhere
        if (typeof fetchReports === 'function') {
            fetchReports();
        }
        return;
    } catch (err) {
        console.warn('Backend create failed, falling back to local behavior:', err);
    }

    // --- fallback local behavior (original) ---
    const priorityText = alertData.priority.charAt(0).toUpperCase() + alertData.priority.slice(1);
    const priorityEmoji = {
        'critical': '🚨',
        'high': '⚠️',
        'medium': '⚡'
    }[alertData.priority];

    const agenciesList = selectedAgencies.map(a => `- ${a}`).join('\n');
    alert(`${priorityEmoji} ALERT CREATED SUCCESSFULLY!\n\nPriority: ${priorityText}\nTitle: ${alertData.title}\nLocation: ${alertData.location}, ${getParishName(alertData.parish)}\n\nNotifying:\n${agenciesList}\n\nAlert ID: ${alertData.alertId}`);

    addAlertToList(alertData);
    showAlertNotification(alertData);
    closeCreateAlertModal();
}

// Optional: fetch reports list from backend and populate a table/list if you add markup
async function fetchReports(skip = 0, limit = 50) {
    try {
        const res = await fetch(`${API_BASE}/reports?skip=${skip}&limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch reports');
        const reports = await res.json();
        console.log('Fetched reports:', reports);
        // implement UI populate logic if you add a table with id 'reportsTableBody'
        const tbody = document.getElementById('reportsTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        (reports || []).forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r._id || r.id || 'n/a'}</td>
                <td>${r.incidentType || r.type || r.title || 'N/A'}</td>
                <td>${r.location || 'N/A'}</td>
                <td>${new Date(r.timestamp || r.createdAt || Date.now()).toLocaleString()}</td>
                <td>${r.status || 'Unknown'}</td>
                <td><button onclick="viewAlertDetails('${r._id || r.id || r.alertId}')">View</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('fetchReports error:', err);
    }
}






















