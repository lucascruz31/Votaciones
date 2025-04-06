// Almacenamiento de votos
let votosRegistrados = JSON.parse(localStorage.getItem('votosRegistrados')) || [];

function togglePropuesta(element) {
    const propuesta = element.nextElementSibling;
    propuesta.style.display = propuesta.style.display === 'block' ? 'none' : 'block';
}

function mostrarPropuesta(element) {
    const allPropuestas = document.querySelectorAll('.propuesta');
    allPropuestas.forEach(propuesta => propuesta.style.display = 'none');
    const propuesta = element.querySelector('.propuesta');
    propuesta.style.display = 'block';
}

function ocultarPropuesta(element) {
    const propuesta = element.querySelector('.propuesta');
    propuesta.style.display = 'none';
}

async function votar(representante) {
    try {
        // 1. Verificar estado de votación
        if (!estaVotacionActiva()) {
            alert('La votación no está activa en este momento.');
            return false;
        }

        // 2. Obtener usuario actual (simplificado para ejemplo)
        const usuarioActual = {
            id: sessionStorage.getItem('userId') || 'invitado-' + Math.random().toString(36).substr(2, 9),
            nombre: sessionStorage.getItem('userName') || 'Invitado'
        };

        // 3. Verificar si ya votó
        if (votosRegistrados.some(voto => voto.usuarioId === usuarioActual.id)) {
            alert('¡Ya has votado anteriormente!');
            return false;
        }

        // 4. Registrar el nuevo voto
        const nuevoVoto = {
            usuarioId: usuarioActual.id,
            usuarioNombre: usuarioActual.nombre,
            representante: representante,
            fecha: new Date().toISOString(),
            ip: await obtenerIP() // Opcional
        };

        votosRegistrados.push(nuevoVoto);
        localStorage.setItem('votosRegistrados', JSON.stringify(votosRegistrados));

        // 5. Mostrar confirmación y cerrar sesión
        if (confirm(`✅ Voto registrado para: ${representante}\n\nGracias por participar. La sesión se cerrará automáticamente.`)) {
            cerrarSesion();
            window.location.href = 'index.html';
        }

        return true;

    } catch (error) {
        console.error('Error al registrar voto:', error);
        alert('Ocurrió un error al registrar tu voto. Por favor intenta nuevamente.');
        return false;
    }
}

// Función para verificar si la votación está activa
function estaVotacionActiva() {
    const config = JSON.parse(localStorage.getItem('configVotacion')) || {};
    if (!config.horaInicio || !config.horaFin) return true; // Permitir si no hay configuración
    
    const ahora = new Date().getTime();
    return ahora >= config.horaInicio && ahora <= config.horaFin;
}

// Función para obtener IP (opcional)
async function obtenerIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'desconocida';
    } catch {
        return 'desconocida';
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    localStorage.removeItem('sesionTemporal');
}