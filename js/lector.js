/* ═══════════════════════════════════════════════════════════════
   LECTOR DE PDF — Extrae materias aprobadas del historial UMSA
   ═══════════════════════════════════════════════════════════════ */

let archivoPDF = null;
let materiasDetectadas = [];

/* ═══════════════════════════════════════════════════════════════
   1. INICIALIZACIÓN
   ═══════════════════════════════════════════════════════════════ */
function inicializarLector() {
  const zona = document.getElementById('zonaCarga');
  if (!zona) return;

  // Clonar para eliminar listeners previos
  const zonaClon = zona.cloneNode(true);
  zona.parentNode.replaceChild(zonaClon, zona);

  const zonaNueva = document.getElementById('zonaCarga');
  const inputNuevo = document.getElementById('inputPDF');

  // Click
  zonaNueva.addEventListener('click', (e) => {
    if (e.target.id !== 'inputPDF') {
      document.getElementById('inputPDF').click();
    }
  });

  // Drag & drop
  zonaNueva.addEventListener('dragover', (e) => {
    e.preventDefault();
    zonaNueva.classList.add('arrastrando');
  });
  zonaNueva.addEventListener('dragleave', () => {
    zonaNueva.classList.remove('arrastrando');
  });
  zonaNueva.addEventListener('drop', (e) => {
    e.preventDefault();
    zonaNueva.classList.remove('arrastrando');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      manejarArchivoSeleccionado(files[0]);
    } else {
      alert("⚠️ Solo se aceptan archivos PDF.");
    }
  });

  // Change
  inputNuevo.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      manejarArchivoSeleccionado(e.target.files[0]);
    }
  });

  cargarGestionesNuevaMateria();
}

/* ─── Manejar archivo seleccionado ───────────────────────────── */
function manejarArchivoSeleccionado(file) {
  archivoPDF = file;
  const zona = document.getElementById('zonaCarga');

  zona.innerHTML = `
    <div class="archivo-seleccionado">
      <span>✅</span>
      <div style="flex:1;">
        <div style="font-weight:700;color:#28a745;font-size:15px;">
          ${file.name}
        </div>
        <div style="font-size:12px;color:#6c757d;margin-top:2px;">
          ${(file.size / 1024).toFixed(0)} KB · Listo para procesar
        </div>
      </div>
      <button class="btn-quitar" onclick="quitarArchivo(event)" title="Quitar archivo">×</button>
    </div>
  `;

  document.getElementById('btnProcesarPDF').disabled = false;
  document.getElementById('btnProcesarPDF').focus();
}

/* ─── Quitar archivo ─────────────────────────────────────────── */
function quitarArchivo(e) {
  if (e) e.stopPropagation();
  archivoPDF = null;

  const zona = document.getElementById('zonaCarga');
  zona.innerHTML = `
    <div class="zona-carga-icono">📄</div>
    <div class="zona-carga-titulo">HAZ CLIC AQUÍ PARA SUBIR TU PDF</div>
    <div class="zona-carga-subtitulo">o arrastra el archivo a esta zona</div>
    <div class="zona-carga-formatos">Formato aceptado: PDF</div>
    <input type="file" id="inputPDF" accept=".pdf" hidden>
  `;

  inicializarLector();
  document.getElementById('btnProcesarPDF').disabled = true;
}

/* ═══════════════════════════════════════════════════════════════
   2. PROCESAR PDF
   ═══════════════════════════════════════════════════════════════ */
async function procesarPDF() {
  if (!archivoPDF) {
    alert("⚠️ Primero selecciona un PDF.");
    return;
  }

  if (typeof pdfjsLib === 'undefined') {
    alert("⚠️ Error: PDF.js no está cargado.");
    return;
  }

  document.getElementById('cardProgreso').style.display = 'block';
  document.getElementById('cardVerificacion').style.display = 'none';
  actualizarProgreso(0, "Leyendo archivo...");

  try {
    const arrayBuffer = await archivoPDF.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPaginas = pdf.numPages;

    let textoCompleto = '';

    for (let i = 1; i <= numPaginas; i++) {
      actualizarProgreso((i / numPaginas) * 80, `Procesando página ${i} de ${numPaginas}...`);
      const pagina = await pdf.getPage(i);
      const contenido = await pagina.getTextContent();
      const textoPagina = contenido.items.map(item => item.str).join(' ');
      textoCompleto += textoPagina + '\n';
    }

    // 🔍 DEBUG: descomentar para ver el texto crudo del PDF
    // console.log('📄 TEXTO CRUDO DEL PDF:');
    // console.log(textoCompleto);

    actualizarProgreso(90, "Analizando materias aprobadas...");
    materiasDetectadas = detectarMateriasAprobadas(textoCompleto);
    actualizarProgreso(100, `✅ ${materiasDetectadas.length} materias aprobadas detectadas`);

    setTimeout(() => {
      document.getElementById('cardProgreso').style.display = 'none';
      mostrarVerificacion();
    }, 600);

  } catch (error) {
    console.error('❌ Error al procesar PDF:', error);
    document.getElementById('cardProgreso').style.display = 'none';
    alert("⚠️ Error al procesar el PDF. Verifica que sea un archivo válido.");
  }
}

function actualizarProgreso(porcentaje, texto) {
  document.getElementById('progresoAvance').style.width = porcentaje + '%';
  document.getElementById('progresoTexto').textContent = texto;
}

/* ═══════════════════════════════════════════════════════════════
   3. NORMALIZACIÓN DE TEXTO
   ═══════════════════════════════════════════════════════════════ */
function normalizarTexto(texto) {
  return texto
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ' ')
    .trim();
}

/* ═══════════════════════════════════════════════════════════════
   4. VERIFICAR CÓDIGO EN PLANES (debe estar ANTES de usarse)
   ═══════════════════════════════════════════════════════════════ */
function verificarCodigoEnPlanes(codigo) {
  if (!DATOS || !DATOS.cargado) return null;

  const existeEn1998 = DATOS.plan1998?.materias?.some(m => m.codigo === codigo) || false;
  const existeEn2023 = DATOS.plan2023?.materias?.some(m => m.codigo === codigo) || false;

  let existeEn2023aj = false;
  if (DATOS.plan2023aj?.menciones) {
    for (const mencion of Object.values(DATOS.plan2023aj.menciones)) {
      if (mencion.materias?.some(m => m.codigo === codigo)) {
        existeEn2023aj = true;
        break;
      }
    }
  }

  if (!existeEn1998 && !existeEn2023 && !existeEn2023aj) return null;

  let planDefault = '2023';
  if (existeEn1998 && !existeEn2023 && !existeEn2023aj) {
    planDefault = '1998';
  } else if (!existeEn1998 && !existeEn2023 && existeEn2023aj) {
    planDefault = '2023 AJUSTADO';
  } else if (existeEn1998 && existeEn2023) {
    planDefault = '1998';
  }

  return {
    en1998: existeEn1998,
    en2023: existeEn2023,
    en2023aj: existeEn2023aj,
    planDefault
  };
}

/* ═══════════════════════════════════════════════════════════════
   5. BUSCAR NOMBRE EN PLANES
   ═══════════════════════════════════════════════════════════════ */
function buscarNombreEnPlanes(codigo, plan) {
  if (plan === '1998' && DATOS.plan1998?.materias) {
    const m = DATOS.plan1998.materias.find(x => x.codigo === codigo);
    if (m) return m.nombre;
  }

  if (DATOS.plan2023?.materias) {
    const m = DATOS.plan2023.materias.find(x => x.codigo === codigo);
    if (m) return m.nombre;
  }

  if (DATOS.plan2023aj?.menciones) {
    for (const mencion of Object.values(DATOS.plan2023aj.menciones)) {
      const m = mencion.materias?.find(x => x.codigo === codigo);
      if (m) return m.nombre;
    }
  }

  return '(sin nombre)';
}

/* ═══════════════════════════════════════════════════════════════
   6. EXTRAER NOMBRE LIMPIO
   ═══════════════════════════════════════════════════════════════ */
function extraerNombreLimpio(bloque, codigo, plan) {
  let texto = bloque.trim();

  // Cortar en palabras clave (no cortar en números)
  const cortes = [
    'APROBADO', 'REPROBADO', 'ABANDONO', 'RETIRADO',
    'PRIMERO', 'SEGUNDO', 'INVIERNO', 'VERANO',
    'NOTA', 'NRO', 'M.SC', 'LIC.', 'PH.D', 'ING.', 'DOCENTE',
    '---', '. .', 'SEMESTRE', 'PROM.', 'NRO.', 'CONV.', 'CNV.'
  ];

  let fin = texto.length;
  for (const c of cortes) {
    const pos = texto.indexOf(c);
    if (pos !== -1 && pos < fin) fin = pos;
  }

  let nombre = texto.substring(0, fin).trim();

  // Proteger los números que van después de una sigla
  // Ejemplo: "LABORATORIO DE INF 111" → proteger "111"
  const SIGLAS = /\b(INF|LAB|MAT|FIS|EST|LIN|COM|SIS|TIC|SEG|IID|DAT|TRA|TRC|TAT|TSI|TVD|TIE|TAW|TAM|TCP|TSS|IOT)\s+\d{3}/g;

  let nombreProtegido = nombre.replace(SIGLAS, (match) => {
    return match.replace(' ', '_PROT_');
  });

  // Quitar el último número "solo" (que es la nota)
  nombreProtegido = nombreProtegido.replace(/\s+(\d{1,3})\s*$/, '');

  // Restaurar los espacios protegidos
  nombre = nombreProtegido.replace(/_PROT_/g, ' ');

  // Limpiar puntuación y espacios
  nombre = nombre
    .replace(/[.,;:()\[\]]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!nombre || nombre.length < 3) {
    return buscarNombreEnPlanes(codigo, plan);
  }

  if (nombre.length > 70) nombre = nombre.substring(0, 70) + '...';

  return nombre;
}

/* ═══════════════════════════════════════════════════════════════
   7. DETECCIÓN DE MATERIAS APROBADAS
   ═══════════════════════════════════════════════════════════════ */
function detectarMateriasAprobadas(texto) {
  const textoNorm = normalizarTexto(texto);
  const detectadas = [];
  const codigosEncontrados = new Set();

  // ═══════════════════════════════════════════════════════════
  // PASO 1: Buscar bloques "AÑO SEMESTRE"
  // ═══════════════════════════════════════════════════════════
  const REGEX_BLOQUE = /((?:19|20)\d{2})\s+(PRIMERO|SEGUNDO|INVIERNO|VERANO)/g;
  const bloques = [];
  let m;

  while ((m = REGEX_BLOQUE.exec(textoNorm)) !== null) {
    bloques.push({
      gestion: `${m[1]} ${m[2]}`,
      año: parseInt(m[1]),
      inicio: m.index,
      fin: null
    });
  }

  for (let i = 0; i < bloques.length; i++) {
    bloques[i].fin = (i + 1 < bloques.length)
      ? bloques[i + 1].inicio
      : textoNorm.length;
  }

  // ═══════════════════════════════════════════════════════════
  // PASO 2: Recorrer cada bloque y extraer materias
  // ═══════════════════════════════════════════════════════════
  for (const bloque of bloques) {
    const textoBloque = textoNorm.substring(bloque.inicio, bloque.fin);

    const REGEX_MATERIA_BLOQUE = /\b([A-Z]{2,4})[-\s](\d{3})\b/g;
    let mMat;

    while ((mMat = REGEX_MATERIA_BLOQUE.exec(textoBloque)) !== null) {
      const codigo = `${mMat[1]}-${mMat[2]}`;

      const claveUnica = `${codigo}|${bloque.gestion}`;
      if (codigosEncontrados.has(claveUnica)) continue;

      // Extraer bloque inmediato después del código
      const idxInicio = mMat.index + mMat[0].length;
      const bloqueDespues = textoBloque.substring(idxInicio, idxInicio + 250);

      const proximoCodigo = bloqueDespues.match(/\b[A-Z]{2,4}[-\s]\d{3}\b/);
      const finBloque = proximoCodigo
        ? proximoCodigo.index
        : Math.min(250, bloqueDespues.length);

      const bloqueMateria = bloqueDespues.substring(0, finBloque);

      // SKIP: si es convalidación automática
      if (/CONV\.\s*OPTATIVA|CONV\.\s*PROV|CNV\.\s*PROV|CONV\.\s*PROV\.\s*AJUSTE/.test(bloqueMateria)) {
        codigosEncontrados.add(claveUnica);
        continue;
      }

      // SKIP: si contiene ABANDONO/REPROBADO
      if (/\b(ABANDONO|REPROBADO|RETIRADO|REPROBO)\b/.test(bloqueMateria)) {
        codigosEncontrados.add(claveUnica);
        continue;
      }

      // Debe contener APROBADO
      const bloqueAntes = textoBloque.substring(
        Math.max(0, mMat.index - 40),
        mMat.index
      );
      const bloqueCompleto = bloqueAntes + ' ' + bloqueMateria;

      if (!/\bAPROBADO\b/.test(bloqueCompleto)) continue;

      // Verificar que exista en algún plan
      const planInfo = verificarCodigoEnPlanes(codigo);
      if (!planInfo) continue;

      codigosEncontrados.add(claveUnica);

      // Determinar plan según gestión
      let planFinal;
      if (bloque.año < 2023) {
        planFinal = '1998';
      } else if (bloque.año === 2023 || bloque.año === 2024) {
        planFinal = '2023';
      } else {
        planFinal = '2023 AJUSTADO';
      }

      // Nombre limpio
      const nombre = extraerNombreLimpio(bloqueMateria, codigo, planFinal);

      detectadas.push({
        codigo,
        nombre: nombre || '(sin nombre)',
        gestion: bloque.gestion,
        plan: planFinal,
        confianza: 'alta'
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PASO 3: Deduplicar por código (quedarse con la MÁS ANTIGUA)
  // ═══════════════════════════════════════════════════════════
  const porCodigo = {};
  for (const m of detectadas) {
    const anio = parseInt(m.gestion.split(' ')[0]);
    if (!porCodigo[m.codigo] || anio < porCodigo[m.codigo]._anio) {
      porCodigo[m.codigo] = { ...m, _anio: anio };
    }
  }

  return Object.values(porCodigo);
}

/* ═══════════════════════════════════════════════════════════════
   8. MOSTRAR VERIFICACIÓN (SOLO 1998 Y 2023)
   ═══════════════════════════════════════════════════════════════ */
function mostrarVerificacion() {
  document.getElementById('cardVerificacion').style.display = 'block';

  const contenedor = document.getElementById('tablaDetectadas');

  // SOLO mostrar 1998 y 2023 (el 2023 AJUSTADO se oculta)
  const m1998 = materiasDetectadas.filter(m => m.plan === '1998');
  const m2023 = materiasDetectadas.filter(m => m.plan === '2023');

  const totalMostradas = m1998.length + m2023.length;

  if (totalMostradas === 0) {
    contenedor.innerHTML = `
      <div style="text-align:center;padding:40px;background:#f8f9fa;border-radius:8px;">
        <div style="font-size:48px;margin-bottom:12px;">🔍</div>
        <p style="font-size:15px;color:#6c757d;margin-bottom:8px;">
          No se detectaron materias para convalidar en el PDF.
        </p>
        <p style="font-size:13px;color:#999;">
          Puedes agregarlas manualmente abajo.
        </p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = `
    ${m1998.length > 0 ? renderTablaPlan('1998', m1998) : ''}
    ${m2023.length > 0 ? renderTablaPlan('2023', m2023) : ''}

    <div style="
      margin-top:20px;
      padding:12px 16px;
      background:#e8f4fc;
      border-left:4px solid #1a3a6b;
      border-radius:6px;
      font-size:13px;
      color:#1a3a6b;
    ">
      <strong>📊 Total para convalidar:</strong> ${totalMostradas} materias
      &nbsp;|&nbsp; <strong>1998:</strong> ${m1998.length}
      &nbsp;|&nbsp; <strong>2023:</strong> ${m2023.length}
    </div>
  `;
}

/* ─── Renderizar tabla por plan ──────────────────────────────── */
function renderTablaPlan(plan, lista) {
  const config = {
    '1998': { color: '#3498db', bg: '#e8f4fc', icono: '📘', titulo: 'PLAN 1998' },
    '2023': { color: '#27ae60', bg: '#e8f8ef', icono: '📗', titulo: 'PLAN 2023' }
  };

  const c = config[plan] || config['2023'];
  const idSelect = `gestionMasiva_${plan.replace(/\s/g, '_')}`;

  const gestiones = GESTIONES_DISPONIBLES.filter(g => {
    const anio = parseInt(g.split(' ')[0]);
    if (plan === '1998') return anio >= 1998 && anio < 2023;
    return anio >= 2023 && anio <= 2026;
  });

  const opciones = gestiones.map(g => `<option value="${g}">${g}</option>`).join('');

  return `
    <div class="plan-bloque plan-bloque-${plan === '1998' ? '1998' : '2023'}" style="margin-top:24px;">
      <div class="plan-bloque-header">
        <h3>${c.icono} ${c.titulo}</h3>
        <span class="plan-contador">${lista.length} materias</span>
      </div>

      <div class="plan-bloque-acciones">
        <label>
          <input type="checkbox" onchange="toggleTodoPlan('${plan}', this.checked)">
          <strong>Marcar / desmarcar todas</strong>
        </label>

        <div class="asignar-gestion">
          <label style="font-size:12px;color:#6c757d;">Asignar gestión a todas:</label>
          <select id="${idSelect}">
            <option value="">— Gestión —</option>
            ${opciones}
          </select>
          <button onclick="aplicarGestionMasiva('${plan}')">Aplicar</button>
        </div>
      </div>

      <div class="tabla-wrapper">
        <table>
          <thead>
            <tr>
              <th>✓</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Gestión</th>
              <th>✕</th>
            </tr>
          </thead>
          <tbody>
            ${lista.map(m => {
              const idx = materiasDetectadas.indexOf(m);
              return renderFilaDetectada(m, idx, plan);
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ─── Renderizar fila individual ─────────────────────────────── */
function renderFilaDetectada(m, idx, plan) {
  const config = {
    '1998': { color: '#3498db' },
    '2023': { color: '#27ae60' }
  };
  const c = config[plan] || config['2023'];

  const gestiones = GESTIONES_DISPONIBLES.filter(g => {
    const anio = parseInt(g.split(' ')[0]);
    if (plan === '1998') return anio >= 1998 && anio < 2023;
    return anio >= 2023 && anio <= 2026;
  });

  const opciones = gestiones.map(g =>
    `<option value="${g}" ${g === m.gestion ? 'selected' : ''}>${g}</option>`
  ).join('');

  const sinGestion = !m.gestion;

  return `
    <tr class="materia-detectada-row" data-idx="${idx}" data-plan="${plan}">
      <td style="text-align:center;">
        <input type="checkbox" checked data-plan="${plan}">
      </td>
      <td>
        <span style="font-weight:800;color:${c.color};font-size:13px;font-family:var(--fuente-mono);">
          ${m.codigo}
        </span>
      </td>
      <td style="font-size:13px;">
        ${m.nombre}
      </td>
      <td>
        <select
          data-idx="${idx}"
          onchange="cambiarGestionDetectada(this)"
          style="
            width:100%;
            padding:8px 12px;
            border:2px solid ${sinGestion ? '#fd7e14' : '#dee2e6'};
            border-radius:8px;
            font-size:12px;
            font-weight:600;
            background:${sinGestion ? '#fff3cd' : 'white'};
          "
        >
          <option value="">— Selecciona —</option>
          ${opciones}
        </select>
      </td>
      <td style="text-align:center;">
        <button class="btn-eliminar" onclick="eliminarDetectada(${idx})">×</button>
      </td>
    </tr>
  `;
}
/* ═══════════════════════════════════════════════════════════════
   9. ACCIONES MASIVAS
   ═══════════════════════════════════════════════════════════════ */
function toggleTodoPlan(plan, marcar) {
  document.querySelectorAll(`#tablaDetectadas input[type="checkbox"][data-plan="${plan}"]`)
    .forEach(chk => chk.checked = marcar);
}

function aplicarGestionMasiva(plan) {
  const idSelect = `gestionMasiva_${plan.replace(/\s/g, '_')}`;
  const sel = document.getElementById(idSelect);
  const gestion = sel.value;

  if (!gestion) {
    alert("⚠️ Selecciona una gestión primero.");
    return;
  }

  let aplicadas = 0;
  document.querySelectorAll(`.materia-detectada-row[data-plan="${plan}"]`).forEach(fila => {
    const chk = fila.querySelector('input[type="checkbox"]');
    if (!chk.checked) return;

    const select = fila.querySelector('select');
    select.value = gestion;

    const idx = parseInt(fila.dataset.idx);
    if (materiasDetectadas[idx]) {
      materiasDetectadas[idx].gestion = gestion;
    }

    select.style.borderColor = '#dee2e6';
    select.style.background = 'white';

    aplicadas++;
  });

  const btn = event.target;
  const textoOriginal = btn.textContent;
  btn.textContent = `✅ ${aplicadas} aplicadas`;
  setTimeout(() => btn.textContent = textoOriginal, 1500);
}

function cambiarGestionDetectada(select) {
  const idx = parseInt(select.dataset.idx);
  if (materiasDetectadas[idx]) {
    materiasDetectadas[idx].gestion = select.value;

    if (select.value) {
      select.style.borderColor = '#dee2e6';
      select.style.background = 'white';
    }
  }
}

function eliminarDetectada(idx) {
  materiasDetectadas.splice(idx, 1);
  mostrarVerificacion();
}

function limpiarDeteccion() {
  if (!confirm("¿Eliminar TODAS las materias detectadas?")) return;
  materiasDetectadas = [];
  mostrarVerificacion();
}

/* ═══════════════════════════════════════════════════════════════
   10. AGREGAR MATERIA MANUAL
   ═══════════════════════════════════════════════════════════════ */
function cargarGestionesNuevaMateria() {
  const sel = document.getElementById('nuevaGestion');
  if (!sel) return;

  sel.innerHTML = '<option value="">— Gestión —</option>' +
    GESTIONES_DISPONIBLES.map(g => `<option value="${g}">${g}</option>`).join('');
}

function agregarMateriaManual(event) {
  const inputCodigo = document.getElementById('nuevaCodigo');
  const codigoRaw = inputCodigo.value.trim().toUpperCase();
  const plan = document.getElementById('nuevaPlan').value;
  const gestion = document.getElementById('nuevaGestion').value;

  // Validaciones
  if (!codigoRaw) {
    alert("⚠️ Escribe el código de la materia o selecciónalo de la lista.");
    inputCodigo.focus();
    return;
  }

  const codigoNorm = codigoRaw.replace(/\s+/g, '-').replace(/--/g, '-');

  if (!plan) {
    alert("⚠️ Selecciona el plan de la materia.");
    document.getElementById('nuevaPlan').focus();
    return;
  }

  if (!gestion) {
    alert("⚠️ Selecciona la gestión en que aprobaste la materia.");
    document.getElementById('nuevaGestion').focus();
    return;
  }

  // ═══════════════════════════════════════════════════════════
  // BUSCAR NOMBRE AUTOMÁTICAMENTE
  // ═══════════════════════════════════════════════════════════
  let nombre = '(no encontrado)';
  let codigoFinal = codigoNorm;

  // Buscar en plan 1998
  if (plan === '1998' && DATOS.plan1998?.materias) {
    const encontrado = DATOS.plan1998.materias.find(m => 
      m.codigo === codigoNorm || 
      m.codigo === codigoNorm.replace('-', ' ') ||
      m.codigo.replace(/\s/g, '-') === codigoNorm
    );
    if (encontrado) {
      nombre = encontrado.nombre;
      codigoFinal = encontrado.codigo;
    }
  }

  // Buscar en plan 2023
  if (plan === '2023' && DATOS.plan2023?.materias) {
    const encontrado = DATOS.plan2023.materias.find(m => 
      m.codigo === codigoNorm ||
      m.codigo === codigoNorm.replace('-', ' ') ||
      m.codigo.replace(/\s/g, '-') === codigoNorm
    );
    if (encontrado) {
      nombre = encontrado.nombre;
      codigoFinal = encontrado.codigo;
    }
  }

  // Si no encontró en los planes específicos, buscar en TODOS
  if (nombre === '(no encontrado)') {
    const todosPlanes = [
      ...(DATOS.plan1998?.materias || []),
      ...(DATOS.plan2023?.materias || [])
    ];
    const encontrado = todosPlanes.find(m => 
      m.codigo === codigoNorm ||
      m.codigo.replace(/\s/g, '-') === codigoNorm
    );
    if (encontrado) {
      nombre = encontrado.nombre;
      codigoFinal = encontrado.codigo;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // VERIFICAR DUPLICADOS
  // ═══════════════════════════════════════════════════════════
  const yaExiste = materiasDetectadas.some(
    m => m.codigo === codigoFinal && m.gestion === gestion
  );

  if (yaExiste) {
    alert(`⚠️ Ya agregaste ${codigoFinal} con la gestión ${gestion}.`);
    return;
  }

  // ═══════════════════════════════════════════════════════════
  // AGREGAR
  // ═══════════════════════════════════════════════════════════
  materiasDetectadas.push({
    codigo: codigoFinal,
    nombre,
    gestion,
    plan: plan === '1998' ? '1998' : '2023',
    confianza: 'alta'
  });

  // Limpiar inputs
  inputCodigo.value = '';
  inputCodigo.classList.remove('valido', 'invalido');
  document.getElementById('nuevaPlan').value = '';
  document.getElementById('nuevaGestion').innerHTML = '<option value="">Primero elige el plan...</option>';

  // Reset ayuda
  const ayuda = document.getElementById('ayudaCodigo');
  ayuda.classList.remove('error', 'exito');
  ayuda.textContent = 'Escribe el código o selecciona de la lista';

  // Ocultar autocomplete
  document.getElementById('autocompleteLista').style.display = 'none';

  // Refrescar tabla
  mostrarVerificacion();

  // Feedback visual
  const btn = event?.target?.closest('button');
  if (btn) {
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<span class="btn-icono">✅</span> ¡AGREGADA!';
    btn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    setTimeout(() => {
      btn.innerHTML = textoOriginal;
      btn.style.background = '';
    }, 1500);
  }
}
/* ═══════════════════════════════════════════════════════════════
   11. CONFIRMAR Y PASAR AL MOTOR
   ═══════════════════════════════════════════════════════════════ */
function confirmarDeteccion() {
  const filas = document.querySelectorAll('#tablaDetectadas .materia-detectada-row');
  const materiasFinales = [];
  let faltanGestion = 0;

  filas.forEach(fila => {
    const chk = fila.querySelector('input[type="checkbox"]');
    if (!chk) return;
    if (!chk.checked) return;

    const select = fila.querySelector('select');
    if (!select) return;

    const idx = parseInt(fila.dataset.idx);
    const m = materiasDetectadas[idx];

    if (!m) return;

    // Ignorar 2023 AJUSTADO (ya no aparece, pero por seguridad)
    if (m.plan === '2023 AJUSTADO') return;

    if (!select.value) {
      faltanGestion++;
      return;
    }

    materiasFinales.push({
      codigo: m.codigo,
      nombre: m.nombre,
      gestion: select.value,
      plan: m.plan
    });
  });

  if (faltanGestion > 0) {
    alert(`⚠️ Tienes ${faltanGestion} materia(s) marcada(s) sin gestión. Asígnales una gestión o desmárcalas.`);
    return;
  }

  if (materiasFinales.length === 0) {
    alert("⚠️ Debes marcar al menos una materia.");
    return;
  }

  localStorage.setItem('materiasMarcadas', JSON.stringify(materiasFinales));
  materiasMarcadas = materiasFinales;

  navegar('vista-resultado');

  /* ═══════════════════════════════════════════════════════════════
    VALIDACIÓN EN VIVO DEL CÓDIGO
    ═══════════════════════════════════════════════════════════════ */
    function validarCodigoEnVivo(input) {
    const codigo = input.value.trim().toUpperCase();
    const ayuda = document.getElementById('ayudaCodigo');

    // Reset
    input.classList.remove('valido', 'invalido');
    ayuda.classList.remove('error', 'exito');
    ayuda.innerHTML = 'Escribe el código tal como aparece en tu historial. Ejemplo: <strong>INF-111</strong>';

    if (!codigo) return;

    // Formato válido: 2-4 letras + guión (o espacio) + 3 dígitos
    const formatoValido = /^[A-Z]{2,4}[-\s]?\d{3}$/.test(codigo.replace(/\s+/g, ''));

    if (!formatoValido) {
        input.classList.add('invalido');
        ayuda.classList.add('error');
        ayuda.innerHTML = '⚠️ Formato incorrecto. Debe ser tipo <strong>INF-111</strong> (siglas + guión + 3 números).';
        return;
    }

    // Normalizar: "INF 111" → "INF-111"
    const codigoNorm = codigo.replace(/\s+/g, '-').replace(/--/g, '-');

    // Verificar si existe en algún plan
    const planInfo = verificarCodigoEnPlanes(codigoNorm);

    if (!planInfo) {
        input.classList.add('invalido');
        ayuda.classList.add('error');
        ayuda.innerHTML = `⚠️ El código <strong>${codigoNorm}</strong> no existe en los planes cargados. Verifícalo.`;
        return;
    }

    // ¡Existe! Mostrar info
    input.classList.add('valido');
    ayuda.classList.add('exito');

    let planesExiste = [];
    if (planInfo.en1998) planesExiste.push('1998');
    if (planInfo.en2023) planesExiste.push('2023');
    if (planInfo.en2023aj) planesExiste.push('2023 AJUSTADO');

    // Buscar nombre
    const nombre = buscarNombreEnPlanes(codigoNorm, planInfo.planDefault);

    ayuda.innerHTML = `✅ <strong>${codigoNorm}</strong> — ${nombre}<br><small>Existe en: ${planesExiste.join(', ')}</small>`;
    }

    /* ═══════════════════════════════════════════════════════════════
    MEJORAR LA FUNCIÓN agregarMateriaManual()
    ═══════════════════════════════════════════════════════════════ */
    function agregarMateriaManual() {
    const inputCodigo = document.getElementById('nuevaCodigo');
    const codigoRaw = inputCodigo.value.trim().toUpperCase();
    const plan = document.getElementById('nuevaPlan').value;
    const gestion = document.getElementById('nuevaGestion').value;

    // Validaciones básicas
    if (!codigoRaw) {
        alert("⚠️ Escribe el código de la materia.");
        inputCodigo.focus();
        return;
    }

    const codigoNorm = codigoRaw.replace(/\s+/g, '-').replace(/--/g, '-');
    const formatoValido = /^[A-Z]{2,4}-\d{3}$/.test(codigoNorm);

    if (!formatoValido) {
        alert("⚠️ El código debe tener formato tipo INF-111 (siglas + guión + 3 números).");
        inputCodigo.focus();
        return;
    }

    if (!plan) {
        alert("⚠️ Selecciona el plan de la materia.");
        document.getElementById('nuevaPlan').focus();
        return;
    }

    if (!gestion) {
        alert("⚠️ Selecciona la gestión en que aprobaste la materia.");
        document.getElementById('nuevaGestion').focus();
        return;
    }

    // Verificar que exista en algún plan
    const planInfo = verificarCodigoEnPlanes(codigoNorm);
    if (!planInfo) {
        const continuar = confirm(
        `⚠️ El código ${codigoNorm} no existe en los planes cargados.\n\n` +
        `¿Quieres agregarlo de todas formas?`
        );
        if (!continuar) return;
    }

    // Verificar que no esté duplicado en la lista
    const yaExiste = materiasDetectadas.some(
        m => m.codigo === codigoNorm && m.gestion === gestion
    );

    if (yaExiste) {
        alert(`⚠️ Ya agregaste ${codigoNorm} con la gestión ${gestion}.`);
        return;
    }

    // Buscar nombre
    const nombre = buscarNombreEnPlanes(codigoNorm, plan === '1998' ? '1998' : '2023');

    // Agregar
    materiasDetectadas.push({
        codigo: codigoNorm,
        nombre,
        gestion,
        plan: plan === '1998' ? '1998' : '2023',
        confianza: 'alta'
    });

    // Limpiar inputs
    inputCodigo.value = '';
    inputCodigo.classList.remove('valido', 'invalido');
    document.getElementById('nuevaPlan').value = '';
    document.getElementById('nuevaGestion').value = '';

    // Reset ayuda
    const ayuda = document.getElementById('ayudaCodigo');
    ayuda.classList.remove('error', 'exito');
    ayuda.innerHTML = 'Escribe el código tal como aparece en tu historial. Ejemplo: <strong>INF-111</strong>';

    // Refrescar tabla
    mostrarVerificacion();

    // Feedback visual
    const btn = event.target.closest('button');
    if (btn) {
        const textoOriginal = btn.innerHTML;
        btn.innerHTML = '<span class="btn-icono">✅</span> ¡AGREGADA!';
        btn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        setTimeout(() => {
        btn.innerHTML = textoOriginal;
        btn.style.background = '';
        }, 1500);
    }
    }
}

/* ═══════════════════════════════════════════════════════════════
   AUTOCOMPLETADO DE MATERIAS
   ═══════════════════════════════════════════════════════════════ */

let autocompleteTimeout = null;

function buscarMateriaAutocomplete(termino) {
  clearTimeout(autocompleteTimeout);

  autocompleteTimeout = setTimeout(() => {
    const lista = document.getElementById('autocompleteLista');
    if (!lista) return;

    const busqueda = termino.toLowerCase().trim();
    const planSeleccionado = document.getElementById('nuevaPlan').value;

    // ═══════════════════════════════════════════════════════════
    // Si no hay plan seleccionado, avisar
    // ═══════════════════════════════════════════════════════════
    if (!planSeleccionado) {
      lista.innerHTML = `
        <div class="autocomplete-vacio">
          ⚠️ Primero selecciona el <strong>Plan</strong> (1998 o 2023)
        </div>
      `;
      lista.style.display = 'block';
      return;
    }

    // Si no hay término, ocultar
    if (!busqueda || busqueda.length < 1) {
      lista.style.display = 'none';
      return;
    }

    // ═══════════════════════════════════════════════════════════
    // Buscar SOLO en el plan seleccionado
    // ═══════════════════════════════════════════════════════════
    const resultados = [];

    if (planSeleccionado === '1998' && DATOS.plan1998?.materias) {
      DATOS.plan1998.materias.forEach(m => {
        if (m.codigo.toLowerCase().includes(busqueda) ||
            m.nombre.toLowerCase().includes(busqueda)) {
          resultados.push({ ...m, plan: '1998' });
        }
      });
    } else if (planSeleccionado === '2023' && DATOS.plan2023?.materias) {
      DATOS.plan2023.materias.forEach(m => {
        if (m.codigo.toLowerCase().includes(busqueda) ||
            m.nombre.toLowerCase().includes(busqueda)) {
          resultados.push({ ...m, plan: '2023' });
        }
      });
    }

    // Mostrar máximo 15 resultados
    const mostrar = resultados.slice(0, 15);

    if (mostrar.length === 0) {
      lista.innerHTML = `
        <div class="autocomplete-vacio">
          No se encontraron materias del <strong>Plan ${planSeleccionado}</strong> con "${termino}"
        </div>
      `;
      lista.style.display = 'block';
      return;
    }

    lista.innerHTML = mostrar.map(r => `
      <div class="autocomplete-item" onclick="seleccionarMateriaAutocomplete('${r.codigo}', '${r.nombre.replace(/'/g, "\\'")}', '${r.plan}')">
        <span class="ac-codigo">${r.codigo}</span>
        <span class="ac-nombre">${r.nombre}</span>
        <span class="ac-plan plan-${r.plan === '1998' ? '1998' : '2023'}">PLAN ${r.plan}</span>
      </div>
    `).join('');

    lista.style.display = 'block';
  }, 150);
}

function seleccionarMateriaAutocomplete(codigo, nombre, plan) {
  // Llenar los campos
  document.getElementById('nuevaCodigo').value = codigo;
  document.getElementById('nuevaPlan').value = plan;

  // Ocultar lista
  document.getElementById('autocompleteLista').style.display = 'none';

  // Actualizar gestiones según el plan
  actualizarGestionesNuevaMateria();

  // Actualizar ayuda
  const ayuda = document.getElementById('ayudaCodigo');
  ayuda.classList.remove('error', 'exito');
  ayuda.classList.add('exito');
  ayuda.innerHTML = `✅ <strong>${codigo}</strong> — ${nombre}`;
}

/* ═══════════════════════════════════════════════════════════════
   ACTUALIZAR GESTIONES SEGÚN EL PLAN
   ═══════════════════════════════════════════════════════════════ */
function actualizarGestionesNuevaMateria() {
  const plan = document.getElementById('nuevaPlan').value;
  const sel = document.getElementById('nuevaGestion');

  // Limpiar el autocomplete al cambiar de plan
  const lista = document.getElementById('autocompleteLista');
  if (lista) lista.style.display = 'none';

  // Limpiar el input de código
  const inputCodigo = document.getElementById('nuevaCodigo');
  if (inputCodigo) inputCodigo.value = '';

  // Reset ayuda
  const ayuda = document.getElementById('ayudaCodigo');
  if (ayuda) {
    ayuda.classList.remove('error', 'exito');
    ayuda.textContent = plan
      ? `Escribe el código de una materia del Plan ${plan}`
      : 'Primero elige el plan';
  }

  if (!plan) {
    sel.innerHTML = '<option value="">Primero elige el plan...</option>';
    return;
  }

  const gestiones = GESTIONES_DISPONIBLES.filter(g => {
    const anio = parseInt(g.split(" ")[0]);
    if (plan === '1998') return anio >= 1998 && anio < 2023;
    return anio >= 2023 && anio <= 2026;
  });

  sel.innerHTML = '<option value="">— Selecciona gestión —</option>' +
    gestiones.map(g => `<option value="${g}">${g}</option>`).join('');
}

/* ═══════════════════════════════════════════════════════════════
   CERRAR AUTOCOMPLETE AL HACER CLIC FUERA
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('click', (e) => {
  const wrapper = e.target.closest('.autocomplete-wrapper');
  if (!wrapper) {
    const lista = document.getElementById('autocompleteLista');
    if (lista) lista.style.display = 'none';
  }
});