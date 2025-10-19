// ===================================
// SAFECITY COMPLETE DASHBOARD SCRIPT
// ===================================

console.log('SafeCity Dashboard Loading...');

// ===================================
// TEST ACCOUNTS & AUTHENTICATION
// ===================================

const testAccounts = [
    { email: 'admin@safecity.com', password: 'Admin123!', role: 'admin', firstLogin: false },
    { email: 'jdf@safecity.com', password: 'DefaultJDF123', role: 'law-enforcement', department: 'JDF', firstLogin: true },
    { email: 'jcf@safecity.com', password: 'DefaultJCF123', role: 'law-enforcement', department: 'JCF', firstLogin: true },
    { email: 'security@safecity.com', password: 'DefaultNS123', role: 'law-enforcement', department: 'National Security', firstLogin: true }
];

// ===================================
// CRIME REPORTS - COMPLETE FIX
// ===================================

/**
 * View Report - Opens modal with details
 */
window.viewReport = function(btn) {
    console.log('viewReport clicked');
    const row = btn.closest('tr');
    if (!row) {
        console.error('Could not find row');
        return;
    }
    
    const cells = row.querySelectorAll('td');
    const reportId = cells[0]?.innerText?.trim() || '';
    const type = cells[1]?.innerText?.trim() || '';
    const location = cells[2]?.innerText?.trim() || '';
    const date = cells[3]?.innerText?.trim() || '';
    const status = cells[4]?.innerText?.trim() || '';
    const reporter = cells[5]?.innerText?.trim() || '';
    
    console.log('Report Data:', { reportId, type, location, date, status, reporter });
    
    document.getElementById('reportId').innerText = reportId;
    document.getElementById('reportType').innerText = type;
    document.getElementById('reportLocation').innerText = location;
    document.getElementById('reportDate').innerText = date;
    document.getElementById('reportStatus').innerText = status;
    document.getElementById('reportReporter').innerText = reporter;
    
    const reportModal = document.getElementById('reportDetailsModal');
    if (reportModal) {
        reportModal.classList.add('active');
        reportModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        console.log('Modal opened');
    }
};

/**
 * Close Report Details Modal
 */
window.closeReportDetailsModal = function() {
    console.log('closeReportDetailsModal called');
    const modal = document.getElementById('reportDetailsModal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
};

/**
 * Resolve Report
 */
window.resolveReport = function(btn) {
    console.log('resolveReport clicked');
    const row = btn.closest('tr');
    if (!row) return;
    
    const reportId = row.querySelector('td').innerText;
    const confirmed = confirm(`Mark report ${reportId} as resolved?`);
    
    if (confirmed) {
        const statusCell = row.querySelectorAll('td')[4];
        if (statusCell) {
            statusCell.innerHTML = '<span class="status-badge resolved">Resolved</span>';
            
            const actionCell = row.querySelectorAll('td')[6];
            if (actionCell) {
                actionCell.innerHTML = `
                    <button class="btn-action" onclick="window.viewReport(this)">View</button>
                    <button class="btn-action" onclick="window.archiveReport(this)">Archive</button>
                `;
            }
        }
        alert(`✓ Report ${reportId} marked as resolved!`);
    }
};

/**
 * Archive Report
 */
window.archiveReport = function(btn) {
    console.log('archiveReport clicked');
    const row = btn.closest('tr');
    if (!row) return;
    
    const reportId = row.querySelector('td').innerText;
    const confirmed = confirm(`Archive report ${reportId}? This action cannot be undone.`);
    
    if (confirmed) {
        row.style.opacity = '0.5';
        row.style.textDecoration = 'line-through';
        btn.disabled = true;
        alert(`✓ Report ${reportId} archived successfully!`);
    }
};

/**
 * Export Reports
 */
window.exportReports = function() {
    console.log('exportReports clicked');
    const format = prompt('Export format:\n1. CSV\n2. JSON\n\nEnter 1 or 2:', '1');
    
    if (format === '1' || format === 'csv') {
        window.exportAllReportsCSV();
    } else if (format === '2' || format === 'json') {
        window.exportAllReportsJSON();
    }
};

/**
 * Export All Reports as CSV
 */
window.exportAllReportsCSV = function() {
    console.log('Exporting reports as CSV');
    const rows = Array.from(document.querySelectorAll('#reportsTableBody tr'));
    
    const header = ['ID', 'Type', 'Location', 'Date', 'Status', 'Reporter'];
    const csvRows = [header.join(',')];
    
    rows.forEach(row => {
        const tds = row.querySelectorAll('td');
        const data = [
            tds[0]?.innerText.trim() || '',
            `"${(tds[1]?.innerText.trim() || '').replace(/"/g, '""')}"`,
            `"${(tds[2]?.innerText.trim() || '').replace(/"/g, '""')}"`,
            tds[3]?.innerText.trim() || '',
            `"${(tds[4]?.innerText.trim() || '').replace(/"/g, '""')}"`,
            `"${(tds[5]?.innerText.trim() || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(data.join(','));
    });
    
    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crime-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✓ Reports exported as CSV!');
};

/**
 * Export All Reports as JSON
 */
window.exportAllReportsJSON = function() {
    console.log('Exporting reports as JSON');
    const rows = Array.from(document.querySelectorAll('#reportsTableBody tr'));
    
    const data = rows.map(row => {
        const tds = row.querySelectorAll('td');
        return {
            id: tds[0]?.innerText.trim() || '',
            type: tds[1]?.innerText.trim() || '',
            location: tds[2]?.innerText.trim() || '',
            date: tds[3]?.innerText.trim() || '',
            status: tds[4]?.innerText.trim() || '',
            reporter: tds[5]?.innerText.trim() || ''
        };
    });
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crime-reports-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✓ Reports exported as JSON!');
};

// ===================================
// CHAT MONITORING - COMPLETE FIX
// ===================================

let currentChatId = 1;

/**
 * Select Chat and Update Display
 */
window.selectChat = function(chatId, el) {
    console.log('selectChat:', chatId);
    currentChatId = chatId;
    
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        item.classList.remove('active');
    });
    
    if (el && el.classList) {
        el.classList.add('active');
    }
    
    window.loadChatMessages(chatId);
    window.updateChatWindowHeader(chatId);
};

/**
 * Load Chat Messages
 */
window.loadChatMessages = function(chatId) {
    console.log('loadChatMessages:', chatId);
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
};

/**
 * Update Chat Window Header
 */
window.updateChatWindowHeader = function(chatId) {
    console.log('updateChatWindowHeader:', chatId);
    const chatUserInfo = document.querySelector('.chat-user-info');
    if (!chatUserInfo) return;
    
    const chatData = {
        1: { userId: '#1234', status: 'Active now - AI Assistant responding', urgent: false },
        2: { userId: '#5678', status: 'EMERGENCY - Urgent Response Required', urgent: true },
        3: { userId: '#9012', status: 'Resolved - Chat Closed', urgent: false }
    };
    
    const data = chatData[chatId] || chatData[1];
    
    chatUserInfo.innerHTML = `
        <h3>User ${data.userId}</h3>
        <p style="${data.urgent ? 'color: var(--emergency); font-weight: 600;' : ''}">${data.status}</p>
    `;
    
    const takeOverBtn = document.querySelector('.chat-actions .btn-action:first-child');
    const escalateBtn = document.querySelector('.chat-actions .btn-action.danger');
    
    if (takeOverBtn) {
        takeOverBtn.disabled = data.urgent;
        takeOverBtn.style.opacity = data.urgent ? '0.5' : '1';
    }
    
    if (escalateBtn) {
        escalateBtn.disabled = !data.urgent;
        escalateBtn.style.opacity = data.urgent ? '1' : '0.5';
    }
};

/**
 * Take Over Chat
 */
window.takeOverChat = function() {
    console.log('takeOverChat called');
    const confirmed = confirm('Take over this chat? The AI assistant will be paused.');
    
    if (confirmed) {
        alert('✓ You are now in control of this chat.\n\nAI assistant has been paused.');
        
        const aiStatus = document.querySelector('.ai-status');
        if (aiStatus) {
            aiStatus.innerHTML = '<span class="status-indicator red"></span> Admin Live Chat - You are responding';
            aiStatus.style.background = 'rgba(220, 38, 38, 0.1)';
        }
    }
};

/**
 * Escalate Chat
 */
window.escalateChat = function() {
    console.log('escalateChat called');
    const confirmed = confirm('Escalate this chat to JDF, JCDF, and National Security?');
    
    if (confirmed) {
        alert('✓ Chat escalated successfully!\n\nNotifications sent to:\n- Jamaica Defence Force (JDF)\n- Jamaica Constabulary Force (JCDF)\n- National Security');
        
        const aiStatus = document.querySelector('.ai-status');
        if (aiStatus) {
            aiStatus.innerHTML = '<span class="status-indicator red pulse"></span> 🚨 ESCALATED - Authorities Notified';
            aiStatus.style.background = 'rgba(220, 38, 38, 0.2)';
        }
    }
};

/**
 * Send Message
 */
window.sendMessage = function() {
    console.log('sendMessage called');
    const messageInput = document.getElementById('adminMessage');
    if (!messageInput) return;
    
    const messageText = messageInput.value.trim();
    if (!messageText) {
        alert('Please enter a message');
        return;
    }
    
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const messageHTML = `
        <div class="message user">
            <div class="message-content">
                <p>${messageText}</p>
                <span class="message-time">${time}</span>
            </div>
        </div>
    `;
    
    chatMessages.innerHTML += messageHTML;
    messageInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    console.log('Message sent');
};

// ===================================
// ADD USER MODAL FUNCTIONALITY
// ===================================

function openAddUserModal() {
    console.log('openAddUserModal called');
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Modal opened successfully');
    }
}

function closeAddUserModal() {
    console.log('closeAddUserModal called');
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = 'auto';
    
    const form = document.getElementById('addUserForm');
    if (form) {
        form.reset();
    }
    
    const strengthBar = document.getElementById('passwordStrengthBar');
    if (strengthBar) {
        strengthBar.className = 'password-strength-bar';
    }
}

function checkPasswordStrength() {
    const password = document.getElementById('password');
    const strengthBar = document.getElementById('passwordStrengthBar');
    
    if (!password || !strengthBar) return;
    
    const passwordValue = password.value;
    
    strengthBar.className = 'password-strength-bar';
    
    let strength = 0;
    
    if (passwordValue.length >= 8) strength++;
    if (passwordValue.match(/[a-z]/) && passwordValue.match(/[A-Z]/)) strength++;
    if (passwordValue.match(/[0-9]/)) strength++;
    if (passwordValue.match(/[^a-zA-Z0-9]/)) strength++;
    
    if (strength >= 4) {
        strengthBar.classList.add('strong');
    } else if (strength >= 2) {
        strengthBar.classList.add('medium');
    } else if (strength >= 1) {
        strengthBar.classList.add('weak');
    }
}

function handleAddUser(event) {
    event.preventDefault();
    console.log('handleAddUser called');
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match! Please re-enter your passwords.');
        return;
    }
    
    if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }
    
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
    
    console.log('New User Data:', formData);
    
    const roleText = formData.role === 'admin' ? 'System Admin' : 'Law Enforcement Personnel';
    alert(`✓ User created successfully!\n\nName: ${formData.firstName} ${formData.lastName}\nRole: ${roleText}\nEmail: ${formData.email}\nUsername: ${formData.username}`);
    
    addUserCardToGrid(formData);
    
    closeAddUserModal();
}

function addUserCardToGrid(userData) {
    const usersGrid = document.querySelector('.users-grid');
    
    if (!usersGrid) {
        console.error('Users grid not found');
        return;
    }
    
    const userCard = document.createElement('div');
    userCard.className = 'user-card';
    
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
    
    usersGrid.appendChild(userCard);
    console.log('User card added to grid');
}

// ===================================
// CREATE ALERT MODAL FUNCTIONALITY
// ===================================

function openCreateAlertModal() {
    console.log('openCreateAlertModal called');
    const modal = document.getElementById('createAlertModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Create Alert Modal opened successfully');
    }
}

function closeCreateAlertModal() {
    console.log('closeCreateAlertModal called');
    const modal = document.getElementById('createAlertModal');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = 'auto';
    
    const form = document.getElementById('createAlertForm');
    if (form) {
        form.reset();
    }
}

function handleCreateAlert(event) {
    event.preventDefault();
    console.log('handleCreateAlert called');
    
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
        sendSMS: document.getElementById('sendSMS').checked,
        publicAlert: document.getElementById('publicAlert').checked,
        timestamp: new Date().toISOString(),
        createdBy: localStorage.getItem('userEmail') || 'admin@safecity.com',
        status: 'Active',
        alertId: 'ALT-' + Date.now()
    };
    
    console.log('New Alert Data:', alertData);
    
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

function addAlertToList(alertData) {
    const alertsList = document.querySelector('.alerts-list');
    
    if (!alertsList) {
        console.error('Alerts list not found');
        return;
    }
    
    const alertCard = document.createElement('div');
    alertCard.className = 'alert-card urgent';
    
    const timeAgo = 'Just now';
    
    const priorityIcon = {
        'critical': '🚨',
        'high': '⚠️',
        'medium': '⚡'
    }[alertData.priority] || '🚨';
    
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
            <button class="btn btn-danger" onclick="window.viewAlertDetails('${alertData.alertId}')">View Details</button>
            <button class="btn btn-secondary" onclick="window.updateAlertStatus('${alertData.alertId}')">Update Status</button>
        </div>
    `;
    
    alertsList.insertBefore(alertCard, alertsList.firstChild);
    console.log('Alert card added to list');
}

function showAlertNotification(alertData) {
    const alertsSection = document.getElementById('alerts');
    if (!alertsSection) return;
    
    const banner = document.createElement('div');
    banner.className = 'alert-banner urgent';
    banner.innerHTML = `
        <div class="alert-icon">🚨</div>
        <div>
            <strong>ALERT BROADCAST SUCCESSFUL</strong><br>
            <span style="font-size: 0.9rem;">Emergency alert sent to ${alertData.agencies.length} agencies</span>
        </div>
    `;
    
    const sectionHeader = alertsSection.querySelector('.section-header');
    if (sectionHeader) {
        sectionHeader.insertAdjacentElement('afterend', banner);
        
        setTimeout(() => {
            banner.style.opacity = '0';
            setTimeout(() => banner.remove(), 300);
        }, 10000);
    }
}

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

window.viewAlertDetails = function(alertId) {
    alert(`Viewing details for Alert: ${alertId}`);
    console.log('View alert details:', alertId);
};

window.updateAlertStatus = function(alertId) {
    const newStatus = prompt('Enter new status:\n- Active\n- Dispatched\n- Resolved\n- Cancelled');
    if (newStatus) {
        alert(`Alert ${alertId} status updated to: ${newStatus}`);
        console.log('Update alert status:', alertId, newStatus);
    }
};

// ===================================
// ALERT ACTION MODALS
// ===================================

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

window.viewAlertDetails = function(alertId) {
    console.log('Viewing details for:', alertId);
    const modal = document.getElementById('viewDetailsModal');
    const content = document.getElementById('alertDetailsContent');
    
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

        <h3 class="detail-section-title">🚓 Response Status</h3>
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
};

window.closeViewDetailsModal = function() {
    const modal = document.getElementById('viewDetailsModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
};

window.contactUser = function(alertId) {
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
};

window.closeContactUserModal = function() {
    const modal = document.getElementById('contactUserModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
};

window.initiateCall = function() {
    alert('📞 Initiating voice call to user...\n\nConnecting to: +1 876-555-0123');
    console.log('Initiating call');
};

window.sendSMS = function() {
    alert('💬 SMS message sent successfully!\n\nUser will receive your message shortly.');
    console.log('Sending SMS');
};

window.openChat = function() {
    alert('💭 Opening live chat with user...\n\nRedirecting to chat interface.');
    console.log('Opening chat');
};

window.sendQuickMessage = function() {
    const message = document.getElementById('contactMessage').value;
    if (!message.trim()) {
        alert('Please enter a message.');
        return;
    }
    alert(`✓ Message sent successfully!\n\n"${message}"`);
    window.closeContactUserModal();
};

window.reviewChat = function(chatId) {
    console.log('Reviewing chat:', chatId);
    const modal = document.getElementById('reviewChatModal');
    const content = document.getElementById('chatTranscriptContent');
    
    const chat = mockAlertData[chatId] || mockAlertData['chat-9012'];
    
    document.getElementById('reviewChatId').textContent = chat.chatId || chatId;
    document.getElementById('reviewUserId').textContent = chat.userId;
    document.getElementById('chatDuration').textContent = chat.duration;
    
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
};

window.closeReviewChatModal = function() {
    const modal = document.getElementById('reviewChatModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
};

window.markAsFalsePositive = function() {
    const notes = document.getElementById('reviewNotes').value;
    const confirmed = confirm('Mark this alert as a false positive?\n\nThis will dismiss the alert and update the AI training data.');
    
    if (confirmed) {
        console.log('Marked as false positive. Notes:', notes);
        alert('✓ Alert marked as false positive.\n\nAI system will be updated to improve future detection.');
        window.closeReviewChatModal();
    }
};

window.escalateFromReview = function() {
    window.closeReviewChatModal();
    setTimeout(() => {
        window.openEscalateModal('chat-9012');
    }, 300);
};

window.openEscalateModal = function(alertId) {
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
};

window.closeEscalateModal = function() {
    const modal = document.getElementById('escalateModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
};

window.confirmEscalation = function() {
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
        window.closeEscalateModal();
    }
};

// ===================================
// DASHBOARD FUNCTIONS
// ===================================

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
            'settings': 'Settings'
        };
        pageTitleElement.textContent = titles[sectionId] || 'Dashboard';
    }
}

function logout() {
    const confirmed = confirm('Are you sure you want to logout?');
    
    if (confirmed) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

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
// CHAT DETAILS ESCALATION BUTTONS
// ===================================

window.notifyJDF = function() {
    console.log('Notify JDF clicked');
    alert('✓ Jamaica Defence Force (JDF) has been notified.\n\nResponse units are being coordinated.');
};

window.notifyJCDF = function() {
    console.log('Notify JCDF clicked');
    alert('✓ Jamaica Constabulary Force (JCDF) has been notified.\n\nResponse units are being coordinated.');
};

window.notifyNationalSecurity = function() {
    console.log('Notify National Security clicked');
    alert('✓ National Security Agency has been notified.\n\nThis is a critical escalation.');
};

window.takeOverChatFromDetails = function() {
    console.log('Take Over Chat from details clicked');
    const confirmed = confirm('Take over this chat? The AI assistant will be paused and you will respond directly.');
    
    if (confirmed) {
        alert('✓ You are now in control of this chat.\n\nAI assistant has been paused.');
        
        const aiStatus = document.querySelector('.ai-status');
        if (aiStatus) {
            aiStatus.innerHTML = '<span class="status-indicator red"></span> Admin Live Chat - You are responding';
            aiStatus.style.background = 'rgba(220, 38, 38, 0.1)';
        }
    }
};

// ===================================
// INITIALIZATION
// ===================================

window.addEventListener('DOMContentLoaded', function() {
    console.log('=== SafeCity Dashboard Initializing ===');
    
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('dashboard')) {
        const userType = localStorage.getItem('userType');
        const userEmail = localStorage.getItem('userEmail');
        
        if (!userType || !userEmail) {
            window.location.href = 'index.html';
            return;
        }
        
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = userEmail;
        }
    }
    
    simulateNotifications();
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    const messageInput = document.getElementById('adminMessage');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                window.sendMessage();
            }
        });
    }
    
    // Attach handlers to escalation action buttons
    const notifyJDFBtn = document.querySelector('.detail-section .btn-full:nth-of-type(1)');
    const notifyJCDFBtn = document.querySelector('.detail-section .btn-full:nth-of-type(2)');
    const notifyNSBtn = document.querySelector('.detail-section .btn-full:nth-of-type(3)');
    const takeOverBtn = document.querySelector('.detail-section .btn-full:nth-of-type(4)');
    
    if (notifyJDFBtn) notifyJDFBtn.onclick = window.notifyJDF;
    if (notifyJCDFBtn) notifyJCDFBtn.onclick = window.notifyJCDF;
    if (notifyNSBtn) notifyNSBtn.onclick = window.notifyNationalSecurity;
    if (takeOverBtn) takeOverBtn.onclick = window.takeOverChatFromDetails;
    
    console.log('=== SafeCity Dashboard Ready ===');
});

// Close modals on background click
window.onclick = function(event) {
    const modals = [
        'reportDetailsModal',
        'addUserModal',
        'createAlertModal',
        'viewDetailsModal',
        'contactUserModal',
        'reviewChatModal',
        'escalateModal'
    ];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
};

// Close modals on Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modals = [
            'reportDetailsModal',
            'addUserModal',
            'createAlertModal',
            'viewDetailsModal',
            'contactUserModal',
            'reviewChatModal',
            'escalateModal'
        ];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

console.log('SafeCity Script Loaded Successfully');