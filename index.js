// Index Page Dynamic Features

// API Base URL - Auto-detect environment
const API_BASE_URL = (() => {
    if (window.location.protocol === 'https:' || window.location.hostname !== 'localhost') {
        const renderUrl = window.location.origin.replace(/\/$/, '');
        return `${renderUrl}/api`;
    }
    return 'http://localhost:5000/api';
})();

// Check authentication and update navigation
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadCourses();
    setupContactForm();
});

// Check if user is logged in and update navigation
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
        // User is logged in
        document.getElementById('navLogin').style.display = 'none';
        document.getElementById('navSignup').style.display = 'none';
        document.getElementById('navDashboard').style.display = 'block';
        
        if (user.role === 'admin') {
            document.getElementById('navAdmin').style.display = 'block';
        }
        
        document.getElementById('navLogout').style.display = 'block';
        
        // Setup logout
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
    } else {
        // User is not logged in
        document.getElementById('navLogin').style.display = 'block';
        document.getElementById('navSignup').style.display = 'block';
        document.getElementById('navDashboard').style.display = 'none';
        document.getElementById('navAdmin').style.display = 'none';
        document.getElementById('navLogout').style.display = 'none';
    }
}

// Load courses from API
async function loadCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    
    if (!coursesGrid) return;

    try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        
        if (response.ok) {
            const data = await response.json();
            const courses = data.courses || [];
            
            if (courses.length > 0) {
                displayCourses(courses);
            } else {
                // Show default courses if API returns empty
                displayDefaultCourses();
            }
        } else {
            // If API fails, show default courses
            displayDefaultCourses();
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        // Show default courses on error
        displayDefaultCourses();
    }
}

// Display courses in the grid
function displayCourses(courses) {
    const coursesGrid = document.getElementById('coursesGrid');
    
    coursesGrid.innerHTML = courses.map(course => `
        <div class="course-card">
            <span class="course-category">${course.category || 'Programming'}</span>
            <h3>${course.title}</h3>
            <p class="course-description">${course.description || 'Learn from industry experts and build real-world projects'}</p>
            <div class="course-details">
                <div>
                    <div class="course-price">${course.price} L.E</div>
                    <div class="course-requirements">No prerequisites required</div>
                </div>
            </div>
            <div class="course-actions">
                <a href="courses.html" class="btn-course btn-course-primary">Enroll Now</a>
                <a href="roadmap.html" class="btn-course btn-course-secondary">View Roadmap</a>
            </div>
        </div>
    `).join('');
}

// Display default courses if API is not available
function displayDefaultCourses() {
    const defaultCourses = [
        {
            title: 'Front-End Development',
            category: 'Web Development',
            price: 400,
            description: 'Learn front-end development from A-Z for beginners. Master HTML, CSS, JavaScript, and modern frameworks.'
        },
        {
            title: 'Backend Development',
            category: 'Web Development',
            price: 600,
            description: 'Learn backend development from A-Z for beginners. Build robust APIs and server-side applications.'
        },
        {
            title: 'Cybersecurity',
            category: 'Security',
            price: 500,
            description: 'Learn cybersecurity from A-Z for beginners. Protect systems and networks from threats.'
        },
        {
            title: 'AI Development',
            category: 'Artificial Intelligence',
            price: 500,
            description: 'Learn AI development from A-Z for beginners. Build intelligent applications and systems.'
        },
        {
            title: 'Desktop App Development',
            category: 'Desktop',
            price: 500,
            description: 'Learn desktop app development from A-Z for beginners. Create cross-platform applications.'
        },
        {
            title: 'Mobile App Development',
            category: 'Mobile',
            price: 500,
            description: 'Learn mobile app development from A-Z for beginners. Build iOS and Android apps.'
        }
    ];

    displayCourses(defaultCourses);
}

// Setup contact form
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('contactName').value.trim(),
            email: document.getElementById('contactEmail').value.trim(),
            message: document.getElementById('contactMessage').value.trim()
        };

        // Validate
        if (!formData.name || !formData.email || !formData.message) {
            showMessage('contactFormMessage', 'Please fill in all fields', 'error');
            return;
        }

        // Show loading state
        const submitBtn = contactForm.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            // In a real application, you would send this to your backend
            // For now, we'll just show a success message
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            showMessage('contactFormMessage', 'Thank you! Your message has been sent. We\'ll get back to you soon.', 'success');
            contactForm.reset();
        } catch (error) {
            showMessage('contactFormMessage', 'Error sending message. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Show message
function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `form-message ${type}`;
        
        if (type === 'success') {
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }
}

// Update stats (can be enhanced with real API data)
function updateStats() {
    // This can be enhanced to fetch real stats from API
    // For now, using default values
}

