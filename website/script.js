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






















