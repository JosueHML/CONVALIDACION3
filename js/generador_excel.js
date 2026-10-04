/* ═══════════════════════════════════════════════════════════════
   GENERADOR DE EXCEL — SheetJS con formato profesional
   ═══════════════════════════════════════════════════════════════ */

function exportarExcel() {
  try {
    if (typeof XLSX === 'undefined') {
      alert("⚠️ Error: SheetJS no está cargado.");
      return;
    }

    // ─── Cargar datos ────────────────────────────────────────
    const est = JSON.parse(localStorage.getItem('estudiante') || '{}');
    const materias = JSON.parse(localStorage.getItem('materiasMarcadas') || '[]');

    if (!est.nombre || !est.mencion2023aj) {
      alert("⚠️ Faltan datos del estudiante.");
      return;
    }

    const resultado = calcularConvalidacion(
      materias,
      est.mencion1998,
      est.mencion2023aj
    );

    const workbook = XLSX.utils.book_new();

    // ═══════════════════════════════════════════════════════════
    // PALETA DE COLORES (formato ARGB de Excel)
    // ═══════════════════════════════════════════════════════════
    const COLORES = {
      azulUMSA:     'FF1A3A6B',
      azulClaro:    'FFE8F4FC',
      verde:        'FF28A745',
      verdeClaro:   'FFD4EDDA',
      morado:       'FF6F42C1',
      moradoClaro:  'FFE9D8FD',
      naranja:      'FFFD7E14',
      naranjaClaro: 'FFFFF3CD',
      grisClaro:    'FFF4F6F9',
      blanco:       'FFFFFFFF',
      negro:        'FF212529',
    };

    /* ═══════════════════════════════════════════════════════════
       HOJA 1: DATOS DEL ESTUDIANTE
       ═══════════════════════════════════════════════════════════ */
    const datosEstudiante = [
      ['SISTEMA DE CONVALIDACIONES 1998 → 2023 AJUSTADO'],
      ['Universidad Mayor de San Andrés'],
      ['Facultad de Ciencias Puras y Naturales — Carrera de Informática'],
      [],
      ['DATOS DEL ESTUDIANTE'],
      ['Nombre', est.nombre || '—'],
      ['Cédula', est.cedula || '—'],
      ['RU', est.ru || '—'],
      ['Mención 1998', est.mencion1998 || '—'],
      ['Mención 2023 Ajustado', est.mencion2023aj || '—'],
      ['¿Aprobó Cálculo IV?', est.aproboCalculoIV ? 'SÍ' : 'NO'],
      ['Fecha de generación', new Date().toLocaleString('es-BO')],
    ];

    const wsDatos = XLSX.utils.aoa_to_sheet(datosEstudiante);
    wsDatos['!cols'] = [{ wch: 30 }, { wch: 50 }];
    wsDatos['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } },
    ];

    // Formato
    aplicarFormato(wsDatos, {
      'A1': { bold: true, size: 14, color: COLORES.azulUMSA, align: 'center' },
      'A2': { bold: true, size: 12, color: COLORES.azulUMSA, align: 'center' },
      'A3': { size: 10, italic: true, color: COLORES.negro, align: 'center' },
      'A5': { bold: true, size: 12, color: COLORES.blanco, bg: COLORES.azulUMSA, align: 'center' },
      'A6': { bold: true, bg: COLORES.grisClaro },
      'A7': { bold: true, bg: COLORES.grisClaro },
      'A8': { bold: true, bg: COLORES.grisClaro },
      'A9': { bold: true, bg: COLORES.grisClaro },
      'A10': { bold: true, bg: COLORES.grisClaro },
      'A11': { bold: true, bg: COLORES.grisClaro },
      'A12': { bold: true, bg: COLORES.grisClaro },
    });

    XLSX.utils.book_append_sheet(workbook, wsDatos, 'Datos');

    /* ═══════════════════════════════════════════════════════════
       HOJA 2: CONVALIDACIONES
       ═══════════════════════════════════════════════════════════ */
    const headersConv = [
      'PÉNSUM 1998',
      'Nombre 1998',
      'Gestión',
      'PÉNSUM 2023',
      'Nombre 2023',
      '2023 AJUSTADO',
      'Nombre 2023 Aj.',
      'Estado',
    ];

    const filasConv = resultado.convalidadas.map(m => [
      m.codigoOrigen,
      m.nombreOrigen,
      m.gestion,
      m.cod2023 || '—',
      m.nom2023 || '—',
      m.codigoDestino,
      m.nombreDestino,
      '✅ Convalidada'
    ]);

    const wsConv = XLSX.utils.aoa_to_sheet([
      ['CONVALIDACIONES DE MATERIAS'],
      [],
      headersConv,
      ...filasConv
    ]);

    wsConv['!cols'] = [
      { wch: 14 }, { wch: 42 }, { wch: 16 },
      { wch: 14 }, { wch: 42 },
      { wch: 14 }, { wch: 42 },
      { wch: 18 }
    ];

    wsConv['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    ];

    // Formato de la hoja Convalidaciones
    const formatoConv = {
      'A1': { bold: true, size: 14, color: COLORES.blanco, bg: COLORES.azulUMSA, align: 'center' },
    };

    // Headers (fila 3, índice 2)
    for (let c = 0; c < headersConv.length; c++) {
      const col = String.fromCharCode(65 + c);
      formatoConv[`${col}3`] = {
        bold: true, size: 11, color: COLORES.blanco, bg: COLORES.azulUMSA,
        align: 'center', border: true
      };
    }

    // Filas de datos
    for (let r = 0; r < filasConv.length; r++) {
      const rowIdx = r + 4; // fila 4 en adelante (1-indexed)
      const bgRow = r % 2 === 0 ? COLORES.blanco : COLORES.grisClaro;

      for (let c = 0; c < 8; c++) {
        const col = String.fromCharCode(65 + c);
        const cellRef = `${col}${rowIdx}`;

        let formato = {
          size: 10,
          color: COLORES.negro,
          bg: bgRow,
          border: true,
          align: c === 0 || c === 2 || c === 3 || c === 5 ? 'center' : 'left',
        };

        // Columna A (PÉNSUM 1998) — azul claro
        if (c === 0) {
          formato.bold = true;
          formato.color = COLORES.azulUMSA;
          formato.bg = COLORES.azulClaro;
        }

        // Columna D (PÉNSUM 2023) — gris
        if (c === 3) {
          formato.bold = true;
          formato.color = 'FF6C757D';
        }

        // Columna F (2023 AJUSTADO) — verde
        if (c === 5) {
          formato.bold = true;
          formato.color = COLORES.verde;
          formato.bg = COLORES.verdeClaro;
        }

        // Columna H (Estado) — verde
        if (c === 7) {
          formato.bold = true;
          formato.color = COLORES.verde;
          formato.bg = COLORES.verdeClaro;
          formato.align = 'center';
        }

        formatoConv[cellRef] = formato;
      }
    }

    aplicarFormato(wsConv, formatoConv);

    XLSX.utils.book_append_sheet(workbook, wsConv, 'Convalidaciones');

    /* ═══════════════════════════════════════════════════════════
       HOJA 3: ELECTIVAS
       ═══════════════════════════════════════════════════════════ */
    const todasElectivas = [
      ...resultado.electivas,
      ...(resultado.electivas1998 || []).map(e => ({
        codigo: e.codigoOrigen,
        nombre: e.nombreOrigen + ' (electiva libre 1998)',
        origen: e.codigoOrigen,
        regla: '1998'
      }))
    ];

    const wsElectivasData = [
      ['ELECTIVAS ASIGNADAS'],
      [],
      ['Código', 'Nombre', 'Origen', 'Regla'],
      ...todasElectivas.map(e => [
        e.codigo,
        e.nombre,
        e.origen,
        e.regla || '64h → 32h'
      ])
    ];

    if (todasElectivas.length === 0) {
      wsElectivasData.push(['—', 'No se generaron electivas', '—', '—']);
    }

    const wsElectivas = XLSX.utils.aoa_to_sheet(wsElectivasData);
    wsElectivas['!cols'] = [
      { wch: 14 }, { wch: 55 }, { wch: 16 }, { wch: 16 }
    ];
    wsElectivas['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    ];

    const formatoElectivas = {
      'A1': { bold: true, size: 14, color: COLORES.blanco, bg: COLORES.morado, align: 'center' },
      'A3': { bold: true, size: 11, color: COLORES.blanco, bg: COLORES.morado, align: 'center', border: true },
      'B3': { bold: true, size: 11, color: COLORES.blanco, bg: COLORES.morado, align: 'center', border: true },
      'C3': { bold: true, size: 11, color: COLORES.blanco, bg: COLORES.morado, align: 'center', border: true },
      'D3': { bold: true, size: 11, color: COLORES.blanco, bg: COLORES.morado, align: 'center', border: true },
    };

    todasElectivas.forEach((e, r) => {
      const rowIdx = r + 4;
      const bgRow = r % 2 === 0 ? COLORES.blanco : COLORES.moradoClaro;
      formatoElectivas[`A${rowIdx}`] = { bold: true, color: COLORES.morado, bg: bgRow, border: true, align: 'center', size: 10 };
      formatoElectivas[`B${rowIdx}`] = { color: COLORES.negro, bg: bgRow, border: true, size: 10 };
      formatoElectivas[`C${rowIdx}`] = { color: COLORES.negro, bg: bgRow, border: true, align: 'center', size: 10 };
      formatoElectivas[`D${rowIdx}`] = { color: COLORES.negro, bg: bgRow, border: true, align: 'center', size: 10 };
    });

    aplicarFormato(wsElectivas, formatoElectivas);

    XLSX.utils.book_append_sheet(workbook, wsElectivas, 'Electivas');

    /* ═══════════════════════════════════════════════════════════
       HOJA 4: DUPLICADAS
       ═══════════════════════════════════════════════════════════ */
    const wsDuplicadasData = [
      ['MATERIAS DUPLICADAS (no se cuentan 2 veces)'],
      [],
      ['Código', 'Nombre', 'Motivo'],
      ...resultado.duplicadas.map(d => [
        d.codigo, d.nombre, d.motivo
      ])
    ];

    if (resultado.duplicadas.length === 0) {
      wsDuplicadasData.push(['—', 'No hay materias duplicadas', '—']);
    }

    const wsDuplicadas = XLSX.utils.aoa_to_sheet(wsDuplicadasData);
    wsDuplicadas['!cols'] = [
      { wch: 14 }, { wch: 50 }, { wch: 50 }
    ];
    wsDuplicadas['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    ];

    const formatoDuplicadas = {
      'A1': { bold: true, size: 14, color: COLORES.blanco, bg: COLORES.naranja, align: 'center' },
      'A3': { bold: true, size: 11, color: COLORES.blanco, bg: COLORES.naranja, align: 'center', border: true },
      'B3': { bold: true, size: 11, color: COLORES.blanco, bg: COLORES.naranja, align: 'center', border: true },
      'C3': { bold: true, size: 11, color: COLORES.blanco, bg: COLORES.naranja, align: 'center', border: true },
    };

    resultado.duplicadas.forEach((d, r) => {
      const rowIdx = r + 4;
      const bgRow = r % 2 === 0 ? COLORES.blanco : COLORES.naranjaClaro;
      formatoDuplicadas[`A${rowIdx}`] = { bold: true, color: COLORES.naranja, bg: bgRow, border: true, align: 'center', size: 10 };
      formatoDuplicadas[`B${rowIdx}`] = { color: COLORES.negro, bg: bgRow, border: true, size: 10 };
      formatoDuplicadas[`C${rowIdx}`] = { color: COLORES.negro, bg: bgRow, border: true, size: 10 };
    });

    aplicarFormato(wsDuplicadas, formatoDuplicadas);

    XLSX.utils.book_append_sheet(workbook, wsDuplicadas, 'Duplicadas');

    /* ═══════════════════════════════════════════════════════════
       HOJA 5: RESUMEN
       ═══════════════════════════════════════════════════════════ */
    const totalElectivas = resultado.electivas.length + (resultado.electivas1998 || []).length;

    const wsResumenData = [
      ['RESUMEN DE CONVALIDACIÓN'],
      [],
      ['Concepto', 'Cantidad'],
      ['Materias convalidadas', resultado.convalidadas.length],
      ['Electivas asignadas', totalElectivas],
      ['Materias duplicadas', resultado.duplicadas.length],
      ['Materias no convalidables', resultado.noConvalidan.length],
      [],
      ['Total de materias procesadas', materias.length]
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(wsResumenData);
    wsResumen['!cols'] = [{ wch: 32 }, { wch: 14 }];
    wsResumen['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    ];

    const formatoResumen = {
      'A1': { bold: true, size: 14, color: COLORES.blanco, bg: COLORES.azulUMSA, align: 'center' },
      'A3': { bold: true, size: 11, color: COLORES.blanco, bg: COLORES.azulUMSA, align: 'center', border: true },
      'B3': { bold: true, size: 11, color: COLORES.blanco, bg: COLORES.azulUMSA, align: 'center', border: true },
      'A4': { bold: true, color: COLORES.verde, bg: COLORES.verdeClaro, border: true, size: 11 },
      'B4': { bold: true, color: COLORES.verde, bg: COLORES.verdeClaro, border: true, align: 'center', size: 11 },
      'A5': { bold: true, color: COLORES.morado, bg: COLORES.moradoClaro, border: true, size: 11 },
      'B5': { bold: true, color: COLORES.morado, bg: COLORES.moradoClaro, border: true, align: 'center', size: 11 },
      'A6': { bold: true, color: COLORES.naranja, bg: COLORES.naranjaClaro, border: true, size: 11 },
      'B6': { bold: true, color: COLORES.naranja, bg: COLORES.naranjaClaro, border: true, align: 'center', size: 11 },
      'A7': { bold: true, color: 'FFDC3545', bg: 'FFF8D7DA', border: true, size: 11 },
      'B7': { bold: true, color: 'FFDC3545', bg: 'FFF8D7DA', border: true, align: 'center', size: 11 },
      'A9': { bold: true, color: COLORES.azulUMSA, bg: COLORES.azulClaro, border: true, size: 11 },
      'B9': { bold: true, color: COLORES.azulUMSA, bg: COLORES.azulClaro, border: true, align: 'center', size: 11 },
    };

    aplicarFormato(wsResumen, formatoResumen);

    XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');

    /* ═══════════════════════════════════════════════════════════
       GUARDAR
       ═══════════════════════════════════════════════════════════ */
    const nombreArchivo = `Convalidacion_${est.cedula || 'estudiante'}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);

    console.log('✅ Excel generado:', nombreArchivo);

  } catch (error) {
    console.error('❌ Error al generar Excel:', error);
    alert("⚠️ Error al generar el Excel. Verifica la consola.");
  }
}

/* ═══════════════════════════════════════════════════════════════
   APLICAR FORMATO A LAS CELDAS
   ═══════════════════════════════════════════════════════════════ */
function aplicarFormato(worksheet, formato) {
  Object.entries(formato).forEach(([celda, estilos]) => {
    if (!worksheet[celda]) {
      worksheet[celda] = { t: 's', v: '' };
    }

    worksheet[celda].s = {
      font: {
        name: 'Calibri',
        sz: estilos.size || 11,
        bold: estilos.bold || false,
        italic: estilos.italic || false,
        color: { rgb: estilos.color || 'FF000000' },
      },
      fill: estilos.bg ? {
        fgColor: { rgb: estilos.bg },
        patternType: 'solid',
      } : undefined,
      alignment: {
        horizontal: estilos.align || 'left',
        vertical: 'center',
        wrapText: true,
      },
      border: estilos.border ? {
        top:    { style: 'thin', color: { rgb: 'FFDEE2E6' } },
        bottom: { style: 'thin', color: { rgb: 'FFDEE2E6' } },
        left:   { style: 'thin', color: { rgb: 'FFDEE2E6' } },
        right:  { style: 'thin', color: { rgb: 'FFDEE2E6' } },
      } : undefined,
    };
  });
}