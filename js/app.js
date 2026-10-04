/* ═══════════════════════════════════════════════════════════════
   ORQUESTADOR PRINCIPAL + MOTOR DE CONVALIDACIÓN
   ═══════════════════════════════════════════════════════════════ */

let materiasMarcadas = [];

/* ─── Confirmar materias marcadas (MARCAR MANUAL) ────────────── */
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
  renderizarTablaAgregadas(materiasMarcadas);
  navegar('vista-resultado');
}

/* ─── Eliminar materia ───────────────────────────────────────── */
function eliminarMateria(idx) {
  materiasMarcadas.splice(idx, 1);
  renderizarTablaAgregadas(materiasMarcadas);
}

/* ─── Limpiar todas las marcas (MARCAR MANUAL) ──────────────── */
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

  document.getElementById('card-agregadas').style.display = 'none';
  materiasMarcadas = [];
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

  // Cargar tablas según combinación de menciones
  const tablaConv = getConvalidaciones(mencion1998, mencion2023aj);
  const tablaElectivas64h = getElectivas(mencion2023aj);
  const tablaElectivas1998 = getElectivas1998(mencion1998, mencion2023aj);

  for (const m of materias) {
    const año = parseInt(m.gestion.split(" ")[0]);
    const segmento = año < 2023 ? "S1" : año === 2023 ? "S2" : año === 2024 ? "S3" : "S4";

    /* ─── Segmento S1: Plan 1998 ─────────────────────────── */
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
      } else if (eq === "ELECTIVA") {
        electivas1998.push({
          codigoOrigen: m.codigo,
          nombreOrigen: m.nombre,
          gestion: m.gestion,
          estado: "ELECTIVA LIBRE"
        });
      } else if (tablaElectivas1998[m.codigo]) {
        const eqElec = tablaElectivas1998[m.codigo];
        if (eqElec === "ELECTIVA") {
          electivas1998.push({
            codigoOrigen: m.codigo,
            nombreOrigen: m.nombre,
            gestion: m.gestion,
            estado: "ELECTIVA LIBRE"
          });
        } else {
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
        }
      } else {
        noConvalidan.push({
          codigo: m.codigo,
          nombre: m.nombre,
          motivo: "No tiene equivalencia en el plan 2023 Ajustado"
        });
      }
    }

    /* ─── Segmento S2: Plan 2023 (64h) ───────────────────── */
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

      // Regla 64h → 32h
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

    /* ─── Segmento S3: Plan 2023 (32h) ───────────────────── */
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

    /* ─── Segmento S4: Plan 2023 Ajustado ────────────────── */
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

/* ═══════════════════════════════════════════════════════════════
   NOTA: Las funciones exportarPDF() y exportarExcel() están
   definidas en:
     - js/generador_pdf.js
     - js/generador_excel.js
   ═══════════════════════════════════════════════════════════════ */