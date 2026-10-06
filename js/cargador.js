/* ═══════════════════════════════════════════════════════════════
   CARGADOR DE JSON
   ═══════════════════════════════════════════════════════════════ */

const DATOS = {
  plan1998: null,
  plan2023: null,
  plan2023aj: null,
  convalidaciones: {},
  electivas64h32h: null,
  electivasPorMencion: null,
  electivas1998Convalidadas: null,
  cortes: null,
  cargado: false
};

const MAPA_ARCHIVOS_CONVALIDACION = {
  "ciencias":   { mencion1998: "CIENCIAS DE LA COMPUTACION", mencion2023aj: "CIENCIAS DE LA COMPUTACION" },
  "sistemas":   { mencion1998: "INGENIERIA DE SISTEMAS",     mencion2023aj: "INGENIERIA DE SISTEMAS" },
  "software":   { mencion1998: "CIENCIAS DE LA COMPUTACION", mencion2023aj: "DESARROLLO DE SOFTWARE E INNOVACION TECNOLOGICA" },
  "ia":         { mencion1998: "CIENCIAS DE LA COMPUTACION", mencion2023aj: "INTELIGENCIA ARTIFICIAL Y CIENCIA DE DATOS" },
  "tic":        { mencion1998: "CIENCIAS DE LA COMPUTACION", mencion2023aj: "REDES Y TECNOLOGIAS DE LA INFORMACION Y COMUNICACION (TIC)" },
  "seguridad":  { mencion1998: "CIENCIAS DE LA COMPUTACION", mencion2023aj: "SEGURIDAD DE LA INFORMACION" },
  "industrial": { mencion1998: "INFORMATICA INDUSTRIAL",     mencion2023aj: "INFORMATICA INDUSTRIAL" }
};

async function cargarTodosLosDatos() {
  try {
    const [
      plan1998,
      plan2023,
      plan2023aj,
      electivas,
      cortes,
      electivasPorMencion,
      electivas1998Convalidadas
    ] = await Promise.all([
      fetch('data/planes/plan_1998.json').then(r => r.json()),
      fetch('data/planes/plan_2023.json').then(r => r.json()),
      fetch('data/planes/plan_2023_ajustado.json').then(r => r.json()),
      fetch('data/electivas_64h_32h.json').then(r => r.json()),
      fetch('data/cortes.json').then(r => r.json()),
      fetch('data/electivas_por_mencion.json').then(r => r.json()),
      fetch('data/electivas_1998_convalidadas.json').then(r => r.json())
    ]);

    DATOS.plan1998 = plan1998;
    DATOS.plan2023 = plan2023;
    DATOS.plan2023aj = plan2023aj;
    DATOS.electivas64h32h = electivas;
    DATOS.cortes = cortes;
    DATOS.electivasPorMencion = electivasPorMencion;
    DATOS.electivas1998Convalidadas = electivas1998Convalidadas;

    // Cargar las 7 convalidaciones
    for (const [clave] of Object.entries(MAPA_ARCHIVOS_CONVALIDACION)) {
      try {
        const conv = await fetch(`data/convalidaciones/1998_a_2023aj_${clave}.json`).then(r => r.json());
        DATOS.convalidaciones[clave] = conv;
      } catch (e) {
        console.warn(`⚠️ No se pudo cargar convalidación: ${clave}`, e);
      }
    }

    DATOS.cargado = true;
    console.log('✅ Datos cargados correctamente');
    return true;

  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    alert('Error al cargar los datos del sistema. Revisa la consola (F12).');
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function getPlan1998() { return DATOS.plan1998; }
function getPlan2023() { return DATOS.plan2023; }
function getPlan2023aj() { return DATOS.plan2023aj; }
function getCortes() { return DATOS.cortes; }

/* ═══════════════════════════════════════════════════════════════
   OBTENER CONVALIDACIONES
   Estrategia:
   1. Buscar coincidencia exacta (mencion1998 + mencion2023aj)
   2. Si no hay, buscar solo por mencion2023aj
   3. Si no hay, fallback a ciencias
   ═══════════════════════════════════════════════════════════════ */
function getConvalidaciones(mencion1998, mencion2023aj) {
  // 1. Coincidencia exacta
  for (const [clave, meta] of Object.entries(MAPA_ARCHIVOS_CONVALIDACION)) {
    if (meta.mencion1998 === mencion1998 && meta.mencion2023aj === mencion2023aj) {
      return DATOS.convalidaciones[clave]?.convalidaciones || {};
    }
  }

  // 2. Solo por mención destino
  for (const [clave, meta] of Object.entries(MAPA_ARCHIVOS_CONVALIDACION)) {
    if (meta.mencion2023aj === mencion2023aj) {
      console.warn(`⚠️ Usando tabla "${clave}" solo por mención destino: ${mencion2023aj}`);
      return DATOS.convalidaciones[clave]?.convalidaciones || {};
    }
  }

  // 3. Fallback
  console.warn(`⚠️ No hay tabla para ${mencion1998} → ${mencion2023aj}. Usando ciencias.`);
  return DATOS.convalidaciones["ciencias"]?.convalidaciones || {};
}

function getElectivas(mencion2023aj) {
  return DATOS.electivas64h32h?.por_mencion[mencion2023aj] || {};
}

function getElectivas1998(mencion1998, mencion2023aj) {
  // Buscar primero por combinación exacta
  for (const [clave, meta] of Object.entries(MAPA_ARCHIVOS_CONVALIDACION)) {
    if (meta.mencion1998 === mencion1998 && meta.mencion2023aj === mencion2023aj) {
      return DATOS.convalidaciones[clave]?.electivas_1998_libres || {};
    }
  }
  // Fallback por mención destino
  for (const [clave, meta] of Object.entries(MAPA_ARCHIVOS_CONVALIDACION)) {
    if (meta.mencion2023aj === mencion2023aj) {
      return DATOS.convalidaciones[clave]?.electivas_1998_libres || {};
    }
  }
  return {};
}

function getElectivas1998Convalidadas(mencion2023aj) {
  return DATOS.electivas1998Convalidadas?.por_mencion[mencion2023aj] || {};
}

function getOptativasPorMencion(mencion) {
  if (!DATOS.electivasPorMencion) return [];
  return DATOS.electivasPorMencion[mencion] || [];
}

function getMaterias2023aj(mencion2023aj) {
  return DATOS.plan2023aj?.menciones[mencion2023aj]?.materias || [];
}