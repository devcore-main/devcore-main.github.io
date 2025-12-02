// Courses Page Dynamic Features

// API Base URL - Auto-detect environment
const API_BASE_URL = (() => {
    if (window.location.protocol === 'https:' || window.location.hostname !== 'localhost') {
        const renderUrl = window.location.origin.replace(/\/$/, '');
        return `${renderUrl}/api`;
    }
    return 'http://localhost:5000/api';
})();

let allCourses = [];
let enrolledCourseIds = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadCourses();
    setupFilters();
    setupModal();
});

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
        document.getElementById('navLogin').style.display = 'none';
        document.getElementById('navSignup').style.display = 'none';
        document.getElementById('navDashboard').style.display = 'block';
        
        if (user.role === 'admin') {
            document.getElementById('navAdmin').style.display = 'block';
        }
        
        document.getElementById('navLogout').style.display = 'block';
        
        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.logout) {
                    window.logout();
                } else {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    window.location.reload();
                }
            });
        }

        // Load enrolled courses
        loadEnrolledCourses();
    } else {
        document.getElementById('navLogin').style.display = 'block';
        document.getElementById('navSignup').style.display = 'block';
        document.getElementById('navDashboard').style.display = 'none';
        document.getElementById('navAdmin').style.display = 'none';
        document.getElementById('navLogout').style.display = 'none';
    }
}

// Load all courses
async function loadCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    
    try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        
        if (response.ok) {
            const data = await response.json();
            allCourses = data.courses || [];
            
            if (allCourses.length > 0) {
                displayCourses(allCourses);
                updateCoursesCount(allCourses.length);
            } else {
                displayDefaultCourses();
            }
        } else {
            displayDefaultCourses();
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        displayDefaultCourses();
    }
}

// Load enrolled courses for current user
async function loadEnrolledCourses() {
    const token = localStorage.getItem('authToken');
    
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/enrollments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            enrolledCourseIds = data.enrollments.map(e => e.course_id);
            // Refresh display to show enrolled status
            displayCourses(allCourses);
        }
    } catch (error) {
        console.error('Error loading enrollments:', error);
    }
}

// Display courses
function displayCourses(courses) {
    const coursesGrid = document.getElementById('coursesGrid');
    
    if (courses.length === 0) {
        coursesGrid.innerHTML = '<div class="no-courses">No courses found. Check back later!</div>';
        return;
    }

    coursesGrid.innerHTML = courses.map(course => {
        const isEnrolled = enrolledCourseIds.includes(course.id);
        
        return `
            <div class="course-card" data-course-id="${course.id}">
                <span class="course-badge ${isEnrolled ? 'enrolled' : ''}">
                    ${isEnrolled ? '✓ Enrolled' : course.category || 'Programming'}
                </span>
                <h3>${course.title}</h3>
                <p class="course-description">${course.description || 'Learn from industry experts and build real-world projects'}</p>
                <div class="course-footer">
                    <div class="course-price">${course.price} L.E</div>
                    <div class="course-actions">
                        ${isEnrolled 
                            ? '<a href="dashboard.html" class="btn-view">Go to Dashboard</a>'
                            : `<button class="btn-enroll" onclick="enrollInCourse(${course.id})">Enroll Now</button>`
                        }
                        <button class="btn-view" onclick="viewCourseDetails(${course.id})">View Details</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Display default courses if API fails
function displayDefaultCourses() {
    const defaultCourses = [
        {
            id: 1,
            title: 'Front-End Development',
            category: 'Web Development',
            price: 400,
            description: 'Learn front-end development from A-Z for beginners. Master HTML, CSS, JavaScript, and modern frameworks like React.'
        },
        {
            id: 2,
            title: 'Backend Development',
            category: 'Web Development',
            price: 600,
            description: 'Learn backend development from A-Z for beginners. Build robust APIs and server-side applications with Python, Node.js, and more.'
        },
        {
            id: 3,
            title: 'Cybersecurity',
            category: 'Security',
            price: 500,
            description: 'Learn cybersecurity from A-Z for beginners. Protect systems and networks from threats, understand security best practices.'
        },
        {
            id: 4,
            title: 'AI Development',
            category: 'Artificial Intelligence',
            price: 500,
            description: 'Learn AI development from A-Z for beginners. Build intelligent applications and systems using machine learning.'
        },
        {
            id: 5,
            title: 'Desktop App Development',
            category: 'Desktop',
            price: 500,
            description: 'Learn desktop app development from A-Z for beginners. Create cross-platform applications for Windows, Mac, and Linux.'
        },
        {
            id: 6,
            title: 'Mobile App Development',
            category: 'Mobile',
            price: 500,
            description: 'Learn mobile app development from A-Z for beginners. Build iOS and Android apps using modern frameworks.'
        }
    ];

    allCourses = defaultCourses;
    displayCourses(defaultCourses);
    updateCoursesCount(defaultCourses.length);
}

// Enroll in course
async function enrollInCourse(courseId) {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        alert('Please login to enroll in courses');
        window.location.href = 'login.html';
        return;
    }

    const button = event.target;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Enrolling...';

    try {
        const response = await fetch(`${API_BASE_URL}/enrollments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ course_id: courseId })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Successfully enrolled in course!');
            enrolledCourseIds.push(courseId);
            loadCourses(); // Refresh to show enrolled status
        } else {
            alert(data.message || 'Failed to enroll in course');
            button.disabled = false;
            button.textContent = originalText;
        }
    } catch (error) {
        console.error('Enrollment error:', error);
        alert('Network error. Please try again.');
        button.disabled = false;
        button.textContent = originalText;
    }
}

// View course details
async function viewCourseDetails(courseId) {
    const modal = document.getElementById('courseModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = '<div class="loading">Loading course details...</div>';
    modal.style.display = 'block';

    try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
        
        if (response.ok) {
            const data = await response.json();
            const course = data.course;
            const isEnrolled = enrolledCourseIds.includes(course.id);
            
            let materialsHtml = '';
            if (course.materials && course.materials.length > 0) {
                materialsHtml = `
                    <div class="modal-materials">
                        <h3>Course Materials (${course.materials.length})</h3>
                        <ul class="materials-list">
                            ${course.materials.map(material => `
                                <li class="material-item">
                                    <h4>${material.title}</h4>
                                    <p>${material.material_type} • Order: ${material.order_index}</p>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            } else {
                materialsHtml = '<div class="modal-materials"><p>No materials added yet. Check back soon!</p></div>';
            }

            modalBody.innerHTML = `
                <h2 class="modal-course-title">${course.title}</h2>
                <p class="modal-course-description">${course.description || 'Learn from industry experts and build real-world projects'}</p>
                <div class="modal-course-price">${course.price} L.E</div>
                <div style="margin-bottom: 20px;">
                    <span class="course-badge">${course.category || 'Programming'}</span>
                </div>
                ${materialsHtml}
                <div style="margin-top: 30px; display: flex; gap: 10px;">
                    ${isEnrolled 
                        ? '<a href="dashboard.html" class="btn-enroll">Go to Dashboard</a>'
                        : `<button class="btn-enroll" onclick="enrollInCourse(${course.id}); closeModal();">Enroll Now</button>`
                    }
                    <button class="btn-view" onclick="closeModal()">Close</button>
                </div>
            `;
        } else {
            modalBody.innerHTML = '<div class="no-courses">Failed to load course details</div>';
        }
    } catch (error) {
        console.error('Error loading course details:', error);
        modalBody.innerHTML = '<div class="no-courses">Error loading course details</div>';
    }
}

// Setup filters
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterCourses);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterCourses);
    }
}

// Filter courses
function filterCourses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    let filtered = allCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm) ||
                            (course.description && course.description.toLowerCase().includes(searchTerm));
        const matchesCategory = !category || course.category === category;
        return matchesSearch && matchesCategory;
    });

    displayCourses(filtered);
    updateCoursesCount(filtered.length);
}

// Update courses count
function updateCoursesCount(count) {
    const countElement = document.getElementById('coursesCount');
    if (countElement) {
        countElement.textContent = `${count} course${count !== 1 ? 's' : ''} available`;
    }
}

// Setup modal
function setupModal() {
    const modal = document.getElementById('courseModal');
    const closeBtn = document.querySelector('.close-modal');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Close modal
function closeModal() {
    const modal = document.getElementById('courseModal');
    modal.style.display = 'none';
}

// Make functions global
window.enrollInCourse = enrollInCourse;
window.viewCourseDetails = viewCourseDetails;
window.closeModal = closeModal;

