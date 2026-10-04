/* ═══════════════════════════════════════════════════════════════
   GENERADOR DE PDF — jsPDF + autoTable
   ═══════════════════════════════════════════════════════════════ */

async function exportarPDF() {
  try {
    // Verificar que jsPDF esté cargado
    if (typeof window.jspdf === 'undefined') {
      alert("⚠️ Error: jsPDF no está cargado. Verifica tu conexión a internet.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

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

    // ═══════════════════════════════════════════════════════
    // HEADER — Universidad
    // ═══════════════════════════════════════════════════════
    doc.setFillColor(26, 58, 107);
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIVERSIDAD MAYOR DE SAN ANDRÉS', 105, 10, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Facultad de Ciencias Puras y Naturales — Carrera de Informática', 105, 16, { align: 'center' });
    doc.text('Sistema de Convalidaciones 1998 → 2023 Ajustado', 105, 21, { align: 'center' });

    // ═══════════════════════════════════════════════════════
    // DATOS DEL ESTUDIANTE
    // ═══════════════════════════════════════════════════════
    let y = 42;
    doc.setTextColor(26, 58, 107);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL ESTUDIANTE', 14, y);

    y += 2;
    doc.setDrawColor(26, 58, 107);
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y);

    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(33, 37, 41);
    doc.setFont('helvetica', 'bold');
    doc.text('Nombre:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(est.nombre || '—', 40, y);

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Cédula:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(est.cedula || '—', 40, y);

    doc.setFont('helvetica', 'bold');
    doc.text('RU:', 110, y);
    doc.setFont('helvetica', 'normal');
    doc.text(est.ru || '—', 125, y);

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Mención 1998:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(est.mencion1998 || '—', 48, y);

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Mención 2023 Ajustado:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(est.mencion2023aj || '—', 62, y);

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('¿Aprobó Cálculo IV?:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(est.aproboCalculoIV ? 'SÍ' : 'NO', 55, y);

    y += 10;

    // ═══════════════════════════════════════════════════════
    // TABLA DE CONVALIDACIONES (3 columnas)
    // ═══════════════════════════════════════════════════════
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 107);
    doc.text('CONVALIDACIONES', 14, y);

    y += 2;
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y);

    y += 5;

    // Construir filas: PÉNSUM 1998 | PÉNSUM 2023 | 2023 AJUSTADO
    const rows = resultado.convalidadas.map(m => {
      // Columna 1: Origen
      const origen = `${m.codigoOrigen}\n${m.nombreOrigen}\n(${m.planOrigen}, ${m.gestion})`;

      // Columna 2: Intermedio (si vino de 1998, mostrar el código del 2023)
      let intermedio = '—';
      if (m.planOrigen === "1998" && m.cod2023) {
        intermedio = `${m.cod2023}\n${m.nom2023}`;
      } else if (m.planOrigen === "2023") {
        intermedio = `${m.codigoOrigen}\n${m.nombreOrigen}`;
      } else if (m.planOrigen === "2023 AJUSTADO") {
        intermedio = `${m.codigoOrigen}\n${m.nombreOrigen}`;
      }

      // Columna 3: Final 2023 Ajustado
      const final = `${m.codigoDestino}\n${m.nombreDestino}\n✅ Convalidada`;

      return [origen, intermedio, final];
    });

    doc.autoTable({
      startY: y,
      head: [['PÉNSUM 1998', 'PÉNSUM 2023', '2023 AJUSTADO']],
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        valign: 'middle',
        lineColor: [222, 226, 230],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [26, 58, 107],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 60, fillColor: [232, 244, 252] },
        1: { cellWidth: 60, fillColor: [240, 240, 240] },
        2: { cellWidth: 62, fillColor: [212, 237, 218] },
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 10;

    // ═══════════════════════════════════════════════════════
    // ELECTIVAS ASIGNADAS
    // ═══════════════════════════════════════════════════════
    const todasElectivas = [
      ...resultado.electivas,
      ...(resultado.electivas1998 || []).map(e => ({
        codigo: e.codigoOrigen,
        nombre: e.nombreOrigen + ' (electiva libre 1998)',
        origen: e.codigoOrigen,
        regla: '1998'
      }))
    ];

    if (todasElectivas.length > 0) {
      // Verificar si hay espacio, sino nueva página
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(111, 66, 193);
      doc.text('🎁 ELECTIVAS ASIGNADAS', 14, y);

      y += 2;
      doc.setDrawColor(111, 66, 193);
      doc.line(14, y, 196, y);

      y += 5;

      doc.autoTable({
        startY: y,
        head: [['Código', 'Nombre', 'Origen', 'Regla']],
        body: todasElectivas.map(e => [
          e.codigo,
          e.nombre,
          e.origen,
          e.regla || '64h → 32h'
        ]),
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          lineColor: [222, 226, 230],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [111, 66, 193],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 25, fontStyle: 'bold', textColor: [111, 66, 193] },
          1: { cellWidth: 90 },
          2: { cellWidth: 35, halign: 'center' },
          3: { cellWidth: 32, halign: 'center' },
        },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 10;
    }

    // ═══════════════════════════════════════════════════════
    // DUPLICADAS
    // ═══════════════════════════════════════════════════════
    if (resultado.duplicadas.length > 0) {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(253, 126, 20);
      doc.text('⚠️ MATERIAS DUPLICADAS', 14, y);

      y += 2;
      doc.setDrawColor(253, 126, 20);
      doc.line(14, y, 196, y);

      y += 5;

      doc.autoTable({
        startY: y,
        head: [['Código', 'Nombre', 'Motivo']],
        body: resultado.duplicadas.map(d => [
          d.codigo, d.nombre, d.motivo
        ]),
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          lineColor: [222, 226, 230],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [253, 126, 20],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 30, fontStyle: 'bold', textColor: [253, 126, 20] },
          1: { cellWidth: 100 },
          2: { cellWidth: 52 },
        },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 10;
    }

    // ═══════════════════════════════════════════════════════
    // RESUMEN
    // ═══════════════════════════════════════════════════════
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 107);
    doc.text('RESUMEN', 14, y);

    y += 2;
    doc.setDrawColor(26, 58, 107);
    doc.line(14, y, 196, y);

    y += 8;

    const totalElectivas = resultado.electivas.length + (resultado.electivas1998 || []).length;

    doc.autoTable({
      startY: y,
      body: [
        ['Materias convalidadas', resultado.convalidadas.length],
        ['Electivas asignadas', totalElectivas],
        ['Materias duplicadas', resultado.duplicadas.length],
        ['Materias no convalidables', resultado.noConvalidan.length],
      ],
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80, textColor: [26, 58, 107] },
        1: { halign: 'center', fontStyle: 'bold', cellWidth: 30 },
      },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 15;

    // ═══════════════════════════════════════════════════════
    // FOOTER — Fecha y firma
    // ═══════════════════════════════════════════════════════
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    const fecha = new Date().toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(108, 117, 125);

    doc.text(`La Paz, ${fecha}`, 14, y);
    y += 20;

    doc.setDrawColor(33, 37, 41);
    doc.line(70, y, 140, y);
    y += 4;
    doc.text('Dirección de Carrera', 105, y, { align: 'center' });

    // Footer final
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Documento generado automáticamente por el Sistema de Convalidaciones v3.0 — UMSA Informática',
      105,
      290,
      { align: 'center' }
    );

    // ═══════════════════════════════════════════════════════
    // GUARDAR
    // ═══════════════════════════════════════════════════════
    const nombreArchivo = `Convalidacion_${est.cedula || 'estudiante'}.pdf`;
    doc.save(nombreArchivo);

    console.log('✅ PDF generado:', nombreArchivo);

  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    alert("⚠️ Error al generar el PDF. Verifica la consola.");
  }
}