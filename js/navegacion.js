/* ═══════════════════════════════════════════════════════════════
   NAVEGACIÓN ENTRE VISTAS
   ═══════════════════════════════════════════════════════════════ */

let vistaActual = 'vista-inicio';
let flujoActual = 'manual';

function navegar(idVista) {
  document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));

  const vista = document.getElementById(idVista);
  if (vista) {
    vista.classList.add('activa');
    vistaActual = idVista;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  actualizarProgreso(idVista);

  if (idVista === 'vista-marcar') {
    cargarGestionesEnSelects();
    renderizarBloquesPlanes();
  }
  if (idVista === 'vista-electivas') {
    renderizarElectivasA_Elegir();
  }
  if (idVista === 'vista-resultado') {
    renderizarResultado();
  }
}

function iniciarFlujoPDF() {
  flujoActual = 'pdf';
  navegar('vista-datos');
}

function iniciarFlujoManual() {
  flujoActual = 'manual';
  navegar('vista-datos');
}

function actualizarProgreso(idVista) {
  const pasos = document.querySelectorAll('.progress-step');
  pasos.forEach(p => p.classList.remove('activo', 'completado'));

  const mapeo = {
    'vista-datos': 1,
    'vista-lector': 2,
    'vista-marcar': 2,
    'vista-electivas': 3,
    'vista-resultado': 4
  };

  const pasoActual = mapeo[idVista] || 0;

  pasos.forEach((p, idx) => {
    const num = idx + 1;
    if (num < pasoActual) p.classList.add('completado');
    if (num === pasoActual) p.classList.add('activo');
  });
}

function cargarGestionesEnSelects() {
  const select1998 = document.getElementById('gestion1998');
  const select2023 = document.getElementById('gestion2023');

  if (!select1998 || !select2023) return;

  const gestiones1998 = GESTIONES_DISPONIBLES.filter(g => {
    const anio = parseInt(g.split(" ")[0]);
    return anio >= 1998 && anio < 2023;
  });

  const gestiones2023 = GESTIONES_DISPONIBLES.filter(g => {
    const anio = parseInt(g.split(" ")[0]);
    return anio >= 2023 && anio <= 2026;
  });

  const valorActual1998 = select1998.value;
  const valorActual2023 = select2023.value;

  select1998.innerHTML = '<option value="">— Selecciona gestión —</option>' +
    gestiones1998.map(g => `<option value="${g}">${g}</option>`).join('');

  select2023.innerHTML = '<option value="">— Selecciona gestión —</option>' +
    gestiones2023.map(g => `<option value="${g}">${g}</option>`).join('');

  if (valorActual1998) select1998.value = valorActual1998;
  if (valorActual2023) select2023.value = valorActual2023;
}

function validarYContinuar() {
  const nombre = document.getElementById('nombre').value.trim();
  const cedula = document.getElementById('cedula').value.trim();
  const ru = document.getElementById('ru').value.trim();
  const anioIngreso = document.getElementById('anioIngreso').value.trim();
  const mencionDestino = document.getElementById('mencionDestino').value;
  const calculoIV = document.querySelector('input[name="calculoIV"]:checked');

  if (!nombre) { alert("⚠️ Ingresa tu nombre completo."); return; }
  if (!cedula) { alert("⚠️ Ingresa tu cédula de identidad."); return; }
  if (!ru) { alert("⚠️ Ingresa tu RU."); return; }
  if (!anioIngreso || anioIngreso < 1990 || anioIngreso > 2026) {
    alert("⚠️ Ingresa un año de ingreso válido (1990 – 2026).");
    return;
  }
  if (!mencionDestino) { alert("⚠️ Selecciona la mención a la que deseas migrar."); return; }
  if (!calculoIV) { alert("⚠️ Indica si aprobaste Cálculo IV en el plan 1998."); return; }

  ESTUDIANTE_MOCK.nombre = nombre.toUpperCase();
  ESTUDIANTE_MOCK.cedula = cedula;
  ESTUDIANTE_MOCK.ru = ru;
  ESTUDIANTE_MOCK.anioIngreso = anioIngreso;
  ESTUDIANTE_MOCK.aproboCalculoIV = (calculoIV.value === 'si');

  if (calculoIV.value === 'si') {
    ESTUDIANTE_MOCK.mencion1998 = 'INGENIERIA DE SISTEMAS';
  } else {
    ESTUDIANTE_MOCK.mencion1998 = 'CIENCIAS DE LA COMPUTACION';
  }

  ESTUDIANTE_MOCK.mencion2023aj = mencionDestino;

  localStorage.setItem('estudiante', JSON.stringify(ESTUDIANTE_MOCK));

  if (flujoActual === 'pdf') {
    navegar('vista-lector');
  } else {
    navegar('vista-marcar');
  }
}

/* ═══════════════════════════════════════════════════════════════
   INICIALIZACIÓN
   ═══════════════════════════════════════════════════════════════ */
window.addEventListener('load', async () => {
  const ok = await cargarTodosLosDatos();
  if (!ok) {
    console.error('❌ No se pudieron cargar los datos.');
    return;
  }

  cargarGestionesEnSelects();
  inicializarLector();

  // ═══════════════════════════════════════════════════════════
  // Inicializar los 2 buscadores
  // ═══════════════════════════════════════════════════════════
  const buscador1998 = document.getElementById('buscador1998');
  if (buscador1998) {
    buscador1998.addEventListener('input', (e) => {
      filtrarMaterias(e.target.value, '1998');
    });
  }

  const buscador2023 = document.getElementById('buscador2023');
  if (buscador2023) {
    buscador2023.addEventListener('input', (e) => {
      filtrarMaterias(e.target.value, '2023');
    });
  }

  console.log('✅ Sistema listo');
});