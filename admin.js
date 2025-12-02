// Admin Panel Dynamic Features

// API Base URL - Auto-detect environment
const API_BASE_URL = (() => {
    if (window.location.protocol === 'https:' || window.location.hostname !== 'localhost') {
        const renderUrl = window.location.origin.replace(/\/$/, '');
        return `${renderUrl}/api`;
    }
    return 'http://localhost:5000/api';
})();

// Check authentication and load admin data
document.addEventListener('DOMContentLoaded', async() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Check if user is admin
    if (user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'dashboard.html';
        return;
    }

    // Load admin data
    await loadAdminData(token);

    // Add logout functionality
    addLogoutButton();
});

// Load admin data
async function loadAdminData(token) {
    try {
        // Load users
        const usersResponse = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (usersResponse.ok) {
            const data = await usersResponse.json();
            updateUsersTable(data.users || []);
            updateStats(data.users || []);
        }

        // Load courses
        const coursesResponse = await fetch(`${API_BASE_URL}/courses`);
        if (coursesResponse.ok) {
            const data = await coursesResponse.json();
            updateCoursesList(data.courses || []);
            populateMaterialsCourseSelect(data.courses || []);
        }
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

// Update users table
function updateUsersTable(users) {
    const tableBody = document.querySelector('.admin-table tbody');
    if (tableBody) {
        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>#${user.id}</td>
                <td>${user.fullname}</td>
                <td>${user.email}</td>
                <td><span class="badge ${user.role === 'admin' ? 'admin' : 'user'}">${user.role}</span></td>
                <td><span class="status active">Active</span></td>
                <td>
                    <button class="btn-icon" title="Edit" onclick="editUser(${user.id})">✏️</button>
                    <button class="btn-icon" title="Delete" onclick="deleteUser(${user.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    }
}

// Update courses list
function updateCoursesList(courses) {
    const courseList = document.getElementById('coursesList');
    if (courseList) {
        if (courses.length > 0) {
            courseList.innerHTML = courses.map(course => `
                <div class="course-admin-item">
                    <div class="course-admin-info">
                        <h3>${course.title}</h3>
                        <p>Price: ${course.price} L.E | Category: ${course.category || 'N/A'}</p>
                        <div class="course-tags">
                            <span class="tag">Active</span>
                        </div>
                    </div>
                    <div class="course-admin-actions">
                        <button class="btn-small" onclick="editCourse(${course.id})">Edit</button>
                        <button class="btn-small danger" onclick="deleteCourse(${course.id})">Delete</button>
                    </div>
                </div>
            `).join('');
        } else {
            courseList.innerHTML = '<p>No courses available. Create your first course!</p>';
        }
    }
}

// Populate materials course select
function populateMaterialsCourseSelect(courses) {
    const select = document.getElementById('materialsCourseSelect');
    if (select) {
        select.innerHTML = '<option value="">Select a course...</option>' +
            courses.map(course => `<option value="${course.id}">${course.title}</option>`).join('');

        select.addEventListener('change', (e) => {
            const courseId = e.target.value;
            const addMaterialBtn = document.getElementById('addMaterialBtn');
            if (courseId) {
                addMaterialBtn.disabled = false;
                loadCourseMaterials(courseId);
            } else {
                addMaterialBtn.disabled = true;
                document.getElementById('materialsList').innerHTML =
                    '<p style="text-align: center; opacity: 0.7; padding: 40px;">Select a course to manage its materials</p>';
            }
        });
    }
}

// Load course materials
async function loadCourseMaterials(courseId) {
    const token = localStorage.getItem('authToken');
    const materialsList = document.getElementById('materialsList');

    if (!materialsList) return;

    try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/materials`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const materials = data.materials || [];

            if (materials.length > 0) {
                materialsList.innerHTML = materials.map(material => `
                    <div class="material-admin-item">
                        <div class="material-admin-info">
                            <h4>${material.title}</h4>
                            <p>Type: ${material.material_type} | Order: ${material.order_index}</p>
                            ${material.content ? `<p class="material-content-preview">${material.content.substring(0, 100)}...</p>` : ''}
                        </div>
                        <div class="material-admin-actions">
                            <button class="btn-small danger" onclick="deleteMaterial(${courseId}, ${material.id})">Delete</button>
                        </div>
                    </div>
                `).join('');
            } else {
                materialsList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 40px;">No materials added yet. Click "Add Material" to get started!</p>';
            }
        } else {
            materialsList.innerHTML = '<p style="text-align: center; color: #ff4444; padding: 40px;">Error loading materials</p>';
        }
    } catch (error) {
        console.error('Error loading materials:', error);
        materialsList.innerHTML = '<p style="text-align: center; color: #ff4444; padding: 40px;">Error loading materials</p>';
    }
}

// Show add course modal
window.showAddCourseModal = function() {
    document.getElementById('addCourseModal').style.display = 'block';
    document.getElementById('addCourseForm').reset();
};

// Close add course modal
window.closeAddCourseModal = function() {
    document.getElementById('addCourseModal').style.display = 'none';
};

// Show add material modal
window.showAddMaterialModal = function() {
    const courseId = document.getElementById('materialsCourseSelect').value;
    if (!courseId) {
        alert('Please select a course first');
        return;
    }
    document.getElementById('addMaterialModal').style.display = 'block';
    document.getElementById('addMaterialForm').reset();
};

// Close add material modal
window.closeAddMaterialModal = function() {
    document.getElementById('addMaterialModal').style.display = 'none';
};

// Delete material
window.deleteMaterial = async function(courseId, materialId) {
    if (!confirm('Are you sure you want to delete this material?')) return;

    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/materials/${materialId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Material deleted successfully');
            loadCourseMaterials(courseId);
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to delete material');
        }
    } catch (error) {
        console.error('Error deleting material:', error);
        alert('Error deleting material');
    }
};

// Update stats
function updateStats(users) {
    const totalUsers = users.length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;
    const totalRegularUsers = totalUsers - totalAdmins;

    // Update stat cards if they exist
    const userStat = document.querySelector('.stat-card:nth-child(1) .stat-number');
    if (userStat) {
        userStat.textContent = totalUsers;
    }
}

// Add logout button
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

// Placeholder functions for edit/delete actions
window.editUser = function(userId) {
    alert(`Edit user ${userId} - Feature coming soon!`);
};

window.deleteUser = function(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        alert(`Delete user ${userId} - Feature coming soon!`);
    }
};

window.editCourse = function(courseId) {
    alert(`Edit course ${courseId} - Feature coming soon!`);
};

window.deleteCourse = function(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        alert(`Delete course ${courseId} - Feature coming soon!`);
    }
};