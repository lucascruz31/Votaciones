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

// Modificar la función votar para usar los candidatos de localStorage
// Modificar la función votar para verificar los límites
async function votar(representante) {
    try {
        // Verificación de candidato (existente)
        const candidatosActuales = JSON.parse(localStorage.getItem('candidatosVotacion')) || [];
        if (!candidatosActuales.includes(representante)) {
            alert('El candidato seleccionado ya no está disponible para votación');
            return false;
        }
        
        // Verificar límites máximos
        const limites = JSON.parse(localStorage.getItem('limitesVotos')) || {};
        if (limites.maximos && limites.maximos !== Infinity) {
            const totalVotos = Object.values(contarVotos()).reduce((a, b) => a + b, 0);
            if (totalVotos >= limites.maximos) {
                alert('Se ha alcanzado el límite máximo de votos. La votación está completa.');
                return false;
            }
        }
        
        // Resto de la función (verificación de usuario, registro de voto, etc.)
        // ...
        
    } catch (error) {
        console.error('Error al registrar voto:', error);
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