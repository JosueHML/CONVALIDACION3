/* ═══════════════════════════════════════════════════════════════
   RENDERIZADO DE TABLAS Y BLOQUES
   ═══════════════════════════════════════════════════════════════ */

/* ─── Renderizar bloques de materias (Plan 1998 y 2023) ──────── */
function renderizarBloquesPlanes() {
  const plan98 = getPlan1998();
  const plan23 = getPlan2023();

  if (!plan98 || !plan23) {
    console.warn('⚠️ Planes no cargados todavía');
    return;
  }

  renderizarBloque('materias1998', plan98.materias, '1998');
  renderizarBloque('materias2023', plan23.materias, '2023');
}
function renderizarBloque(contenedorId, materias, plan) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  // Generar las opciones de gestión según el plan
  const gestiones = GESTIONES_DISPONIBLES.filter(g => {
    const anio = parseInt(g.split(" ")[0]);
    if (plan === '1998') return anio >= 1998 && anio < 2023;
    return anio >= 2023 && anio <= 2026;
  });

  const opcionesGestion = gestiones.map(g =>
    `<option value="${g}">${g}</option>`
  ).join('');

  contenedor.innerHTML = materias.map(m => `
    <div class="materia-row-check" data-codigo="${m.codigo}">
      <input type="checkbox"
             data-codigo="${m.codigo}"
             data-nombre="${m.nombre}"
             data-plan="${plan}"
             onchange="toggleMateria(this)">
      <span class="codigo">${m.codigo}</span>
      <span class="nombre">${m.nombre}</span>
      <select class="select-gestion" disabled
              data-codigo="${m.codigo}"
              data-nombre="${m.nombre}"
              data-plan="${plan}">
        <option value="">— Selecciona gestión —</option>
        ${opcionesGestion}
      </select>
    </div>
  `).join('');
}

/* ─── Habilitar/deshabilitar select según checkbox ──────────── */
function toggleMateria(checkbox) {
  const fila = checkbox.closest('.materia-row-check');
  const select = fila.querySelector('.select-gestion');

  if (checkbox.checked) {
    fila.classList.add('marcada');
    select.disabled = false;
    select.focus();
  } else {
    fila.classList.remove('marcada');
    select.disabled = true;
    select.value = '';
  }
}


/* ─── Renderizar tabla de materias agregadas ─────────────────── */
function renderizarTablaAgregadas(materias) {
  const card = document.getElementById('card-agregadas');
  const contenedor = document.getElementById('tablaAgregadas');

  if (!materias || materias.length === 0) {
    card.style.display = 'none';
    return;
  }

  card.style.display = 'block';

  contenedor.innerHTML = `
    <div class="tabla-wrapper">
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Gestión</th>
            <th>Plan</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          ${materias.map((m, idx) => `
            <tr>
              <td class="codigo-cell">${m.codigo}</td>
              <td>${m.nombre}</td>
              <td>${m.gestion}</td>
              <td>${m.plan}</td>
              <td><button class="btn-volver" onclick="eliminarMateria(${idx})">×</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <p class="info-text" style="margin-top:12px;">Total: ${materias.length} materias marcadas</p>
  `;
}

/* ─── Renderizar resultado final ─────────────────────────────── */
function renderizarResultado() {
  // Cargar datos del estudiante desde localStorage
  const datosGuardados = localStorage.getItem('estudiante');
  const est = datosGuardados ? JSON.parse(datosGuardados) : ESTUDIANTE_MOCK;

  // Datos del estudiante
  document.getElementById('datosEstudiante').innerHTML = `
    <strong>👤 ${est.nombre || '—'}</strong><br>
    🆔 ${est.cedula || '—'} &nbsp;|&nbsp; 🎫 ${est.ru || '—'}<br>
    🎓 ${est.mencion2023aj || '—'}
  `;

  // Cargar materias desde localStorage (o mock)
  const materiasGuardadas = localStorage.getItem('materiasMarcadas');
  const materias = materiasGuardadas ? JSON.parse(materiasGuardadas) : MATERIAS_MARCADAS_MOCK;

  // ✅ NUEVO: calcular usando mencion1998 + mencion2023aj
  const resultado = calcularConvalidacion(
    materias,
    est.mencion1998,
    est.mencion2023aj
  );

  // Resumen (agregando electivas1998)
  const totalElectivas = resultado.electivas.length + resultado.electivas1998.length;

  document.getElementById('resumenGrid').innerHTML = `
    <div class="resumen-item resumen-convalidadas">
      <span class="numero">${resultado.convalidadas.length}</span>
      <span class="label">Convalidadas</span>
    </div>
    <div class="resumen-item resumen-electivas">
      <span class="numero">${totalElectivas}</span>
      <span class="label">Electivas</span>
    </div>
    <div class="resumen-item resumen-duplicadas">
      <span class="numero">${resultado.duplicadas.length}</span>
      <span class="label">Duplicadas</span>
    </div>
    <div class="resumen-item resumen-no">
      <span class="numero">${resultado.noConvalidan.length}</span>
      <span class="label">No convalidan</span>
    </div>
  `;

  // Semestres
  renderizarSemestres(resultado.convalidadas);

  // Electivas (64h→32h + 1998 libres)
  renderizarElectivas([
    ...resultado.electivas,
    ...resultado.electivas1998.map(e => ({
      codigo: e.codigoOrigen,
      nombre: e.nombreOrigen + " (electiva libre 1998)",
      origen: e.codigoOrigen,
      regla: "1998"
    }))
  ]);

  // Duplicadas
  renderizarDuplicadas(resultado.duplicadas);
}

function renderizarSemestres(convalidadas) {
  const contenedor = document.getElementById('resultadoSemestres');

  const semestres = [
    { titulo: "📚 1º SEMESTRE", items: convalidadas.slice(0, 4) },
    { titulo: "📚 2º SEMESTRE", items: convalidadas.slice(4, 8) },
    { titulo: "📚 3º SEMESTRE", items: convalidadas.slice(8, 12) }
  ];

  contenedor.innerHTML = semestres.filter(s => s.items.length > 0).map(s => `
    <div class="semestre-card">
      <div class="semestre-titulo">${s.titulo}</div>
      ${s.items.map(m => `
        <div class="materia-row">
          <div class="materia-origen">
            <div class="codigo">${m.codigoOrigen}</div>
            <div class="nombre">${m.nombreOrigen}</div>
            <div class="gestion">(${m.planOrigen}, ${m.gestion})</div>
          </div>
          <div class="materia-destino">
            <div class="codigo">${m.codigoDestino}</div>
            <div class="nombre">${m.nombreDestino}</div>
            <span class="badge-convalidada">✅ Convalidada</span>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function renderizarElectivas(electivas) {
  const contenedor = document.getElementById('tablaElectivas');

  if (electivas.length === 0) {
    contenedor.innerHTML = '<p class="info-text">No se generaron electivas.</p>';
    return;
  }

  contenedor.innerHTML = `
    <div class="tabla-wrapper">
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Origen</th>
          </tr>
        </thead>
        <tbody>
          ${electivas.map(e => `
            <tr>
              <td class="codigo-cell">${e.codigo}</td>
              <td>${e.nombre}</td>
              <td>${e.origen}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderizarDuplicadas(duplicadas) {
  const contenedor = document.getElementById('tablaDuplicadas');

  if (duplicadas.length === 0) {
    contenedor.innerHTML = '<p class="info-text">No hay materias duplicadas.</p>';
    return;
  }

  contenedor.innerHTML = `
    <div class="tabla-wrapper">
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Motivo</th>
          </tr>
        </thead>
        <tbody>
          ${duplicadas.map(d => `
            <tr>
              <td class="codigo-cell">${d.codigo}</td>
              <td>${d.nombre}</td>
              <td>${d.motivo}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}