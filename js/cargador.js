/* ═══════════════════════════════════════════════════════════════
   CARGADOR DE JSON — Carga los datos con fetch
   ═══════════════════════════════════════════════════════════════ */

const DATOS = {
  plan1998: null,
  plan2023: null,
  plan2023aj: null,
  convalidaciones: {},   // { "ciencias": {...}, "sistemas": {...}, ... }
  electivas64h32h: null,
  cortes: null,
  cargado: false
};

/* ─── Mapeo de claves cortas a menciones 1998 ──────────────── */
const MAPA_ARCHIVOS_CONVALIDACION = {
  "ciencias":   { mencion1998: "CIENCIAS DE LA COMPUTACION", mencion2023aj: "CIENCIAS DE LA COMPUTACION" },
  "sistemas":   { mencion1998: "INGENIERIA DE SISTEMAS",     mencion2023aj: "INGENIERIA DE SISTEMAS" },
  "software":   { mencion1998: "CIENCIAS DE LA COMPUTACION", mencion2023aj: "DESARROLLO DE SOFTWARE E INNOVACION TECNOLOGICA" },
  "ia":         { mencion1998: "CIENCIAS DE LA COMPUTACION", mencion2023aj: "INTELIGENCIA ARTIFICIAL Y CIENCIA DE DATOS" },
  "tic":        { mencion1998: "CIENCIAS DE LA COMPUTACION", mencion2023aj: "REDES Y TECNOLOGIAS DE LA INFORMACION Y COMUNICACION (TIC)" },
  "seguridad":  { mencion1998: "CIENCIAS DE LA COMPUTACION", mencion2023aj: "SEGURIDAD DE LA INFORMACION" },
  "industrial": { mencion1998: "INFORMATICA INDUSTRIAL",     mencion2023aj: "INFORMATICA INDUSTRIAL" }
};

/* ─── Cargar todos los datos ────────────────────────────────── */
async function cargarTodosLosDatos() {
  try {
    // 1. Cargar planes base
    const [plan1998, plan2023, plan2023aj, electivas, cortes] = await Promise.all([
      fetch('data/planes/plan_1998.json').then(r => r.json()),
      fetch('data/planes/plan_2023.json').then(r => r.json()),
      fetch('data/planes/plan_2023_ajustado.json').then(r => r.json()),
      fetch('data/electivas_64h_32h.json').then(r => r.json()),
      fetch('data/cortes.json').then(r => r.json())
    ]);

    DATOS.plan1998 = plan1998;
    DATOS.plan2023 = plan2023;
    DATOS.plan2023aj = plan2023aj;
    DATOS.electivas64h32h = electivas;
    DATOS.cortes = cortes;

    // 2. Cargar las 7 convalidaciones
    for (const [clave, meta] of Object.entries(MAPA_ARCHIVOS_CONVALIDACION)) {
      try {
        const conv = await fetch(`data/convalidaciones/1998_a_2023aj_${clave}.json`).then(r => r.json());
        DATOS.convalidaciones[clave] = conv;
      } catch (e) {
        console.warn(`⚠️ No se pudo cargar convalidación: ${clave}`, e);
      }
    }

    DATOS.cargado = true;
    console.log('✅ Datos cargados correctamente');
    console.log('   - Planes:', { p1998: !!plan1998, p2023: !!plan2023, p2023aj: !!plan2023aj });
    console.log('   - Convalidaciones:', Object.keys(DATOS.convalidaciones));
    console.log('   - Electivas:', Object.keys(electivas?.por_mencion || {}));
    return true;

  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    alert('Error al cargar los datos del sistema. Revisa la consola (F12).');
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS DE ACCESO A DATOS
   ═══════════════════════════════════════════════════════════════ */

function getPlan1998() { return DATOS.plan1998; }
function getPlan2023() { return DATOS.plan2023; }
function getPlan2023aj() { return DATOS.plan2023aj; }
function getCortes() { return DATOS.cortes; }

/* ─── Obtener convalidaciones según combinación de menciones ─── */
function getConvalidaciones(mencion1998, mencion2023aj) {
  // Buscar en el mapa de archivos la combinación exacta
  for (const [clave, meta] of Object.entries(MAPA_ARCHIVOS_CONVALIDACION)) {
    if (meta.mencion1998 === mencion1998 && meta.mencion2023aj === mencion2023aj) {
      return DATOS.convalidaciones[clave]?.convalidaciones || {};
    }
  }

  // Fallback: si no se encuentra la combinación exacta, intentar con "ciencias" como base
  console.warn(`⚠️ No hay convalidación específica para ${mencion1998} → ${mencion2023aj}`);
  console.warn('   Usando convalidaciones de CIENCIAS como fallback');

  if (mencion1998 === "CIENCIAS DE LA COMPUTACION") {
    return DATOS.convalidaciones["ciencias"]?.convalidaciones || {};
  }
  if (mencion1998 === "INGENIERIA DE SISTEMAS") {
    return DATOS.convalidaciones["sistemas"]?.convalidaciones || {};
  }
  if (mencion1998 === "INFORMATICA INDUSTRIAL") {
    return DATOS.convalidaciones["industrial"]?.convalidaciones || {};
  }

  return {};
}

/* ─── Obtener tabla de electivas 64h→32h según mención 2023aj ── */
function getElectivas(mencion2023aj) {
  return DATOS.electivas64h32h?.por_mencion[mencion2023aj] || {};
}

/* ─── Obtener electivas libres del 1998 según mención ────────── */
function getElectivas1998(mencion1998, mencion2023aj) {
  for (const [clave, meta] of Object.entries(MAPA_ARCHIVOS_CONVALIDACION)) {
    if (meta.mencion1998 === mencion1998 && meta.mencion2023aj === mencion2023aj) {
      return DATOS.convalidaciones[clave]?.electivas_1998_libres || {};
    }
  }
  return {};
}

/* ─── Obtener materias del plan 2023 ajustado según mención ──── */
function getMaterias2023aj(mencion2023aj) {
  return DATOS.plan2023aj?.menciones[mencion2023aj]?.materias || [];
}