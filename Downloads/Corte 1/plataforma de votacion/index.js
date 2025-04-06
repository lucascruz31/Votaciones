document.getElementById('formInicioSesion').addEventListener('submit', function (e) {
    e.preventDefault();

    const rol = document.getElementById('rol').value;

    if (rol === 'estudiante') {
        window.location.href = 'estudiantes.html';
    } else if (rol === 'administrador') {
        window.location.href = 'administradores.html';
    } else {
        document.getElementById('mensaje').textContent = 'Por favor, selecciona un rol válido.';
        document.getElementById('mensaje').style.color = 'red';
    }
});
