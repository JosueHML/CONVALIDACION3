/* ═══════════════════════════════════════════════════════════════
   GENERADOR DE GESTIONES (1998 – 2026)
   ═══════════════════════════════════════════════════════════════ */
function generarGestiones() {
  const gestiones = [];
  const semestres = ["PRIMERO", "SEGUNDO", "INVIERNO", "VERANO"];

  for (let anio = 1998; anio <= 2026; anio++) {
    for (const sem of semestres) {
      gestiones.push(`${anio} ${sem}`);
    }
  }

  return gestiones;
}

const GESTIONES_DISPONIBLES = generarGestiones();

/* ═══════════════════════════════════════════════════════════════
   PLAN 1998 — materias disponibles
   ═══════════════════════════════════════════════════════════════ */
const PLAN_1998 = [
  { codigo: "INF-111", nombre: "INTRODUCCION A LA INFORMATICA" },
  { codigo: "LAB-111", nombre: "LABORATORIO DE INF-111" },
  { codigo: "INF-112", nombre: "ORGANIZACION DE COMPUTADORAS" },
  { codigo: "INF-113", nombre: "LABORATORIO DE COMPUTACION" },
  { codigo: "MAT-114", nombre: "MATEMATICA DISCRETA I" },
  { codigo: "MAT-115", nombre: "ANALISIS MATEMATICO I" },
  { codigo: "LIN-116", nombre: "GRAMATICA ESPAÑOLA" },
  { codigo: "INF-121", nombre: "ALGORITMOS Y PROGRAMACION" },
  { codigo: "LAB-121", nombre: "LABORATORIO DE INF-121" },
  { codigo: "FIS-122", nombre: "FISICA I" },
  { codigo: "LAB-122", nombre: "LABORATORIO DE FISICA I" },
  { codigo: "MAT-123", nombre: "MATEMATICA DISCRETA II" },
  { codigo: "MAT-124", nombre: "ALGEBRA LINEAL" },
  { codigo: "MAT-125", nombre: "ANALISIS MATEMATICO II" },
  { codigo: "INF-131", nombre: "ESTRUCTURA DE DATOS Y ALGORITMOS" },
  { codigo: "LAB-131", nombre: "LABORATORIO DE INF-131" },
  { codigo: "FIS-132", nombre: "FISICA II" },
  { codigo: "LAB-132", nombre: "LABORATORIO FISICA II" },
  { codigo: "EST-133", nombre: "ESTADISTICA I" },
  { codigo: "MAT-134", nombre: "ANALISIS MATEMATICO III" },
  { codigo: "LIN-135", nombre: "IDIOMA I" },
  { codigo: "INF-141", nombre: "SISTEMAS DE GESTION" },
  { codigo: "INF-142", nombre: "FUNDAMENTOS DIGITALES" },
  { codigo: "INF-143", nombre: "TALLER DE PROGRAMACION" },
  { codigo: "INF-144", nombre: "LOGICA PARA LA CIENCIA DE LA COMPUTACION" },
  { codigo: "EST-145", nombre: "ESTADISTICA II" },
  { codigo: "INF-151", nombre: "SISTEMAS OPERATIVOS" },
  { codigo: "INF-152", nombre: "SISTEMAS DE INFORMACION GERENCIAL" },
  { codigo: "INF-153", nombre: "ASSEMBLER" },
  { codigo: "INF-154", nombre: "LENGUAJES FORMALES Y AUTOMATAS" },
  { codigo: "EST-155", nombre: "INVESTIGACION DE OPERACIONES I" },
  { codigo: "MAT-156", nombre: "ANALISIS NUMERICO" },
  { codigo: "INF-161", nombre: "DISEÑO Y ADMINISTRACION DE BASE DE DATOS" },
  { codigo: "INF-162", nombre: "ANALISIS Y DISEÑO DE SISTEMAS DE INFORMACION" },
  { codigo: "INF-163", nombre: "INGENIERIA DE SOFTWARE" },
  { codigo: "INF-164", nombre: "TEORIA DE LA INFORMACION Y CODIFICACION" },
  { codigo: "EST-165", nombre: "INVESTIGACION DE OPERACIONES II" },
  { codigo: "INF-166", nombre: "INFORMATICA Y SOCIEDAD" },
  { codigo: "INF-271", nombre: "TEORIA DE SISTEMAS Y MODELOS" },
  { codigo: "INF-272", nombre: "TALLER DE BASE DE DATOS" },
  { codigo: "INF-273", nombre: "TELEMATICA" },
  { codigo: "LAB-273", nombre: "LABORATORIO DE INF-273" },
  { codigo: "INF-281", nombre: "TALLER DE SISTEMAS DE INFORMACION" },
  { codigo: "INF-282", nombre: "ESPECIFICACIONES FORMALES Y VERIFICACION" },
  { codigo: "INF-391", nombre: "SIMULACION DE SISTEMAS" }
];

/* ═══════════════════════════════════════════════════════════════
   PLAN 2023 — materias disponibles
   ═══════════════════════════════════════════════════════════════ */
const PLAN_2023 = [
  { codigo: "INF-111", nombre: "PROGRAMACIÓN I" },
  { codigo: "INF-112", nombre: "FUNDAMENTOS DIGITALES" },
  { codigo: "INF-113", nombre: "PROGRAMACIÓN WEB I" },
  { codigo: "INF-114", nombre: "ÁLGEBRA" },
  { codigo: "INF-115", nombre: "CÁLCULO I" },
  { codigo: "INF-116", nombre: "FÍSICA" },
  { codigo: "INF-121", nombre: "PROGRAMACIÓN II" },
  { codigo: "INF-122", nombre: "PROGRAMACIÓN WEB II" },
  { codigo: "INF-123", nombre: "ELECTRÓNICA GENERAL I" },
  { codigo: "INF-124", nombre: "ESTADÍSTICA I" },
  { codigo: "INF-125", nombre: "ÁLGEBRA LINEAL" },
  { codigo: "INF-126", nombre: "CÁLCULO II" },
  { codigo: "INF-131", nombre: "PROGRAMACIÓN III" },
  { codigo: "INF-132", nombre: "BASE DE DATOS I" },
  { codigo: "INF-133", nombre: "PROGRAMACIÓN WEB III" },
  { codigo: "INF-134", nombre: "ESTADÍSTICA II" },
  { codigo: "INF-135", nombre: "SISTEMAS OPERATIVOS" },
  { codigo: "TRA-136", nombre: "METODOLOGÍA DE LA INVESTIGACIÓN" }
];

/* ═══════════════════════════════════════════════════════════════
   CONVALIDACIÓN 1998 → 2023 AJUSTADO
   (Ciencias de la Computación)
   ═══════════════════════════════════════════════════════════════ */
const CONVALIDACION_1998_A_2023AJ = {
  "CIENCIAS DE LA COMPUTACION": {
    "INF-111": { cod2023: "INF-111", nom2023: "PROGRAMACIÓN I", cod2023aj: "INF-111", nom2023aj: "PROGRAMACIÓN I" },
    "LAB-111": { cod2023: "INF-111", nom2023: "PROGRAMACIÓN I", cod2023aj: "INF-111", nom2023aj: "PROGRAMACIÓN I", duplicada: true },
    "INF-112": { cod2023: "INF-112", nom2023: "FUNDAMENTOS DIGITALES", cod2023aj: "INF-112", nom2023aj: "FUNDAMENTOS DIGITALES" },
    "INF-113": { cod2023: "INF-113", nom2023: "PROGRAMACIÓN WEB I", cod2023aj: "INF-113", nom2023aj: "PROGRAMACIÓN WEB I" },
    "MAT-114": { cod2023: "INF-114", nom2023: "ÁLGEBRA", cod2023aj: "INF-114", nom2023aj: "ÁLGEBRA" },
    "MAT-115": { cod2023: "INF-115", nom2023: "CÁLCULO I", cod2023aj: "INF-115", nom2023aj: "CÁLCULO I" },
    "LIN-116": { cod2023: "TRA-136", nom2023: "METODOLOGÍA DE LA INVESTIGACIÓN", cod2023aj: "TRA-136", nom2023aj: "METODOLOGÍA DE LA INVESTIGACIÓN" },
    "INF-121": { cod2023: "INF-121", nom2023: "PROGRAMACIÓN II", cod2023aj: "INF-121", nom2023aj: "PROGRAMACIÓN II" },
    "LAB-121": { cod2023: "INF-121", nom2023: "PROGRAMACIÓN II", cod2023aj: "INF-121", nom2023aj: "PROGRAMACIÓN II", duplicada: true },
    "FIS-122": { cod2023: "COM-316", nom2023: "PROCESAMIENTO DEL LENGUAJE NATURAL", cod2023aj: "COM-316", nom2023aj: "PROCESAMIENTO DEL LENGUAJE NATURAL" },
    "LAB-122": { cod2023: "COM-317", nom2023: "GEOMETRÍA COMPUTACIONAL", cod2023aj: "COM-317", nom2023aj: "GEOMETRÍA COMPUTACIONAL" },
    "MAT-123": { cod2023: "INF-117", nom2023: "MATEMÁTICA DISCRETA", cod2023aj: "INF-117", nom2023aj: "MATEMÁTICA DISCRETA" },
    "MAT-124": { cod2023: "INF-125", nom2023: "ÁLGEBRA LINEAL", cod2023aj: "INF-125", nom2023aj: "ÁLGEBRA LINEAL" },
    "MAT-125": { cod2023: "INF-126", nom2023: "CÁLCULO II", cod2023aj: "INF-126", nom2023aj: "CÁLCULO II" },
    "INF-131": { cod2023: "INF-131", nom2023: "PROGRAMACIÓN III", cod2023aj: "INF-131", nom2023aj: "PROGRAMACIÓN III" },
    "LAB-131": { cod2023: "INF-131", nom2023: "PROGRAMACIÓN III", cod2023aj: "INF-131", nom2023aj: "PROGRAMACIÓN III", duplicada: true },
    "FIS-132": { cod2023: "INF-123", nom2023: "ELECTRÓNICA GENERAL I", cod2023aj: "INF-123", nom2023aj: "ELECTRÓNICA GENERAL I" },
    "LAB-132": { cod2023: "INF-123", nom2023: "ELECTRÓNICA GENERAL I", cod2023aj: "INF-123", nom2023aj: "ELECTRÓNICA GENERAL I", duplicada: true },
    "EST-133": { cod2023: "INF-124", nom2023: "ESTADÍSTICA I", cod2023aj: "INF-124", nom2023aj: "ESTADÍSTICA I" },
    "MAT-134": { cod2023: "INF-247", nom2023: "CÁLCULO III", cod2023aj: "INF-247", nom2023aj: "CÁLCULO III" },
    "LIN-135": { cod2023: "INF-314", nom2023: "INGLÉS TÉCNICO", cod2023aj: "INF-314", nom2023aj: "INGLÉS TÉCNICO" },
    "INF-141": { cod2023: "COM-321", nom2023: "SISTEMAS INTELIGENTES", cod2023aj: "COM-321", nom2023aj: "SISTEMAS INTELIGENTES" },
    "INF-142": { cod2023: "INF-112", nom2023: "FUNDAMENTOS DIGITALES", cod2023aj: "INF-112", nom2023aj: "FUNDAMENTOS DIGITALES", duplicada: true },
    "INF-143": { cod2023: "INF-131", nom2023: "PROGRAMACIÓN III", cod2023aj: "INF-131", nom2023aj: "PROGRAMACIÓN III", duplicada: true },
    "INF-144": { cod2023: "COM-245", nom2023: "LÓGICA PARA LA CIENCIA DE LA COMPUTACIÓN", cod2023aj: "COM-245", nom2023aj: "LÓGICA PARA LA CIENCIA DE LA COMPUTACIÓN" },
    "EST-145": { cod2023: "INF-134", nom2023: "ESTADÍSTICA II", cod2023aj: "INF-134", nom2023aj: "ESTADÍSTICA II" },
    "INF-151": { cod2023: "INF-135", nom2023: "SISTEMAS OPERATIVOS", cod2023aj: "INF-135", nom2023aj: "SISTEMAS OPERATIVOS" },
    "INF-152": { cod2023: "COM-323", nom2023: "COMPUTABILIDAD Y COMPLEJIDAD ALGORÍTMICA", cod2023aj: "COM-323", nom2023aj: "COMPUTABILIDAD Y COMPLEJIDAD ALGORÍTMICA" },
    "INF-153": { cod2023: "INF-336", nom2023: "VISIÓN ARTIFICIAL Y MANEJO DE IMÁGENES", cod2023aj: "INF-336", nom2023aj: "VISIÓN ARTIFICIAL Y MANEJO DE IMÁGENES" },
    "INF-154": { cod2023: "COM-261", nom2023: "LENGUAJES FORMALES Y AUTÓMATAS", cod2023aj: "COM-261", nom2023aj: "LENGUAJES FORMALES Y AUTÓMATAS" },
    "EST-155": { cod2023: "INF-243", nom2023: "INVESTIGACIÓN OPERATIVA I", cod2023aj: "INF-243", nom2023aj: "INVESTIGACIÓN OPERATIVA I" },
    "MAT-156": { cod2023: "COM-254", nom2023: "MÉTODOS NUMÉRICOS I", cod2023aj: "COM-254", nom2023aj: "MÉTODOS NUMÉRICOS I" },
    "INF-161": { cod2023: "INF-132", nom2023: "BASE DE DATOS I", cod2023aj: "INF-132", nom2023aj: "BASE DE DATOS I" },
    "INF-162": { cod2023: "INF-241", nom2023: "ANÁLISIS Y DISEÑO DE SISTEMAS I", cod2023aj: "INF-241", nom2023aj: "ANÁLISIS Y DISEÑO DE SISTEMAS I" },
    "INF-163": { cod2023: "INF-251", nom2023: "INGENIERÍA DE SOFTWARE I", cod2023aj: "INF-251", nom2023aj: "INGENIERÍA DE SOFTWARE I" },
    "INF-164": { cod2023: "COM-311", nom2023: "SISTEMAS ESTOCÁSTICOS", cod2023aj: "COM-311", nom2023aj: "SISTEMAS ESTOCÁSTICOS" },
    "EST-165": { cod2023: "INF-331", nom2023: "INVESTIGACIÓN OPERATIVA II", cod2023aj: "INF-331", nom2023aj: "INVESTIGACIÓN OPERATIVA II" },
    "INF-166": { cod2023: "TRA-256", nom2023: "LEGISLACIÓN INFORMÁTICA Y ÉTICA", cod2023aj: "TRA-256", nom2023aj: "LEGISLACIÓN INFORMÁTICA Y ÉTICA" },
    "INF-271": { cod2023: "COM-320", nom2023: "ESPECIFICACIÓN FORMAL Y VERIFICACIÓN", cod2023aj: "COM-320", nom2023aj: "ESPECIFICACIÓN FORMAL Y VERIFICACIÓN" },
    "INF-272": { cod2023: "COM-322", nom2023: "BASE DE DATOS II", cod2023aj: "COM-322", nom2023aj: "BASE DE DATOS II" },
    "INF-273": { cod2023: "INF-242", nom2023: "REDES I", cod2023aj: "INF-242", nom2023aj: "REDES I" },
    "LAB-273": { cod2023: "INF-242", nom2023: "REDES I", cod2023aj: "INF-242", nom2023aj: "REDES I", duplicada: true },
    "INF-281": { cod2023: "INF-266", nom2023: "TALLER DE PROYECTO", cod2023aj: "INF-266", nom2023aj: "TALLER DE PROYECTO" },
    "INF-282": { cod2023: "INF-324", nom2023: "APRENDIZAJE PROFUNDO (DEEP LEARNING)", cod2023aj: "INF-324", nom2023aj: "APRENDIZAJE PROFUNDO (DEEP LEARNING)" },
    "INF-391": { cod2023: "COM-371", nom2023: "SIMULACIÓN DE SISTEMAS", cod2023aj: "COM-371", nom2023aj: "SIMULACIÓN DE SISTEMAS" }
  }
};

/* ═══════════════════════════════════════════════════════════════
   ELECTIVAS POR REGLA 64h → 32h (por mención)
   ═══════════════════════════════════════════════════════════════ */
const ELECTIVAS_64H_32H = {
  "CIENCIAS DE LA COMPUTACION": {
    "INF-111": { cod: "COM-323", nom: "COMPUTABILIDAD Y COMPLEJIDAD ALGORÍTMICA" },
    "INF-121": { cod: "COM-317", nom: "GEOMETRÍA COMPUTACIONAL" },
    "INF-131": { cod: "INF-336", nom: "VISIÓN ARTIFICIAL Y MANEJO DE IMÁGENES" }
  },
  "DESARROLLO DE SOFTWARE E INNOVACION TECNOLOGICA": {
    "INF-111": { cod: "INF-319", nom: "PROGRAMACIÓN A BAJO NIVEL" },
    "INF-121": { cod: "INF-325", nom: "DERECHO INFORMÁTICO" },
    "INF-131": { cod: "INF-326", nom: "NEGOCIACIONES Y TOMA DE DECISIONES" }
  },
  "INGENIERIA DE SISTEMAS": {
    "INF-111": { cod: "INF-319", nom: "PROGRAMACIÓN A BAJO NIVEL" },
    "INF-121": { cod: "SIS-313", nom: "DATAWAREHOUSE" },
    "INF-131": { cod: "INF-326", nom: "NEGOCIACIONES Y TOMA DE DECISIONES" }
  },
  "INTELIGENCIA ARTIFICIAL Y CIENCIA DE DATOS": {
    "INF-111": { cod: "DAT-312", nom: "MODELOS GENERATIVOS" },
    "INF-121": { cod: "INF-325", nom: "DERECHO INFORMÁTICO" },
    "INF-131": { cod: "INF-336", nom: "VISIÓN ARTIFICIAL Y MANEJO DE IMÁGENES" }
  },
  "REDES Y TECNOLOGIAS DE LA INFORMACION Y COMUNICACION (TIC)": {
    "INF-111": { cod: "TIC-311", nom: "SISTEMAS EMBEBIDOS" },
    "INF-121": { cod: "TIC-312", nom: "ADMINISTRACIÓN DE SERVIDORES" },
    "INF-131": { cod: "TIC-316", nom: "COMUNICACIONES POR SATÉLITE" }
  },
  "SEGURIDAD DE LA INFORMACION": {
    "INF-111": { cod: "SEG-316", nom: "HACKING ÉTICO II" },
    "INF-121": { cod: "INF-325", nom: "DERECHO INFORMÁTICO" },
    "INF-131": { cod: "SEG-317", nom: "ADMINISTRACIÓN DE CENTROS DE OPERACIONES DE RED" }
  },
  "INFORMATICA INDUSTRIAL": {
    "INF-111": { cod: "INF-319", nom: "PROGRAMACIÓN A BAJO NIVEL" },
    "INF-121": { cod: "IID-313", nom: "SISTEMAS AVANZADOS DE COMUNICACIONES" },
    "INF-131": { cod: "IID-312", nom: "COMUNICACIONES POR SATÉLITE" }
  }
};

/* ═══════════════════════════════════════════════════════════════
   DATOS DEL ESTUDIANTE (vacío — el usuario llena el formulario)
   ═══════════════════════════════════════════════════════════════ */
const ESTUDIANTE_MOCK = {
  nombre: "",
  cedula: "",
  ru: "",
  anioIngreso: "",
  mencion1998: "",
  mencion2023aj: "",
  aproboCalculoIV: null
};

/* ═══════════════════════════════════════════════════════════════
   MATERIAS MARCADAS (vacío — el usuario las marca)
   ═══════════════════════════════════════════════════════════════ */
const MATERIAS_MARCADAS_MOCK = [];