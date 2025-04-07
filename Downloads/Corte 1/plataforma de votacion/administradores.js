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

// Variables globales para el modo edición
let candidatoEnEdicion = null;

// Función para cargar candidatos desde localStorage
function cargarCandidatos() {
    return JSON.parse(localStorage.getItem('candidatos')) || [];
}

// Función para guardar candidatos
function guardarCandidatos(candidatos) {
    localStorage.setItem('candidatos', JSON.stringify(candidatos));
}

// Función para mostrar la lista de candidatos
function mostrarCandidatos() {
    const candidatos = cargarCandidatos();
    const lista = document.getElementById('candidatosLista');
    
    if (!lista) return;
    
    lista.innerHTML = '';
    
    if (candidatos.length === 0) {
        lista.innerHTML = `
            <li style="text-align: center; padding: 20px; color: #aaa;">
                No hay candidatos registrados aún.<br>
                Agrega el primero usando el formulario.
            </li>
        `;
        return;
    }
    
    candidatos.forEach((cand, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                <img src="imagenes/${cand.foto}" alt="${cand.nombre}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
                <div>
                    <strong>${cand.nombre}</strong><br>
                    <small>${cand.eslogan}</small>
                </div>
            </div>
            <div style="display: flex; gap: 5px;">
                <button onclick="editarCandidato(${index})" class="btn-editar">Editar</button>
                <button onclick="eliminarCandidato(${index})" class="btn-eliminar">Eliminar</button>
            </div>
        `;
        lista.appendChild(li);
    });
}

// Función para manejar la subida de fotos
function subirFoto() {
    return new Promise((resolve) => {
        const inputFoto = document.getElementById('fotoCandidato');
        const file = inputFoto.files[0];
        
        if (!file) {
            resolve(null);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const nombreArchivo = `cand_${Date.now()}.${file.name.split('.').pop()}`;
            resolve(nombreArchivo);
        };
        reader.readAsDataURL(file);
    });
}

// Función para agregar o editar candidato
async function agregarEditarCandidato() {
    const nombre = document.getElementById('nombreCandidato').value.trim();
    const eslogan = document.getElementById('esloganCandidato').value.trim();
    
    if (!nombre) {
        alert('Por favor ingrese un nombre válido');
        return;
    }
    
    const candidatos = cargarCandidatos();
    const nombreFoto = await subirFoto();
    
    if (candidatoEnEdicion !== null) {
        // Modo edición
        const candOriginal = candidatos[candidatoEnEdicion];
        
        candidatos[candidatoEnEdicion] = {
            nombre: nombre,
            eslogan: eslogan,
            foto: nombreFoto || candOriginal.foto
        };
        
        alert('Candidato actualizado correctamente');
    } else {
        // Modo agregar
        if (candidatos.some(cand => cand.nombre.toLowerCase() === nombre.toLowerCase())) {
            alert('Ya existe un candidato con ese nombre');
            return;
        }
        
        candidatos.push({
            nombre: nombre,
            eslogan: eslogan,
            foto: nombreFoto || 'default.jpg'
        });
        
        alert('Candidato agregado correctamente');
    }
    
    guardarCandidatos(candidatos);
    mostrarCandidatos();
    limpiarFormularioCandidato();
}

// Función para editar un candidato
function editarCandidato(index) {
    const candidatos = cargarCandidatos();
    const cand = candidatos[index];
    
    document.getElementById('nombreCandidato').value = cand.nombre;
    document.getElementById('esloganCandidato').value = cand.eslogan;
    
    candidatoEnEdicion = index;
    
    document.getElementById('btnAccionCandidato').textContent = 'Guardar Cambios';
    document.getElementById('btnCancelarEdicion').style.display = 'inline-block';
}

// Función para cancelar edición
function cancelarEdicion() {
    limpiarFormularioCandidato();
}

// Función para limpiar el formulario
function limpiarFormularioCandidato() {
    document.getElementById('nombreCandidato').value = '';
    document.getElementById('esloganCandidato').value = '';
    document.getElementById('fotoCandidato').value = '';
    
    candidatoEnEdicion = null;
    document.getElementById('btnAccionCandidato').textContent = 'Agregar';
    document.getElementById('btnCancelarEdicion').style.display = 'none';
}

// Función para eliminar un candidato
function eliminarCandidato(index) {
    if (!confirm('¿Está seguro que desea eliminar este candidato? Todos sus votos también se eliminarán.')) {
        return;
    }
    
    const candidatos = cargarCandidatos();
    const candEliminado = candidatos.splice(index, 1)[0];
    guardarCandidatos(candidatos);
    
    // Eliminar votos asociados
    const votos = JSON.parse(localStorage.getItem('votosRegistrados')) || [];
    const nuevosVotos = votos.filter(voto => voto.candidato !== candEliminado.nombre);
    localStorage.setItem('votosRegistrados', JSON.stringify(nuevosVotos));
    
    mostrarCandidatos();
    cargarTablaVotos();
    alert('Candidato eliminado correctamente');
}

// Modificar la función contarVotos para usar los candidatos actuales
function contarVotos() {
    const candidatos = cargarCandidatos();
    const conteo = {};
    
    candidatos.forEach(cand => {
        conteo[cand.nombre] = 0;
    });
    
    const votosRegistrados = JSON.parse(localStorage.getItem('votosRegistrados')) || [];
    
    votosRegistrados.forEach(voto => {
        if (conteo[voto.candidato] !== undefined) {
            conteo[voto.candidato]++;
        }
    });
    
    return conteo;
}

// Actualizar el evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    verificarEstadoVotacion();
    cargarTablaVotos();
    mostrarEstadoVotacion();
    mostrarCandidatos();
    mostrarEstadoLimites();
    
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