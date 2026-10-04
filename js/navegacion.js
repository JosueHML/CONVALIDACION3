/* ═══════════════════════════════════════════════════════════════
   NAVEGACIÓN ENTRE VISTAS
   ═══════════════════════════════════════════════════════════════ */

let vistaActual = 'vista-inicio';

/* ─── Navegar entre vistas ───────────────────────────────────── */
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
  if (idVista === 'vista-resultado') {
    renderizarResultado();
  }
}

/* ─── Actualizar barra de progreso ───────────────────────────── */
function actualizarProgreso(idVista) {
  const pasos = document.querySelectorAll('.progress-step');
  pasos.forEach(p => p.classList.remove('activo', 'completado'));

  const mapeo = {
    'vista-datos': 1,
    'vista-marcar': 2,
    'vista-resultado': 3
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

  // Plan 1998: desde 1998 hasta 2022 (antes del plan 2023)
  const gestiones1998 = GESTIONES_DISPONIBLES.filter(g => {
    const anio = parseInt(g.split(" ")[0]);
    return anio >= 1998 && anio < 2023;
  });

  // Plan 2023: desde 2023 hasta 2026
  const gestiones2023 = GESTIONES_DISPONIBLES.filter(g => {
    const anio = parseInt(g.split(" ")[0]);
    return anio >= 2023 && anio <= 2026;
  });

  // Guardar valor actual para no perder la selección
  const valorActual1998 = select1998.value;
  const valorActual2023 = select2023.value;

  select1998.innerHTML = '<option value="">— Selecciona gestión —</option>' +
    gestiones1998.map(g => `<option value="${g}">${g}</option>`).join('');

  select2023.innerHTML = '<option value="">— Selecciona gestión —</option>' +
    gestiones2023.map(g => `<option value="${g}">${g}</option>`).join('');

  // Restaurar selección previa si existía
  if (valorActual1998) select1998.value = valorActual1998;
  if (valorActual2023) select2023.value = valorActual2023;
}

/* ═══════════════════════════════════════════════════════════════
   VALIDAR DATOS Y CONTINUAR
   ═══════════════════════════════════════════════════════════════ */
function validarYContinuar() {
  const nombre = document.getElementById('nombre').value.trim();
  const cedula = document.getElementById('cedula').value.trim();
  const ru = document.getElementById('ru').value.trim();
  const anioIngreso = document.getElementById('anioIngreso').value.trim();
  const mencion1998 = document.getElementById('mencion1998').value;
  const calculoIV = document.querySelector('input[name="calculoIV"]:checked');

  // Validaciones
  if (!nombre) {
    alert("⚠️ Ingresa tu nombre completo.");
    return;
  }
  if (!cedula) {
    alert("⚠️ Ingresa tu cédula de identidad.");
    return;
  }
  if (!ru) {
    alert("⚠️ Ingresa tu RU.");
    return;
  }
  if (!anioIngreso || anioIngreso < 1990 || anioIngreso > 2026) {
    alert("⚠️ Ingresa un año de ingreso válido (1990 – 2026).");
    return;
  }
  if (!mencion1998) {
    alert("⚠️ Selecciona tu mención 1998.");
    return;
  }
  if (!calculoIV) {
    alert("⚠️ Indica si aprobaste Cálculo IV.");
    return;
  }

  // Guardar en el objeto global
  ESTUDIANTE_MOCK.nombre = nombre.toUpperCase();
  ESTUDIANTE_MOCK.cedula = cedula;
  ESTUDIANTE_MOCK.ru = ru;
  ESTUDIANTE_MOCK.anioIngreso = anioIngreso;
  ESTUDIANTE_MOCK.mencion1998 = mencion1998;
  ESTUDIANTE_MOCK.aproboCalculoIV = (calculoIV.value === 'si');

  // Si aprobó Cálculo IV → forzar Ing. Sistemas
  // Si NO aprobó → respetar la mención calculada
  if (calculoIV.value === 'si') {
    ESTUDIANTE_MOCK.mencion2023aj = 'INGENIERIA DE SISTEMAS';
  } else {
    // Si no aprobó, va a Ciencias de la Computación
    ESTUDIANTE_MOCK.mencion2023aj = 'CIENCIAS DE LA COMPUTACION';
  }

  // Guardar en localStorage
  localStorage.setItem('estudiante', JSON.stringify(ESTUDIANTE_MOCK));

  // Navegar
  navegar('vista-marcar');
}

/* ═══════════════════════════════════════════════════════════════
   INICIALIZACIÓN
   ═══════════════════════════════════════════════════════════════ */
window.addEventListener('load', async () => {
  // 1. Cargar todos los JSON primero
  const ok = await cargarTodosLosDatos();
  if (!ok) {
    console.error('❌ No se pudieron cargar los datos. La app no funcionará.');
    return;
  }

  // 2. Detectar cambio de mención según Cálculo IV
  const radios = document.querySelectorAll('input[name="calculoIV"]');
  radios.forEach(r => {
    r.addEventListener('change', () => {
      const mencionAuto = document.getElementById('mencionAuto');
      if (r.value === 'si' && r.checked) {
        mencionAuto.textContent = 'INGENIERÍA DE SISTEMAS';
        ESTUDIANTE_MOCK.mencion2023aj = 'INGENIERIA DE SISTEMAS';
      } else if (r.value === 'no' && r.checked) {
        mencionAuto.textContent = 'CIENCIAS DE LA COMPUTACIÓN';
        ESTUDIANTE_MOCK.mencion2023aj = 'CIENCIAS DE LA COMPUTACION';
      }
      ESTUDIANTE_MOCK.aproboCalculoIV = (r.value === 'si');
    });
  });

  // 3. Cargar gestiones en los selects
  cargarGestionesEnSelects();

  // 4. Inicializar el lector de PDF
  inicializarLector();

  console.log('✅ Sistema listo');
});