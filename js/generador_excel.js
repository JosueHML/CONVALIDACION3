/* ═══════════════════════════════════════════════════════════════
   GENERADOR DE EXCEL — SheetJS
   ═══════════════════════════════════════════════════════════════ */

function exportarExcel() {
  try {
    if (typeof XLSX === 'undefined') {
      alert("⚠️ Error: SheetJS no está cargado.");
      return;
    }

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

    /* ═══════════════════════════════════════════════════════
       HOJA 1: DATOS DEL ESTUDIANTE
       ═══════════════════════════════════════════════════════ */
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

    aplicarFormato(wsDatos, {
      'A1': { bold: true, size: 14, color: 'FF1A3A6B', align: 'center' },
      'A2': { bold: true, size: 12, color: 'FF1A3A6B', align: 'center' },
      'A3': { size: 10, italic: true, align: 'center' },
      'A5': { bold: true, size: 12, color: 'FFFFFFFF', bg: 'FF1A3A6B', align: 'center' },
      'A6': { bold: true, bg: 'FFF4F6F9' },
      'A7': { bold: true, bg: 'FFF4F6F9' },
      'A8': { bold: true, bg: 'FFF4F6F9' },
      'A9': { bold: true, bg: 'FFF4F6F9' },
      'A10': { bold: true, bg: 'FFF4F6F9' },
      'A11': { bold: true, bg: 'FFF4F6F9' },
      'A12': { bold: true, bg: 'FFF4F6F9' },
    });

    XLSX.utils.book_append_sheet(workbook, wsDatos, 'Datos');

    /* ═══════════════════════════════════════════════════════
       HOJA 2: CONVALIDACIONES
       ═══════════════════════════════════════════════════════ */
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
      'CONVALIDADA'
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

    wsConv['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];

    const formatoConv = {
      'A1': { bold: true, size: 14, color: 'FFFFFFFF', bg: 'FF1A3A6B', align: 'center' },
    };

    for (let c = 0; c < headersConv.length; c++) {
      const col = String.fromCharCode(65 + c);
      formatoConv[`${col}3`] = {
        bold: true, size: 11, color: 'FFFFFFFF', bg: 'FF1A3A6B',
        align: 'center', border: true
      };
    }

    for (let r = 0; r < filasConv.length; r++) {
      const rowIdx = r + 4;
      const bgRow = r % 2 === 0 ? 'FFFFFFFF' : 'FFF4F6F9';

      for (let c = 0; c < 8; c++) {
        const col = String.fromCharCode(65 + c);
        const cellRef = `${col}${rowIdx}`;

        let formato = {
          size: 10,
          bg: bgRow,
          border: true,
          align: (c === 0 || c === 2 || c === 3 || c === 5 || c === 7) ? 'center' : 'left',
        };

        if (c === 0) {
          formato.bold = true;
          formato.color = 'FF1A3A6B';
          formato.bg = 'FFE8F4FC';
        }
        if (c === 3) {
          formato.bold = true;
          formato.color = 'FF6C757D';
        }
        if (c === 5) {
          formato.bold = true;
          formato.color = 'FF28A745';
          formato.bg = 'FFD4EDDA';
        }
        if (c === 7) {
          formato.bold = true;
          formato.color = 'FF28A745';
          formato.bg = 'FFD4EDDA';
          formato.align = 'center';
        }

        formatoConv[cellRef] = formato;
      }
    }

    aplicarFormato(wsConv, formatoConv);
    XLSX.utils.book_append_sheet(workbook, wsConv, 'Convalidaciones');

    /* ═══════════════════════════════════════════════════════
       HOJA 3: ELECTIVAS
       ═══════════════════════════════════════════════════════ */
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
      { wch: 14 }, { wch: 55 }, { wch: 50 }, { wch: 16 }
    ];
    wsElectivas['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

    const formatoElectivas = {
      'A1': { bold: true, size: 14, color: 'FFFFFFFF', bg: 'FF6F42C1', align: 'center' },
      'A3': { bold: true, size: 11, color: 'FFFFFFFF', bg: 'FF6F42C1', align: 'center', border: true },
      'B3': { bold: true, size: 11, color: 'FFFFFFFF', bg: 'FF6F42C1', align: 'center', border: true },
      'C3': { bold: true, size: 11, color: 'FFFFFFFF', bg: 'FF6F42C1', align: 'center', border: true },
      'D3': { bold: true, size: 11, color: 'FFFFFFFF', bg: 'FF6F42C1', align: 'center', border: true },
    };

    todasElectivas.forEach((e, r) => {
      const rowIdx = r + 4;
      const bgRow = r % 2 === 0 ? 'FFFFFFFF' : 'FFF9F5FF';
      formatoElectivas[`A${rowIdx}`] = { bold: true, color: 'FF6F42C1', bg: bgRow, border: true, align: 'center', size: 10 };
      formatoElectivas[`B${rowIdx}`] = { bg: bgRow, border: true, size: 10 };
      formatoElectivas[`C${rowIdx}`] = { bg: bgRow, border: true, size: 10 };
      formatoElectivas[`D${rowIdx}`] = { bg: bgRow, border: true, align: 'center', size: 10 };
    });

    aplicarFormato(wsElectivas, formatoElectivas);
    XLSX.utils.book_append_sheet(workbook, wsElectivas, 'Electivas');

    /* ═══════════════════════════════════════════════════════
       HOJA 4: DUPLICADAS
       ═══════════════════════════════════════════════════════ */
    const wsDuplicadasData = [
      ['MATERIAS DUPLICADAS (no se cuentan 2 veces)'],
      [],
      ['Código', 'Nombre', 'Motivo'],
      ...resultado.duplicadas.map(d => [d.codigo, d.nombre, d.motivo])
    ];

    if (resultado.duplicadas.length === 0) {
      wsDuplicadasData.push(['—', 'No hay materias duplicadas', '—']);
    }

    const wsDuplicadas = XLSX.utils.aoa_to_sheet(wsDuplicadasData);
    wsDuplicadas['!cols'] = [{ wch: 14 }, { wch: 50 }, { wch: 50 }];
    wsDuplicadas['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];

    const formatoDuplicadas = {
      'A1': { bold: true, size: 14, color: 'FFFFFFFF', bg: 'FFFD7E14', align: 'center' },
      'A3': { bold: true, size: 11, color: 'FFFFFFFF', bg: 'FFFD7E14', align: 'center', border: true },
      'B3': { bold: true, size: 11, color: 'FFFFFFFF', bg: 'FFFD7E14', align: 'center', border: true },
      'C3': { bold: true, size: 11, color: 'FFFFFFFF', bg: 'FFFD7E14', align: 'center', border: true },
    };

    resultado.duplicadas.forEach((d, r) => {
      const rowIdx = r + 4;
      const bgRow = r % 2 === 0 ? 'FFFFFFFF' : 'FFFFFBF0';
      formatoDuplicadas[`A${rowIdx}`] = { bold: true, color: 'FFFD7E14', bg: bgRow, border: true, align: 'center', size: 10 };
      formatoDuplicadas[`B${rowIdx}`] = { bg: bgRow, border: true, size: 10 };
      formatoDuplicadas[`C${rowIdx}`] = { bg: bgRow, border: true, size: 10 };
    });

    aplicarFormato(wsDuplicadas, formatoDuplicadas);
    XLSX.utils.book_append_sheet(workbook, wsDuplicadas, 'Duplicadas');

    /* ═══════════════════════════════════════════════════════
       HOJA 5: RESUMEN
       ═══════════════════════════════════════════════════════ */
    const totalElectivas = todasElectivas.length;

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
    wsResumen['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

    const formatoResumen = {
      'A1': { bold: true, size: 14, color: 'FFFFFFFF', bg: 'FF1A3A6B', align: 'center' },
      'A3': { bold: true, size: 11, color: 'FFFFFFFF', bg: 'FF1A3A6B', align: 'center', border: true },
      'B3': { bold: true, size: 11, color: 'FFFFFFFF', bg: 'FF1A3A6B', align: 'center', border: true },
      'A4': { bold: true, color: 'FF28A745', bg: 'FFD4EDDA', border: true, size: 11 },
      'B4': { bold: true, color: 'FF28A745', bg: 'FFD4EDDA', border: true, align: 'center', size: 11 },
      'A5': { bold: true, color: 'FF6F42C1', bg: 'FFE9D8FD', border: true, size: 11 },
      'B5': { bold: true, color: 'FF6F42C1', bg: 'FFE9D8FD', border: true, align: 'center', size: 11 },
      'A6': { bold: true, color: 'FFFD7E14', bg: 'FFFFF3CD', border: true, size: 11 },
      'B6': { bold: true, color: 'FFFD7E14', bg: 'FFFFF3CD', border: true, align: 'center', size: 11 },
      'A7': { bold: true, color: 'FFDC3545', bg: 'FFF8D7DA', border: true, size: 11 },
      'B7': { bold: true, color: 'FFDC3545', bg: 'FFF8D7DA', border: true, align: 'center', size: 11 },
      'A9': { bold: true, color: 'FF1A3A6B', bg: 'FFE8F4FC', border: true, size: 11 },
      'B9': { bold: true, color: 'FF1A3A6B', bg: 'FFE8F4FC', border: true, align: 'center', size: 11 },
    };

    aplicarFormato(wsResumen, formatoResumen);
    XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');

    /* ═══════════════════════════════════════════════════════
       GUARDAR
       ═══════════════════════════════════════════════════════ */
    const nombreArchivo = `Convalidacion_${est.cedula || 'estudiante'}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);

    console.log('✅ Excel generado:', nombreArchivo);

  } catch (error) {
    console.error('❌ Error al generar Excel:', error);
    alert("⚠️ Error al generar el Excel. Verifica la consola (F12).");
  }
}

/* ═══════════════════════════════════════════════════════════════
   APLICAR FORMATO A CELDAS
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