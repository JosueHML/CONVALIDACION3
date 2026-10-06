/* ═══════════════════════════════════════════════════════════════
   RENDERIZADO DE TABLAS
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

  const gestiones = GESTIONES_DISPONIBLES.filter(g => {
    const anio = parseInt(g.split(" ")[0]);
    if (plan === '1998') return anio >= 1998 && anio < 2023;
    return anio >= 2023 && anio <= 2026;
  });

  const opcionesGestion = gestiones.map(g =>
    `<option value="${g}">${g}</option>`
  ).join('');

  contenedor.innerHTML = materias.map(m => `
    <div class="materia-row-check" data-codigo="${m.codigo}" data-plan="${plan}">
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

/* ═══════════════════════════════════════════════════════════════
   BUSCADOR DE MATERIAS — INDEPENDIENTE POR PLAN
   ═══════════════════════════════════════════════════════════════ */
function filtrarMaterias(termino, plan) {
  const busqueda = termino.toLowerCase().trim();
  const contenedorId = plan === '1998' ? 'materias1998' : 'materias2023';
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const filas = contenedor.querySelectorAll('.materia-row-check');

  if (!busqueda) {
    filas.forEach(fila => fila.classList.remove('oculta', 'resaltada'));
    quitarMensajeSinResultados(contenedor);
    return;
  }

  let visibles = 0;

  filas.forEach(fila => {
    const codigo = (fila.dataset.codigo || '').toLowerCase();
    const nombre = (fila.querySelector('.nombre')?.textContent || '').toLowerCase();

    const coincide = codigo.includes(busqueda) || nombre.includes(busqueda);

    if (coincide) {
      fila.classList.remove('oculta');
      fila.classList.add('resaltada');
      visibles++;
    } else {
      fila.classList.add('oculta');
      fila.classList.remove('resaltada');
    }
  });

  mostrarMensajeSinResultados(contenedor, visibles);
}

function limpiarBuscador(plan) {
  const inputId = plan === '1998' ? 'buscador1998' : 'buscador2023';
  const input = document.getElementById(inputId);
  if (input) input.value = '';
  filtrarMaterias('', plan);
}

function mostrarMensajeSinResultados(contenedor, cantidad) {
  quitarMensajeSinResultados(contenedor);
  if (cantidad > 0) return;

  const msg = document.createElement('div');
  msg.className = 'sin-resultados';
  msg.textContent = '🔍 No se encontraron materias con ese término.';
  contenedor.appendChild(msg);
}

function quitarMensajeSinResultados(contenedor) {
  const msgs = contenedor.querySelectorAll('.sin-resultados');
  msgs.forEach(m => m.remove());
}

/* ═══════════════════════════════════════════════════════════════
   RENDERIZAR RESULTADO
   ═══════════════════════════════════════════════════════════════ */
function renderizarResultado() {
  const est = JSON.parse(localStorage.getItem('estudiante') || '{}');
  const materias = JSON.parse(localStorage.getItem('materiasMarcadas') || '[]');

  if (!est.nombre || !est.mencion2023aj) {
    document.getElementById('datosEstudiante').innerHTML = `
      <p style="color:red;">⚠️ Faltan datos del estudiante.</p>
    `;
    return;
  }

  if (materias.length === 0) {
    document.getElementById('datosEstudiante').innerHTML = `
      <p style="color:red;">⚠️ No hay materias marcadas.</p>
    `;
    return;
  }

  document.getElementById('datosEstudiante').innerHTML = `
    <strong>👤 ${est.nombre || '—'}</strong><br>
    🆔 ${est.cedula || '—'} &nbsp;|&nbsp; 🎫 ${est.ru || '—'}<br>
    🎓 ${est.mencion2023aj || '—'}
  `;

  const resultado = calcularConvalidacion(
    materias,
    est.mencion1998,
    est.mencion2023aj
  );

  console.log('📊 Resultado:', resultado);

  const totalElectivas = (resultado.electivas?.length || 0) +
                          (resultado.electivas1998?.length || 0);

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

  renderizarSemestres(resultado.convalidadas);

  // ═══════════════════════════════════════════════════════════
  // ELECTIVAS — Unir 64h→32h + 1998 elegidas
  // ═══════════════════════════════════════════════════════════
  const todasElectivas = [
    ...(resultado.electivas || []),
    ...(resultado.electivas1998 || [])
      .filter(e => e.codigoDestino)
      .map(e => ({
        codigo: e.codigoDestino,
        nombre: e.nombreDestino,
        origen: `${e.codigoOrigen} - ${e.nombreOrigen}`,
        regla: 'Electiva 1998'
      }))
  ];

  renderizarElectivas(todasElectivas);
  renderizarDuplicadas(resultado.duplicadas);
}

function renderizarSemestres(convalidadas) {
  const contenedor = document.getElementById('resultadoSemestres');

  if (!convalidadas || convalidadas.length === 0) {
    contenedor.innerHTML = `
      <div class="semestre-card">
        <p class="info-text">No hay materias convalidadas.</p>
      </div>
    `;
    return;
  }

  const semestres = [
    { titulo: "📚 1º SEMESTRE", items: convalidadas.slice(0, 4) },
    { titulo: "📚 2º SEMESTRE", items: convalidadas.slice(4, 8) },
    { titulo: "📚 3º SEMESTRE", items: convalidadas.slice(8, 12) },
    { titulo: "📚 4º SEMESTRE", items: convalidadas.slice(12, 16) },
    { titulo: "📚 5º SEMESTRE", items: convalidadas.slice(16, 20) },
    { titulo: "📚 6º SEMESTRE", items: convalidadas.slice(20, 24) },
    { titulo: "📚 7º SEMESTRE", items: convalidadas.slice(24, 28) },
    { titulo: "📚 8º SEMESTRE", items: convalidadas.slice(28, 32) },
    { titulo: "📚 9º SEMESTRE", items: convalidadas.slice(32, 36) },
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

  if (!electivas || electivas.length === 0) {
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
            <th>Regla</th>
          </tr>
        </thead>
        <tbody>
          ${electivas.map(e => `
            <tr>
              <td class="codigo-cell">${e.codigo || '—'}</td>
              <td>${e.nombre || '—'}</td>
              <td>${e.origen || '—'}</td>
              <td>${e.regla || '64h → 32h'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderizarDuplicadas(duplicadas) {
  const contenedor = document.getElementById('tablaDuplicadas');

  if (!duplicadas || duplicadas.length === 0) {
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

/* ═══════════════════════════════════════════════════════════════
   RENDERIZAR ELECTIVAS A ELEGIR
   ═══════════════════════════════════════════════════════════════ */
function renderizarElectivasA_Elegir() {
  const contenedor = document.getElementById('listaElectivas');
  const est = JSON.parse(localStorage.getItem('estudiante') || '{}');
  const pendientes = JSON.parse(localStorage.getItem('materiasElectivaPendientes') || '[]');
  const electivasElegidas = JSON.parse(localStorage.getItem('electivasElegidas') || '{}');

  if (pendientes.length === 0) {
    contenedor.innerHTML = '<p class="info-text">No hay materias que convaliden a electiva.</p>';
    return;
  }

  const optativasMencion = getOptativasPorMencion(est.mencion2023aj);

  const codigosYaElegidos = new Set(
    Object.values(electivasElegidas).map(e => e.codigo)
  );

  document.getElementById('electivasIntro').innerHTML = `
    Detectamos <strong>${pendientes.length}</strong> materia(s) del 1998 que convalidan como
    <strong>ELECTIVA</strong>. Elige qué optativa de tu mención
    (<strong>${est.mencion2023aj}</strong>) quieres que se te asigne por cada una.
    <br><br>
    <em>Nota: Cada optativa solo puede asignarse una vez.</em>
  `;

  contenedor.innerHTML = pendientes.map((m, idx) => {
    const seleccionActual = electivasElegidas[m.codigoOrigen]?.codigo || '';

    const optativasDisponibles = optativasMencion.filter(o => {
      if (!codigosYaElegidos.has(o.codigo)) return true;
      if (o.codigo === seleccionActual) return true;
      return false;
    });

    return `
      <div class="electiva-card" data-codigo="${m.codigoOrigen}">
        <div class="electiva-header">
          <div class="electiva-num">${idx + 1} de ${pendientes.length}</div>
          <div class="electiva-materia">
            <span class="electiva-codigo">${m.codigoOrigen}</span>
            <span class="electiva-nombre">${m.nombreOrigen}</span>
            <span class="electiva-gestion">(1998, ${m.gestion}) — aprobada</span>
          </div>
        </div>

        <label class="electiva-label">Elige la optativa de tu mención:</label>
        <select class="electiva-select" data-codigo="${m.codigoOrigen}" onchange="guardarElectivaElegida(this)">
          <option value="">— Selecciona una optativa —</option>
          ${optativasDisponibles.map(o => `
            <option value="${o.codigo}" data-nombre="${o.nombre}" ${seleccionActual === o.codigo ? 'selected' : ''}>
              ${o.codigo} — ${o.nombre}
            </option>
          `).join('')}
        </select>
      </div>
    `;
  }).join('');
}

function guardarElectivaElegida(select) {
  const codigoOrigen = select.dataset.codigo;
  const optativaCodigo = select.value;
  const optativaNombre = select.options[select.selectedIndex]?.dataset?.nombre || '';

  const electivasElegidas = JSON.parse(localStorage.getItem('electivasElegidas') || '{}');

  if (!optativaCodigo) {
    delete electivasElegidas[codigoOrigen];
  } else {
    electivasElegidas[codigoOrigen] = {
      codigo: optativaCodigo,
      nombre: optativaNombre
    };
  }

  localStorage.setItem('electivasElegidas', JSON.stringify(electivasElegidas));
  renderizarElectivasA_Elegir();
}

function confirmarElectivas() {
  const pendientes = JSON.parse(localStorage.getItem('materiasElectivaPendientes') || '[]');
  const electivasElegidas = JSON.parse(localStorage.getItem('electivasElegidas') || '{}');

  const faltan = pendientes.filter(p => !electivasElegidas[p.codigoOrigen]);

  if (faltan.length > 0) {
    alert(`⚠️ Te faltan elegir ${faltan.length} optativa(s).`);
    return;
  }

  navegar('vista-resultado');
}

/* ─── Renderizar tabla de materias agregadas ─────────────────── */
function renderizarTablaAgregadas(materias) {
  const card = document.getElementById('card-agregadas');
  const contenedor = document.getElementById('tablaAgregadas');

  if (!card || !contenedor) return;

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
  `;
}