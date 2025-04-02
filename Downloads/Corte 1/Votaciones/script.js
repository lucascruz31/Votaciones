document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en una página protegida
    if (window.location.pathname.endsWith('admin.html') || 
        window.location.pathname.endsWith('student.html')) {
        
        const userType = sessionStorage.getItem('userType');
        if (!userType) {
            window.location.href = 'index.html';
            return;
        }
        
        // Verificar que el tipo de usuario coincida con la página
        if (window.location.pathname.endsWith('admin.html') && userType !== 'admin') {
            window.location.href = 'index.html';
        }
        if (window.location.pathname.endsWith('student.html') && userType !== 'student') {
            window.location.href = 'index.html';
        }
    }

    // Configurar botones de selección de usuario
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            sessionStorage.setItem('userType', 'admin');
            window.location.href = 'admin.html';
        });
    }

    const studentBtn = document.getElementById('student-btn');
    if (studentBtn) {
        studentBtn.addEventListener('click', function() {
            sessionStorage.setItem('userType', 'student');
            window.location.href = 'student.html';
        });
    }

    // Configurar botón de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('userType');
            window.location.href = 'index.html';
        });
    }
});