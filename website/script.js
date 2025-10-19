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
            // Mark that password change is required
            localStorage.setItem('requiresPasswordChange', 'true');
            
            // Redirect to password change page
            window.location.href = 'change-password.html';
        } else {
            // Redirect to appropriate dashboard
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
    
    // Find matching account
    const account = testAccounts.find(acc => acc.email === email && acc.password === password);
    
    if (account) {
        // Store user data
        localStorage.setItem('userType', account.role);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userDepartment', account.department);
        localStorage.setItem('badgeNumber', account.department + '-12345');
        localStorage.setItem('department', account.department);
        
        // Check if first login
        if (account.firstLogin) {
            // Mark that password change is required
            localStorage.setItem('requiresPasswordChange', 'true');
            
            // Redirect to password change page
            window.location.href = 'change-password.html';
        } else {
            // Redirect to law enforcement dashboard
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
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match!';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
        errorDiv.textContent = 'Password must be at least 8 characters long!';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Check for at least one number and one special character
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    if (!hasNumber || !hasSpecial) {
        errorDiv.textContent = 'Password must contain at least one number and one special character!';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Password is valid
    errorDiv.style.display = 'none';
    
    // Get user info before clearing
    const userType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userEmail');
    const userDepartment = localStorage.getItem('userDepartment');
    const badgeNumber = localStorage.getItem('badgeNumber');
    const department = localStorage.getItem('department');
    
    // Mark as password changed
    localStorage.setItem('passwordChanged', 'true');
    localStorage.removeItem('requiresPasswordChange');
    
    // In production, update password in backend here
    // For now, we'll update the test account to mark it as no longer first login
    
    alert('Password changed successfully!\n\nWelcome to SafeCity!');
    
    // Redirect to appropriate dashboard based on user type
    if (userType === 'admin') {
        window.location.href = 'admin-dashboard.html';
    } else if (userType === 'law-enforcement') {
        window.location.href = 'law-enforcement-dashboard.html';
    } else {
        // Fallback to login if user type not found
        window.location.href = 'admin-login.html';
    }
}

// ===================================
// USER CREATION (ADMIN DASHBOARD)
// ===================================

function showCreateUserModal() {
    const modal = document.getElementById('createUserModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeCreateUserModal() {
    const modal = document.getElementById('createUserModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    const form = document.getElementById('createUserForm');
    if (form) {
        form.reset();
    }
    
    const generatedPassword = document.getElementById('generatedPassword');
    if (generatedPassword) {
        generatedPassword.style.display = 'none';
    }
    
    const departmentGroup = document.getElementById('departmentGroup');
    if (departmentGroup) {
        departmentGroup.style.display = 'none';
    }
}

function updateDepartmentOptions() {
    const role = document.getElementById('userRole').value;
    const departmentGroup = document.getElementById('departmentGroup');
    const userDepartment = document.getElementById('userDepartment');
    
    if (role === 'law-enforcement') {
        departmentGroup.style.display = 'block';
        userDepartment.required = true;
    } else {
        departmentGroup.style.display = 'none';
        userDepartment.required = false;
    }
}

function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function copyPassword() {
    const password = document.getElementById('passwordDisplay').textContent;
    navigator.clipboard.writeText(password).then(() => {
        alert('Password copied to clipboard!');
    });
}

function handleCreateUser(e) {
    e.preventDefault();
    
    const email = document.getElementById('userEmail').value;
    const role = document.getElementById('userRole').value;
    const department = document.getElementById('userDepartment').value;
    const name = document.getElementById('userName').value;
    
    // Generate default password
    const defaultPassword = 'Default' + role.substring(0, 3).toUpperCase() + '123';
    
    // Display generated password
    document.getElementById('passwordDisplay').textContent = defaultPassword;
    document.getElementById('generatedPassword').style.display = 'block';
    
    // In production, this would be an API call
    const newUser = {
        email: email,
        role: role,
        department: department || 'Administration',
        name: name,
        password: defaultPassword,
        firstLogin: true,
        createdAt: new Date().toISOString(),
        status: 'pending-password-change'
    };
    
    console.log('New user created:', newUser);
    
    // Show success message
    setTimeout(() => {
        alert(`Account created successfully!\n\nEmail: ${email}\nDefault Password: ${defaultPassword}\n\nUser must change password on first login.`);
        
        // Reload users table
        location.reload();
    }, 2000);
}

// ===================================
// INITIALIZATION ON PAGE LOAD
// ===================================
// ===================================
// INITIALIZATION ON PAGE LOAD
// ===================================

window.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    // Check if on change password page
    if (currentPage.includes('change-password')) {
        const requiresPasswordChange = localStorage.getItem('requiresPasswordChange');
        
        if (!requiresPasswordChange) {
            // Redirect to login if not authorized
            window.location.href = 'admin-login.html';
        }
        
        // Attach change password form handler
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
    
    // Check if on admin dashboard
    if (currentPage.includes('admin-dashboard')) {
        const createUserForm = document.getElementById('createUserForm');
        if (createUserForm) {
            createUserForm.addEventListener('submit', handleCreateUser);
        }
    }
    
    // Check authentication on dashboard pages
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
                const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
                userNameElement.textContent = adminData.fullName || userEmail;
            }
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
            console.log('Filter:', this.textContent);
        });
    });
    
    // Handle Enter key for sending messages
    const messageInput = document.getElementById('adminMessage');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

// ===================================
// DASHBOARD FUNCTIONS
// ===================================

// Show/Hide Dashboard Sections
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked nav item
    const activeNavItem = document.querySelector(`[href="#${sectionId}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Update page title
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
    
    // Remove active class from all chat items
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected chat
    event.currentTarget.classList.add('active');
    
    // Load chat messages (this would typically fetch from backend)
    loadChatMessages(chatId);
}

function loadChatMessages(chatId) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // Mock chat data (in production, this would fetch from backend)
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
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Take Over Chat
function takeOverChat() {
    alert('You are now in control of this chat. The AI assistant has been paused.');
    
    // Update UI to show admin is now chatting
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
        
        // Update chat status
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
    
    // Add message to chat
    const messageHTML = `
        <div class="message user">
            <div class="message-content">
                <p>${messageText}</p>
                <span class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        </div>
    `;
    
    chatMessages.innerHTML += messageHTML;
    
    // Clear input
    messageInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate AI or user response (in production, this would be real-time)
    setTimeout(() => {
        const responseHTML = `
            <div class="message ai">
                <div class="ai-badge">👮 You</div>
                <div class="message-content">
                    <p>Message sent successfully</p>
                    <span class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            </div>
        `;
        chatMessages.innerHTML += responseHTML;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}

// Logout
function logout() {
    const confirmed = confirm('Are you sure you want to logout?');
    
    if (confirmed) {
        localStorage.removeItem('userType');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('adminData');
        localStorage.removeItem('badgeNumber');
        localStorage.removeItem('department');
        
        window.location.href = 'index.html';
    }
}

// Real-time notifications simulation
function simulateNotifications() {
    const notificationBadge = document.querySelector('.notification-badge');
    if (!notificationBadge) return;
    
    setInterval(() => {
        const currentCount = parseInt(notificationBadge.textContent);
        // Randomly add notifications
        if (Math.random() > 0.7) {
            notificationBadge.textContent = currentCount + 1;
        }
    }, 30000); // Every 30 seconds
}

// Export data functionality
function exportReports() {
    alert('Reports exported successfully!\n\nFile: SafeCity_Reports_' + new Date().toISOString().split('T')[0] + '.csv');
}

// Mock data for demo purposes
const mockReportsData = [
    { id: '00245', type: 'Assault', location: 'Kingston Central', date: '2025-10-18 10:45', status: 'Active', priority: 'high' },
    { id: '00244', type: 'Vandalism', location: 'Kingston West', date: '2025-10-18 09:30', status: 'Pending', priority: 'medium' },
    { id: '00243', type: 'Suspicious Activity', location: 'Kingston North', date: '2025-10-18 08:15', status: 'Resolved', priority: 'low' },
    { id: '00242', type: 'Theft', location: 'Kingston East', date: '2025-10-17 16:20', status: 'Pending', priority: 'medium' },
    { id: '00241', type: 'Burglary', location: 'Kingston South', date: '2025-10-17 14:10', status: 'Active', priority: 'high' }
];

// ===================================
// END OF SCRIPT
// ===================================

console.log('SafeCity Dashboard Initialized');
console.log('Available functions: showSection(), selectChat(), takeOverChat(), escalateChat(), sendMessage(), logout()');
console.log('Available functions: togglePassword(), handleAdminLogin(), handleChangePassword(), showCreateUserModal()');


























