/* ═══════════════════════════════════════════════════════════════
   ORQUESTADOR PRINCIPAL + MOTOR DE CONVALIDACIÓN
   ═══════════════════════════════════════════════════════════════ */

let materiasMarcadas = [];


/* ═══════════════════════════════════════════════════════════════
   CONFIRMAR MATERIAS MARCADAS (MARCAR MANUAL)
   ═══════════════════════════════════════════════════════════════ */
function confirmarMaterias() {
  materiasMarcadas = [];

  const filasMarcadas = document.querySelectorAll('.materia-row-check.marcada');

  if (filasMarcadas.length === 0) {
    alert("⚠️ Debes marcar al menos una materia.");
    return;
  }

  let errorGestion = false;

  filasMarcadas.forEach(fila => {
    const chk = fila.querySelector('input[type="checkbox"]');
    const sel = fila.querySelector('select');

    if (!sel.value) {
      errorGestion = true;
      return;
    }

    materiasMarcadas.push({
      codigo: chk.dataset.codigo,
      nombre: chk.dataset.nombre,
      gestion: sel.value,
      plan: chk.dataset.plan
    });
  });

  if (errorGestion) {
    alert("⚠️ Debes seleccionar la gestión (período) en TODAS las materias marcadas.");
    return;
  }

  localStorage.setItem('materiasMarcadas', JSON.stringify(materiasMarcadas));
  irAElectivasOResultado();
}


/* ═══════════════════════════════════════════════════════════════
   IR A ELECTIVAS O DIRECTAMENTE A RESULTADO
   ═══════════════════════════════════════════════════════════════ */
function irAElectivasOResultado() {
  const est = JSON.parse(localStorage.getItem('estudiante') || '{}');
  const materias = JSON.parse(localStorage.getItem('materiasMarcadas') || '[]');

  // Detectar si hay materias del 1998 que convalidan a ELECTIVA
  const materiasElectiva = detectarMateriasElectiva(
    materias,
    est.mencion1998,
    est.mencion2023aj
  );

  if (materiasElectiva.length > 0) {
    localStorage.setItem('materiasElectivaPendientes', JSON.stringify(materiasElectiva));
    navegar('vista-electivas');
  } else {
    navegar('vista-resultado');
  }
}


/* ═══════════════════════════════════════════════════════════════
   DETECTAR MATERIAS QUE CONVALIDAN A ELECTIVA
   ═══════════════════════════════════════════════════════════════ */
function detectarMateriasElectiva(materias, mencion1998, mencion2023aj) {
  const tablaConv = getConvalidaciones(mencion1998, mencion2023aj);
  const tablaElectivas1998 = getElectivas1998(mencion1998, mencion2023aj);
  const tablaElectivas1998Convalidadas = DATOS.electivas1998Convalidadas?.por_mencion[mencion2023aj] || {};
  
  const pendientes = [];
  const vistos = new Set();

  for (const m of materias) {
    if (m.plan !== '1998') continue;
    if (vistos.has(m.codigo)) continue;
    vistos.add(m.codigo);

    const eq = tablaConv[m.codigo];
    const eqElec = tablaElectivas1998[m.codigo];
    const eqElectivaConv = tablaElectivas1998Convalidadas[m.codigo];

    // ─── CASO A: Convalida directo por tabla principal ─────
    if (eq && eq !== 'ELECTIVA') continue;

    // ─── CASO B: Convalida directo por electiva_1998 (JSON) ─
    if (eqElectivaConv && eqElectivaConv.tipo === 'convalida') continue;

    // ─── CASO C: Es ELECTIVA libre → necesita elección ──────
    if (eq === 'ELECTIVA' || eqElec === 'ELECTIVA') {
      pendientes.push({
        codigoOrigen: m.codigo,
        nombreOrigen: m.nombre,
        gestion: m.gestion
      });
    }
  }

  return pendientes;
}


/* ═══════════════════════════════════════════════════════════════
   CONFIRMAR MATERIAS DEL LECTOR PDF
   ═══════════════════════════════════════════════════════════════ */
function confirmarDeteccion() {
  const filas = document.querySelectorAll('#tablaDetectadas .materia-detectada-row');
  const materiasFinales = [];
  let faltanGestion = 0;

  filas.forEach(fila => {
    const chk = fila.querySelector('input[type="checkbox"]');
    if (!chk || !chk.checked) return;

    const select = fila.querySelector('select');
    if (!select) return;

    const idx = parseInt(fila.dataset.idx);
    const m = materiasDetectadas[idx];
    if (!m) return;
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
    alert(`⚠️ Tienes ${faltanGestion} materia(s) sin gestión. Asígnales una gestión o desmárcalas.`);
    return;
  }
  if (materiasFinales.length === 0) {
    alert("⚠️ Debes marcar al menos una materia.");
    return;
  }

  localStorage.setItem('materiasMarcadas', JSON.stringify(materiasFinales));
  materiasMarcadas = materiasFinales;
  irAElectivasOResultado();
}


/* ═══════════════════════════════════════════════════════════════
   LIMPIAR MARCAS (MARCAR MANUAL)
   ═══════════════════════════════════════════════════════════════ */
function limpiarMarcas() {
  document.querySelectorAll('.materia-row-check').forEach(fila => {
    fila.classList.remove('marcada');
    const chk = fila.querySelector('input[type="checkbox"]');
    const sel = fila.querySelector('select');
    if (chk) chk.checked = false;
    if (sel) {
      sel.value = '';
      sel.disabled = true;
    }
  });
  materiasMarcadas = [];
}


/* ═══════════════════════════════════════════════════════════════
   ELIMINAR MATERIA (MARCAR MANUAL)
   ═══════════════════════════════════════════════════════════════ */
function eliminarMateria(idx) {
  materiasMarcadas.splice(idx, 1);
  if (typeof renderizarTablaAgregadas === 'function') {
    renderizarTablaAgregadas(materiasMarcadas);
  }
}


/* ═══════════════════════════════════════════════════════════════
   MOTOR DE CONVALIDACIÓN
   ═══════════════════════════════════════════════════════════════ */
function calcularConvalidacion(materias, mencion1998, mencion2023aj) {
  const convalidadas = [];
  const electivas = [];
  const electivas1998 = [];
  const duplicadas = [];
  const noConvalidan = [];
  const codigosVistos = new Set();

  const tablaConv = getConvalidaciones(mencion1998, mencion2023aj);
  const tablaElectivas64h = getElectivas(mencion2023aj);
  const tablaElectivas1998 = getElectivas1998(mencion1998, mencion2023aj);

  // Cargar electivas elegidas por el usuario
  const electivasElegidas = JSON.parse(localStorage.getItem('electivasElegidas') || '{}');

  for (const m of materias) {
    const año = parseInt(m.gestion.split(" ")[0]);
    const segmento = año < 2023 ? "S1" : año === 2023 ? "S2" : año === 2024 ? "S3" : "S4";

    /* ─── SEGMENTO S1 — Plan 1998 ────────────────────────── */
    if (segmento === "S1") {
      const eq = tablaConv[m.codigo];

      if (eq && eq !== "ELECTIVA") {
        if (eq.duplicada || codigosVistos.has(eq.cod2023aj)) {
          duplicadas.push({
            codigo: m.codigo,
            nombre: m.nombre,
            motivo: `Ya convalidada por ${eq.cod2023aj}`
          });
          continue;
        }
        codigosVistos.add(eq.cod2023aj);
        convalidadas.push({
          codigoOrigen: m.codigo,
          nombreOrigen: m.nombre,
          planOrigen: "1998",
          gestion: m.gestion,
          cod2023: eq.cod2023,
          nom2023: eq.nom2023,
          codigoDestino: eq.cod2023aj,
          nombreDestino: eq.nom2023aj,
          segmento: "S1"
        });
      } else if (eq === "ELECTIVA" || tablaElectivas1998[m.codigo] === "ELECTIVA") {
        // El usuario debió haber elegido su optativa
        const elegida = electivasElegidas[m.codigo];
        electivas1998.push({
          codigoOrigen: m.codigo,
          nombreOrigen: m.nombre,
          gestion: m.gestion,
          codigoDestino: elegida?.codigo || null,
          nombreDestino: elegida?.nombre || "ELECTIVA (no elegida)",
          estado: elegida ? "ELECTIVA" : "PENDIENTE"
        });
      } else if (tablaElectivas1998[m.codigo] && tablaElectivas1998[m.codigo] !== "ELECTIVA") {
        const eqElec = tablaElectivas1998[m.codigo];
        if (eqElec.duplicada || codigosVistos.has(eqElec.cod2023aj)) {
          duplicadas.push({
            codigo: m.codigo,
            nombre: m.nombre,
            motivo: `Ya convalidada por ${eqElec.cod2023aj}`
          });
          continue;
        }
        codigosVistos.add(eqElec.cod2023aj);
        convalidadas.push({
          codigoOrigen: m.codigo,
          nombreOrigen: m.nombre,
          planOrigen: "1998",
          gestion: m.gestion,
          cod2023: eqElec.cod2023aj,
          nom2023: eqElec.nom2023aj,
          codigoDestino: eqElec.cod2023aj,
          nombreDestino: eqElec.nom2023aj,
          segmento: "S1"
        });
      } else {
        noConvalidan.push({
          codigo: m.codigo,
          nombre: m.nombre,
          motivo: "No tiene equivalencia en el plan 2023 Ajustado"
        });
      }
    }

    /* ─── SEGMENTO S2 — Plan 2023 (64h) ──────────────────── */
    else if (segmento === "S2") {
      if (codigosVistos.has(m.codigo)) {
        duplicadas.push({
          codigo: m.codigo,
          nombre: m.nombre,
          motivo: "Ya convalidada"
        });
        continue;
      }
      codigosVistos.add(m.codigo);

      convalidadas.push({
        codigoOrigen: m.codigo,
        nombreOrigen: m.nombre,
        planOrigen: "2023",
        gestion: m.gestion,
        cod2023: m.codigo,
        nom2023: m.nombre,
        codigoDestino: m.codigo,
        nombreDestino: m.nombre,
        segmento: "S2",
        nota: "64h → 32h"
      });

      if (["INF-111", "INF-121", "INF-131"].includes(m.codigo)) {
        const elec = tablaElectivas64h[m.codigo];
        if (elec) {
          electivas.push({
            codigo: elec.codigo,
            nombre: elec.nombre,
            origen: m.codigo,
            regla: "64h → 32h"
          });
        }
      }
    }

    /* ─── SEGMENTO S3 — Plan 2023 (32h) ──────────────────── */
    else if (segmento === "S3") {
      if (codigosVistos.has(m.codigo)) {
        duplicadas.push({
          codigo: m.codigo,
          nombre: m.nombre,
          motivo: "Ya convalidada"
        });
        continue;
      }
      codigosVistos.add(m.codigo);
      convalidadas.push({
        codigoOrigen: m.codigo,
        nombreOrigen: m.nombre,
        planOrigen: "2023",
        gestion: m.gestion,
        cod2023: m.codigo,
        nom2023: m.nombre,
        codigoDestino: m.codigo,
        nombreDestino: m.nombre,
        segmento: "S3"
      });
    }

    /* ─── SEGMENTO S4 — Plan 2023 Ajustado ───────────────── */
    else {
      convalidadas.push({
        codigoOrigen: m.codigo,
        nombreOrigen: m.nombre,
        planOrigen: "2023 AJUSTADO",
        gestion: m.gestion,
        cod2023: m.codigo,
        nom2023: m.nombre,
        codigoDestino: m.codigo,
        nombreDestino: m.nombre,
        segmento: "S4"
      });
    }
  }

  return {
    convalidadas,
    electivas,
    electivas1998,
    duplicadas,
    noConvalidan
  };
}