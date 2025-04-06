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

// Reemplazar la función contarVotos con esta versión mejorada
function contarVotos() {
    const candidatosActuales = cargarCandidatos();
    const votosRegistrados = JSON.parse(localStorage.getItem('votosRegistrados')) || [];
    const conteo = {};

    // Inicializar el conteo solo con los candidatos actuales
    candidatosActuales.forEach(candidato => {
        conteo[candidato] = 0;
    });

    // Contar solo los votos de candidatos actuales
    votosRegistrados.forEach(voto => {
        if (candidatosActuales.includes(voto.representante)) {
            conteo[voto.representante]++;
        }
    });

    return conteo;
}

// Modificar la función cargarTablaVotos para que sea dinámica
function cargarTablaVotos() {
    const conteo = contarVotos();
    const tbody = document.querySelector('#conteoVotos tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Crear filas solo para los candidatos actuales
    for (const [candidato, votos] of Object.entries(conteo)) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${candidato}</td>
            <td>${votos}</td>
        `;
        tbody.appendChild(tr);
    }
}

// Función para limpiar votos de candidatos eliminados
function limpiarVotosAntiguos() {
    const candidatosActuales = cargarCandidatos();
    const votosRegistrados = JSON.parse(localStorage.getItem('votosRegistrados')) || [];
    
    // Filtrar solo votos de candidatos actuales
    const votosActualizados = votosRegistrados.filter(voto => 
        candidatosActuales.includes(voto.representante)
    );
    
    localStorage.setItem('votosRegistrados', JSON.stringify(votosActualizados));
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

// Función para cargar los candidatos desde localStorage
function cargarCandidatos() {
    const candidatos = JSON.parse(localStorage.getItem('candidatosVotacion')) || [
        "Juan Pérez",
        "María López",
        "Carlos Gómez"
    ];
    return candidatos;
}

// Función para guardar los candidatos en localStorage
function guardarCandidatos(candidatos) {
    localStorage.setItem('candidatosVotacion', JSON.stringify(candidatos));
}

// Función para mostrar la lista de candidatos
function mostrarCandidatos() {
    const candidatos = cargarCandidatos();
    const lista = document.getElementById('candidatosLista');
    
    if (!lista) return;
    
    lista.innerHTML = '';
    
    candidatos.forEach((candidato, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${candidato}
            <button onclick="eliminarCandidato(${index})" class="btn-eliminar">Eliminar</button>
        `;
        lista.appendChild(li);
    });
}

// Función para agregar un nuevo candidato
function agregarCandidato() {
    const input = document.getElementById('nuevoCandidato');
    const nombre = input.value.trim();
    
    if (!nombre) {
        alert('Por favor ingrese un nombre válido');
        return;
    }
    
    const candidatos = cargarCandidatos();
    
    if (candidatos.includes(nombre)) {
        alert('Este candidato ya existe');
        return;
    }
    
    candidatos.push(nombre);
    guardarCandidatos(candidatos);
    mostrarCandidatos();
    input.value = '';
    alert('Candidato agregado correctamente');
    
    // Actualizar la tabla de votos si es necesario
    cargarTablaVotos();
}

// Función para eliminar un candidato
function eliminarCandidato(index) {
    if (!confirm('¿Está seguro que desea eliminar este candidato? Todos los votos asociados también se eliminarán.')) {
        return;
    }
    
    const candidatos = cargarCandidatos();
    const candidatoEliminado = candidatos.splice(index, 1);
    guardarCandidatos(candidatos);
    
    // Eliminar votos asociados a este candidato
    const votos = JSON.parse(localStorage.getItem('votosRegistrados')) || [];
    const nuevosVotos = votos.filter(voto => voto.representante !== candidatoEliminado[0]);
    localStorage.setItem('votosRegistrados', JSON.stringify(nuevosVotos));
    
    mostrarCandidatos();
    cargarTablaVotos();
    alert('Candidato eliminado correctamente');
}

// Modificar la función contarVotos para usar los candidatos de localStorage
function contarVotos() {
    const candidatos = cargarCandidatos();
    const conteo = {};
    
    // Inicializar conteo para cada candidato
    candidatos.forEach(candidato => {
        conteo[candidato] = 0;
    });
    
    const votosRegistrados = JSON.parse(localStorage.getItem('votosRegistrados')) || [];
    
    votosRegistrados.forEach(voto => {
        if (conteo[voto.representante] !== undefined) {
            conteo[voto.representante]++;
        }
    });
    
    return conteo;
}

// Modificar el evento DOMContentLoaded para incluir mostrarCandidatos
document.addEventListener('DOMContentLoaded', () => {
    verificarEstadoVotacion();
    cargarTablaVotos();
    mostrarEstadoVotacion();
    mostrarCandidatos();
    
    setInterval(() => {
        verificarEstadoVotacion();
        mostrarEstadoVotacion();
    }, 60000);
});

// Función para cargar los límites actuales
function cargarLimitesVotos() {
    const limites = JSON.parse(localStorage.getItem('limitesVotos')) || {
        minimos: 0,
        maximos: Infinity
    };
    return limites;
}

// Función para guardar los límites
function guardarLimitesVotos() {
    const minimos = parseInt(document.getElementById('votosMinimos').value);
    const maximos = parseInt(document.getElementById('votosMaximos').value);
    
    if (isNaN(minimos) || isNaN(maximos)) {
        alert('Por favor ingrese valores numéricos válidos');
        return;
    }
    
    if (minimos < 0) {
        alert('El mínimo no puede ser negativo');
        return;
    }
    
    if (maximos <= 0) {
        alert('El máximo debe ser mayor que cero');
        return;
    }
    
    if (maximos < minimos) {
        alert('El máximo no puede ser menor que el mínimo');
        return;
    }
    
    const nuevosLimites = {
        minimos: minimos,
        maximos: maximos
    };
    
    localStorage.setItem('limitesVotos', JSON.stringify(nuevosLimites));
    mostrarEstadoLimites();
    alert('Límites de votación guardados correctamente');
}

// Función para mostrar el estado actual de los límites
function mostrarEstadoLimites() {
    const limites = cargarLimitesVotos();
    const estadoElement = document.getElementById('estadoLimites');
    
    if (!estadoElement) return;
    
    estadoElement.innerHTML = `
        <strong>Límites actuales:</strong><br>
        • Mínimo requerido: ${limites.minimos} votos<br>
        • Máximo permitido: ${limites.maximos === Infinity ? 'Sin límite' : limites.maximos + ' votos'}
    `;
    
    estadoElement.style.backgroundColor = '#e7f5ff';
    estadoElement.style.border = '1px solid #a5d8ff';
}

// Función para verificar si se alcanzaron los límites
function verificarLimitesVotos() {
    const limites = cargarLimitesVotos();
    const totalVotos = Object.values(contarVotos()).reduce((a, b) => a + b, 0);
    
    return {
        minimoAlcanzado: totalVotos >= limites.minimos,
        maximoAlcanzado: totalVotos >= limites.maximos,
        totalVotos: totalVotos
    };
}

// Modificar el evento DOMContentLoaded para incluir los límites
document.addEventListener('DOMContentLoaded', () => {
    verificarEstadoVotacion();
    cargarTablaVotos();
    mostrarEstadoVotacion();
    mostrarCandidatos();
    mostrarEstadoLimites();
    
    // Cargar valores actuales en los inputs
    const limites = cargarLimitesVotos();
    document.getElementById('votosMinimos').value = limites.minimos;
    document.getElementById('votosMaximos').value = limites.maximos === Infinity ? '' : limites.maximos;
    
    setInterval(() => {
        verificarEstadoVotacion();
        mostrarEstadoVotacion();
    }, 60000);
});
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