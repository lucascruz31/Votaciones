// Almacenamiento de votos
let votosRegistrados = JSON.parse(localStorage.getItem('votosRegistrados')) || [];
// Agregar estas funciones al inicio del archivo

// Función para cargar los candidatos desde localStorage
function cargarCandidatos() {
    return JSON.parse(localStorage.getItem('candidatosVotacion')) || [];
}

// Función para mostrar los candidatos en la página
function mostrarCandidatos() {
    const candidatos = cargarCandidatos();
    const lista = document.getElementById('listaRepresentantes');
    
    if (!lista) return;
    
    lista.innerHTML = '';
    
    candidatos.forEach(candidato => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="imagenes/${obtenerNombreArchivo(candidato)}.jpg" alt="${candidato}" class="foto-representante">
            <div class="info-representante">
                <strong>${candidato}</strong>
                <div class="propuesta">${obtenerPropuesta(candidato)}</div>
                <button class="btn-votar" onclick="votar('${candidato}')">Votar</button>
            </div>
        `;
        lista.appendChild(li);
    });
}

// Función auxiliar para obtener el nombre de archivo de la imagen
function obtenerNombreArchivo(nombreCompleto) {
    // Convierte "Juan Pérez" a "juan" (minúsculas, sin apellido)
    return nombreCompleto.split(' ')[0].toLowerCase();
}

// Función para obtener la propuesta según el candidato (puedes personalizar esto)
function obtenerPropuesta(candidato) {
    const propuestas = {
        "Juan Pérez": "Promete mejorar las instalaciones deportivas y organizar más actividades extracurriculares.",
        "María López": "Propone implementar un programa de tutorías entre estudiantes y mejorar la biblioteca.",
        "Carlos Gómez": "Se compromete a fomentar el reciclaje y crear un club de ciencias."
    };
    
    return propuestas[candidato] || "Este candidato no ha registrado una propuesta aún.";
}

// Modificar el evento DOMContentLoaded para cargar los candidatos
document.addEventListener('DOMContentLoaded', () => {
    mostrarCandidatos();
    
    // Verificar si hay una configuración de tiempo activa
    if (!estaVotacionActiva()) {
        alert('La votación no está activa en este momento.');
    }
});

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