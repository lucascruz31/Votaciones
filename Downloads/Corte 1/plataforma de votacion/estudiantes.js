// Función para verificar si la votación está activa
function estaVotacionActiva() {
    const config = JSON.parse(localStorage.getItem('configVotacion')) || {};
    if (!config.horaInicio || !config.horaFin) return false;
    
    const ahora = new Date().getTime();
    return ahora >= config.horaInicio && ahora <= config.horaFin;
}

// Función para mostrar el estado de la votación
function mostrarEstadoVotacion() {
    const estadoElement = document.getElementById('estadoVotacion');
    if (!estadoElement) return;

    if (estaVotacionActiva()) {
        estadoElement.textContent = 'Votación ACTIVA - Puedes votar ahora';
        estadoElement.className = 'estado-votacion activa';
    } else {
        estadoElement.textContent = 'Votación INACTIVA - No puedes votar en este momento';
        estadoElement.className = 'estado-votacion inactiva';
    }
}

// Función para cargar y mostrar los candidatos
function mostrarCandidatos() {
    const candidatos = JSON.parse(localStorage.getItem('candidatos')) || [];
    const lista = document.getElementById('listaRepresentantes');
    const mensajeElement = document.getElementById('mensajeVotacion');
    
    if (!lista) return;
    
    lista.innerHTML = '';
    
    if (candidatos.length === 0) {
        lista.innerHTML = `
            <li style="text-align: center; padding: 20px; color: #aaa;">
                No hay candidatos disponibles para votación.<br>
                Por favor, consulta con los administradores.
            </li>
        `;
        return;
    }
    
    candidatos.forEach(cand => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="imagenes/${cand.foto || 'default.jpg'}" alt="${cand.nombre}" class="foto-candidato">
            <div class="info-candidato">
                <h3>${cand.nombre}</h3>
                <div class="eslogan">"${cand.eslogan || 'Sin eslogan'}"</div>
                <button class="btn-votar" onclick="votar('${cand.nombre}')" ${!estaVotacionActiva() ? 'disabled' : ''}>
                    ${estaVotacionActiva() ? 'Votar' : 'Votación cerrada'}
                </button>
            </div>
        `;
        lista.appendChild(li);
    });
}

// Función para registrar un voto
async function votar(representante) {
    if (!estaVotacionActiva()) {
        alert('La votación no está activa en este momento.');
        return false;
    }

    // Verificar límites de votación
    const limites = JSON.parse(localStorage.getItem('limitesVotos')) || {};
    const votosRegistrados = JSON.parse(localStorage.getItem('votosRegistrados')) || [];
    
    if (limites.maximos && limites.maximos !== Infinity) {
        const totalVotos = votosRegistrados.length;
        if (totalVotos >= limites.maximos) {
            alert('Se ha alcanzado el límite máximo de votos. La votación está completa.');
            return false;
        }
    }

    // Simular ID de usuario (en una aplicación real usarías autenticación)
    const userId = sessionStorage.getItem('userId') || `temp_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('userId', userId);

    // Verificar si el usuario ya votó
    const yaVoto = votosRegistrados.some(voto => voto.usuarioId === userId);
    if (yaVoto) {
        alert('Ya has registrado tu voto.');
        return false;
    }

    // Registrar el nuevo voto
    votosRegistrados.push({
        usuarioId: userId,
        representante: representante,
        fecha: new Date().toISOString()
    });

    localStorage.setItem('votosRegistrados', JSON.stringify(votosRegistrados));
    alert(`¡Voto registrado para ${representante}! Gracias por participar.`);
    return true;
}

// Mostrar candidatos y estado al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    mostrarEstadoVotacion();
    mostrarCandidatos();
    
    // Verificar cada minuto si cambia el estado
    setInterval(() => {
        mostrarEstadoVotacion();
        mostrarCandidatos();
    }, 60000);
});