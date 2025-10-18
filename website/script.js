// Check authentication on dashboard pages
window.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
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
});

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

// Initialize notifications
window.addEventListener('DOMContentLoaded', function() {
    simulateNotifications();
});

// Export data functionality
function exportReports() {
    alert('Reports exported successfully!\n\nFile: SafeCity_Reports_' + new Date().toISOString().split('T')[0] + '.csv');
}

// Filter functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active to clicked button
            this.classList.add('active');
            
            // Filter logic would go here
            console.log('Filter:', this.textContent);
        });
    });
});

// Handle Enter key for sending messages
document.addEventListener('DOMContentLoaded', function() {
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

// Mock data for demo purposes
const mockReportsData = [
    { id: '00245', type: 'Assault', location: 'Kingston Central', date: '2025-10-18 10:45', status: 'Active', priority: 'high' },
    { id: '00244', type: 'Vandalism', location: 'Kingston West', date: '2025-10-18 09:30', status: 'Pending', priority: 'medium' },
    { id: '00243', type: 'Suspicious Activity', location: 'Kingston North', date: '2025-10-18 08:15', status: 'Resolved', priority: 'low' },
    { id: '00242', type: 'Theft', location: 'Kingston East', date: '2025-10-17 16:20', status: 'Pending', priority: 'medium' },
    { id: '00241', type: 'Burglary', location: 'Kingston South', date: '2025-10-17 14:10', status: 'Active', priority: 'high' }
];

console.log('SafeCity Dashboard Initialized');
console.log('Available functions: showSection(), selectChat(), takeOverChat(), escalateChat(), sendMessage(), logout()');