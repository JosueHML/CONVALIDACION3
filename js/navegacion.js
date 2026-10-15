/* ═══════════════════════════════════════════════════════════════
   NAVEGACIÓN ENTRE VISTAS
   ═══════════════════════════════════════════════════════════════ */

let vistaActual = 'vista-inicio';
let flujoActual = 'manual'; // 'manual' o 'pdf'

/* ─── Navegar entre vistas (SIN PROTECCIÓN DE LOGIN) ─────────── */
function navegar(idVista) {
  // Ocultar todas las vistas
  document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));

  // Mostrar la solicitada
  const vista = document.getElementById(idVista);
  if (vista) {
    vista.classList.add('activa');
    vistaActual = idVista;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Actualizar barra de progreso
  actualizarProgreso(idVista);

  // Acciones específicas por vista
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

/* ═══════════════════════════════════════════════════════════════
   VALIDAR Y CONTINUAR SEGÚN EL BOTÓN ELEGIDO
   ═══════════════════════════════════════════════════════════════ */

/* ─── Botón SUBIR PDF ────────────────────────────────────────── */
function validarYContinuarPDF() {
  flujoActual = 'pdf';
  if (validarDatosEstudiante()) {
    navegar('vista-lector');
  }
}

/* ─── Botón LLENAR FORMA MANUAL ──────────────────────────────── */
function validarYContinuarManual() {
  flujoActual = 'manual';
  if (validarDatosEstudiante()) {
    navegar('vista-marcar');
  }
}

/* ─── Botón CONTINUAR (el de siempre) ────────────────────────── */
function validarYContinuar() {
  if (!flujoActual || flujoActual === 'manual') {
    validarYContinuarManual();
  } else {
    validarYContinuarPDF();
  }
}

/* ═══════════════════════════════════════════════════════════════
   VALIDAR DATOS DEL ESTUDIANTE
   ═══════════════════════════════════════════════════════════════ */
function validarDatosEstudiante() {
  const nombre = document.getElementById('nombre').value.trim();
  const cedula = document.getElementById('cedula').value.trim();
  const ru = document.getElementById('ru').value.trim();
  const gestionIngreso = document.getElementById('gestionIngreso').value;
  const mencionDestino = document.getElementById('mencionDestino').value;

  if (!nombre) {
    alert("⚠️ Ingresa tu nombre completo.");
    document.getElementById('nombre').focus();
    return false;
  }
  if (!cedula) {
    alert("⚠️ Ingresa tu cédula de identidad.");
    document.getElementById('cedula').focus();
    return false;
  }
  if (!ru) {
    alert("⚠️ Ingresa tu RU.");
    document.getElementById('ru').focus();
    return false;
  }
  if (!gestionIngreso) {
    alert("⚠️ Selecciona tu gestión de ingreso.");
    document.getElementById('gestionIngreso').focus();
    return false;
  }
  if (!mencionDestino) {
    alert("⚠️ Selecciona la mención a la que deseas migrar.");
    document.getElementById('mencionDestino').focus();
    return false;
  }

  ESTUDIANTE_MOCK.nombre = nombre.toUpperCase();
  ESTUDIANTE_MOCK.cedula = cedula;
  ESTUDIANTE_MOCK.ru = ru;
  ESTUDIANTE_MOCK.gestionIngreso = gestionIngreso;
  ESTUDIANTE_MOCK.anioIngreso = gestionIngreso.split(' ')[0];
  ESTUDIANTE_MOCK.mencion1998 = 'CIENCIAS DE LA COMPUTACION';
  ESTUDIANTE_MOCK.mencion2023aj = mencionDestino;
  ESTUDIANTE_MOCK.aproboCalculoIV = false;

  localStorage.setItem('estudiante', JSON.stringify(ESTUDIANTE_MOCK));

  return true;
}

/* ═══════════════════════════════════════════════════════════════
   FLUJOS — Iniciar según elección del usuario
   ═══════════════════════════════════════════════════════════════ */
function iniciarFlujoPDF() {
  flujoActual = 'pdf';
  navegar('vista-datos');
}

function iniciarFlujoManual() {
  flujoActual = 'manual';
  navegar('vista-datos');
}

/* ═══════════════════════════════════════════════════════════════
   ACTUALIZAR BARRA DE PROGRESO
   ═══════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════
   CARGAR GESTIONES EN LOS SELECTS
   ═══════════════════════════════════════════════════════════════ */
function cargarGestionesEnSelects() {
  const select1998 = document.getElementById('gestion1998');
  const select2023 = document.getElementById('gestion2023');

  if (!select1998 || !select2023) return;

  const gestiones1998 = GESTIONES_DISPONIBLES.filter(g => {
    const anio = parseInt(g.split(" ")[0]);
    return anio >= 1998 && anio <= 2026;
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

/* ═══════════════════════════════════════════════════════════════
   CARGAR GESTIONES DE INGRESO
   ═══════════════════════════════════════════════════════════════ */
function cargarGestionesIngreso() {
  const sel = document.getElementById('gestionIngreso');
  if (!sel) return;

  const gestiones = GESTIONES_DISPONIBLES.filter(g => {
    const anio = parseInt(g.split(" ")[0]);
    return anio >= 1998 && anio <= 2026;
  });

  sel.innerHTML = '<option value="">— Selecciona tu gestión de ingreso —</option>' +
    gestiones.map(g => `<option value="${g}">${g}</option>`).join('');
}

/* ═══════════════════════════════════════════════════════════════
   INICIALIZACIÓN
   ═══════════════════════════════════════════════════════════════ */

window.addEventListener('load', async () => {
  // 1. Cargar todos los JSON
  const ok = await cargarTodosLosDatos();
  if (!ok) {
    console.error('❌ No se pudieron cargar los datos.');
    return;
  }

  // 2. Ir directo a la vista de inicio
  navegar('vista-inicio');

  // 3. Cargar gestiones en los selects de los bloques
  cargarGestionesEnSelects();

  // 4. Cargar gestiones de ingreso
  cargarGestionesIngreso();

  // 5. Inicializar el lector de PDF
  inicializarLector();

  // 6. Inicializar los 2 buscadores (si existen)
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

  // 7. Inicializar el autocomplete de agregar materia manual
  const nuevaPlan = document.getElementById('nuevaPlan');
  if (nuevaPlan) {
    nuevaPlan.addEventListener('change', actualizarGestionesNuevaMateria);
  }

  console.log('✅ Sistema listo (sin login)');
});