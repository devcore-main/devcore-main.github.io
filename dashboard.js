// Dashboard Dynamic Features

// API Base URL - Auto-detect environment
const API_BASE_URL = (() => {
    if (window.location.protocol === 'https:' || window.location.hostname !== 'localhost') {
        const renderUrl = window.location.origin.replace(/\/$/, '');
        return `${renderUrl}/api`;
    }
    return 'http://localhost:5000/api';
})();

// Check authentication and load dashboard data
document.addEventListener('DOMContentLoaded', async() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || !user) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }

    // Display user info in header
    updateHeader(user);

    // Load dashboard data
    await loadDashboardData(token);

    // Add logout functionality
    addLogoutButton();
});

// Update header with user info
function updateHeader(user) {
    const header = document.querySelector('header h1');
    if (header && user) {
        header.textContent = `Welcome, ${user.fullname || user.username}!`;
    }
}

// Load dashboard data from API
async function loadDashboardData(token) {
    try {
        // Load enrollments
        const enrollmentsResponse = await fetch(`${API_BASE_URL}/enrollments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (enrollmentsResponse.ok) {
            const data = await enrollmentsResponse.json();
            updateDashboardWithData(data.enrollments || []);
        } else {
            console.error('Failed to load enrollments');
        }

        // Update stats
        updateStats();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Update dashboard with enrollment data
function updateDashboardWithData(enrollments) {
    // Update stats
    const enrolledCount = enrollments.length;
    const completedCount = enrollments.filter(e => e.progress === 100).length;
    const totalProgress = enrollments.length > 0 ?
        Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length) :
        0;

    // Update stat cards
    const enrolledCard = document.querySelector('.stat-card:nth-child(1) .stat-number');
    const completedCard = document.querySelector('.stat-card:nth-child(2) .stat-number');
    const progressCard = document.querySelector('.stat-card:nth-child(3) .stat-number');
    const certificatesCard = document.querySelector('.stat-card:nth-child(4) .stat-number');

    if (enrolledCard) enrolledCard.textContent = enrolledCount;
    if (completedCard) completedCard.textContent = completedCount;
    if (progressCard) progressCard.textContent = `${totalProgress}%`;
    if (certificatesCard) certificatesCard.textContent = completedCount;

    // Update course list
    const courseList = document.querySelector('.course-list');
    if (courseList && enrollments.length > 0) {
        courseList.innerHTML = enrollments.map(enrollment => `
            <div class="course-item">
                <div class="course-header">
                    <h3>${enrollment.course_title || 'Course'}</h3>
                    <span class="course-status ${enrollment.progress === 100 ? 'completed' : 'in-progress'}">
                        ${enrollment.progress === 100 ? 'Completed' : 'In Progress'}
                    </span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${enrollment.progress === 100 ? 'completed' : ''}" 
                         style="width: ${enrollment.progress}%"></div>
                </div>
                <p class="progress-text">${enrollment.progress}% Complete</p>
                <div class="course-actions">
                    <a href="courses.html" class="btn-primary">Continue Learning</a>
                </div>
            </div>
        `).join('');
    } else if (courseList && enrollments.length === 0) {
        courseList.innerHTML = `
            <div class="course-item">
                <div class="course-header">
                    <h3>No courses enrolled yet</h3>
                </div>
                <p class="progress-text">Start your learning journey by enrolling in a course!</p>
                <div class="course-actions">
                    <a href="courses.html" class="btn-primary">Browse Courses</a>
                </div>
            </div>
        `;
    }
}

// Update stats (can be called separately)
function updateStats() {
    // This can be enhanced to fetch real-time stats from API
    // For now, it's handled in updateDashboardWithData
}

// Add logout button to header
function addLogoutButton() {
    const header = document.querySelector('header ul');
    if (header) {
        const logoutLi = document.createElement('li');
        logoutLi.innerHTML = '<a href="#" id="logoutBtn">Logout</a>';
        header.appendChild(logoutLi);

        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            if (window.logout) {
                window.logout();
            } else {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        });
    }
}

// Add admin panel link if user is admin
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.role === 'admin') {
        const header = document.querySelector('header ul');
        if (header) {
            const adminLi = document.createElement('li');
            adminLi.innerHTML = '<a href="admin_panel.html">Admin Panel</a>';
            header.appendChild(adminLi);
        }
    }
});