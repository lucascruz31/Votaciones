// Configuración y estado de la votación
const configVotacion = JSON.parse(localStorage.getItem('configVotacion')) || {
    activa: false,
    horaInicio: null,
    horaFin: null
};

// Recuperar los votos registrados desde localStorage
const votosRegistrados = JSON.parse(localStorage.getItem('votosRegistrados')) || [];

// Función para verificar el estado de la votación
function verificarEstadoVotacion() {
    const ahora = new Date().getTime();
    
    if (configVotacion.horaInicio && configVotacion.horaFin) {
        if (ahora >= configVotacion.horaInicio && ahora <= configVotacion.horaFin) {
            if (!configVotacion.activa) {
                configVotacion.activa = true;
                localStorage.setItem('configVotacion', JSON.stringify(configVotacion));
                console.log('Votación iniciada');
            }
            return true;
        } else {
            if (configVotacion.activa) {
                configVotacion.activa = false;
                localStorage.setItem('configVotacion', JSON.stringify(configVotacion));
                console.log('Votación finalizada');
                // Recargar para mostrar resultados finales
                window.location.reload();
            }
            return false;
        }
    }
    return false;
}

// Función para configurar el tiempo de votación (para el admin)
function configurarTiempoVotacion(inicio, fin) {
    const nuevaConfig = {
        activa: false,
        horaInicio: new Date(inicio).getTime(),
        horaFin: new Date(fin).getTime()
    };
    
    localStorage.setItem('configVotacion', JSON.stringify(nuevaConfig));
    verificarEstadoVotacion();
    alert('Configuración de tiempo guardada. La votación se activará automáticamente.');
}

// Función para registrar un voto (modificada)
function registrarVoto(representante, usuarioId) {
    if (!verificarEstadoVotacion()) {
        alert('La votación no está activa en este momento.');
        return false;
    }

    // Verificar si el usuario ya votó
    const yaVoto = votosRegistrados.some(voto => voto.usuarioId === usuarioId);
    if (yaVoto) {
        alert('Ya has registrado tu voto.');
        return false;
    }

    // Registrar el nuevo voto
    votosRegistrados.push({
        usuarioId,
        representante,
        fecha: new Date().toISOString()
    });

    localStorage.setItem('votosRegistrados', JSON.stringify(votosRegistrados));
    alert(`Voto registrado para ${representante}`);
    return true;
}

// Función para contar los votos por representante (tal como la tienes)
function contarVotos() {
    const conteo = {
        "Juan Pérez": 0,
        "María López": 0,
        "Carlos Gómez": 0
    };

    votosRegistrados.forEach(voto => {
        if (conteo[voto.representante] !== undefined) {
            conteo[voto.representante]++;
        }
    });

    return conteo;
}

// Función para cargar los votos en la tabla (tal como la tienes)
function cargarTablaVotos() {
    const conteo = contarVotos();

    const votosJuan = document.getElementById('votosJuan');
    const votosMaria = document.getElementById('votosMaria');
    const votosCarlos = document.getElementById('votosCarlos');

    if (votosJuan) votosJuan.textContent = conteo["Juan Pérez"];
    if (votosMaria) votosMaria.textContent = conteo["María López"];
    if (votosCarlos) votosCarlos.textContent = conteo["Carlos Gómez"];
}

// Mostrar estado de la votación
function mostrarEstadoVotacion() {
    const estadoElement = document.getElementById('estadoVotacion');
    if (!estadoElement) return;

    if (configVotacion.activa) {
        estadoElement.textContent = 'Votación ACTIVA';
        estadoElement.style.color = 'green';
    } else {
        estadoElement.textContent = 'Votación INACTIVA';
        estadoElement.style.color = 'red';
    }
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    verificarEstadoVotacion();
    cargarTablaVotos();
    mostrarEstadoVotacion();
    
    // Verificar cada minuto si cambia el estado
    setInterval(() => {
        verificarEstadoVotacion();
        mostrarEstadoVotacion();
    }, 60000);
});