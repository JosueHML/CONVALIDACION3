/* ═══════════════════════════════════════════════════════════════
   GENERADOR DE PDF — jsPDF + autoTable
   Con nuevo diseño de secciones
   ═══════════════════════════════════════════════════════════════ */

async function exportarPDF() {
  try {
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

    doc.setFillColor(240, 180, 41);
    doc.rect(0, 30, 210, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIVERSIDAD MAYOR DE SAN ANDRÉS', 105, 11, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Facultad de Ciencias Puras y Naturales — Carrera de Informática', 105, 17, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CONVALIDACIÓN DE MATERIAS 1998 → 2023 AJUSTADO', 105, 24, { align: 'center' });

    // ═══════════════════════════════════════════════════════
    // SECCIÓN 0 — DATOS DEL ESTUDIANTE (SIMPLIFICADO)
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

    // Cuadro de datos con fondo
    doc.setFillColor(244, 246, 249);
    doc.roundedRect(14, y - 4, 182, 24, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setTextColor(33, 37, 41);

    doc.setFont('helvetica', 'bold');
    doc.text('Nombre:', 18, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.text(est.nombre || '—', 40, y + 2);

    doc.setFont('helvetica', 'bold');
    doc.text('Cédula:', 18, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(est.cedula || '—', 40, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.text('RU:', 110, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(est.ru || '—', 125, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.text('Mención destino:', 18, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(est.mencion2023aj || '—', 55, y + 14);

    y += 30;

    // ═══════════════════════════════════════════════════════
    // SEPARAR MATERIAS POR ORIGEN
    // ═══════════════════════════════════════════════════════
    const convalidadas1998 = resultado.convalidadas.filter(m => m.planOrigen === '1998');
    const convalidadas2023 = resultado.convalidadas.filter(m => m.planOrigen === '2023' || m.planOrigen === '2023 AJUSTADO');

    // ═══════════════════════════════════════════════════════
    // SECCIÓN 1 — CONVALIDACIONES 1998 → 2023 (2 columnas)
    // ═══════════════════════════════════════════════════════
    if (convalidadas1998.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 58, 107);
      doc.text('CONVALIDACIONES 1998 → 2023', 14, y);

      y += 2;
      doc.setDrawColor(26, 58, 107);
      doc.line(14, y, 196, y);

      y += 5;

      const rows1998_2023 = convalidadas1998.map(m => {
        const origen = `${m.codigoOrigen}\n${m.nombreOrigen}\n(${m.planOrigen}, ${m.gestion})`;
        const intermedio = `${m.cod2023 || '—'}\n${m.nom2023 || '—'}`;
        return [origen, intermedio];
      });

      doc.autoTable({
        startY: y,
        head: [['PÉNSUM 1998', 'PÉNSUM 2023']],
        body: rows1998_2023,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          valign: 'middle',
          lineColor: [222, 226, 230],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [26, 58, 107],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 90, fillColor: [232, 244, 252] },
          1: { cellWidth: 92, fillColor: [240, 240, 240] },
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 12;
    }

    // ═══════════════════════════════════════════════════════
    // SECCIÓN 2 — CONVALIDACIONES 1998 → 2023 AJUSTADO (3 columnas)
    // ═══════════════════════════════════════════════════════
    if (convalidadas1998.length > 0) {
      if (y > 230) { doc.addPage(); y = 20; }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 58, 107);
      doc.text('CONVALIDACIONES 1998 → 2023 AJUSTADO', 14, y);

      y += 2;
      doc.setDrawColor(26, 58, 107);
      doc.line(14, y, 196, y);

      y += 5;

      const rows1998_2023aj = convalidadas1998.map(m => {
        const origen = `${m.codigoOrigen}\n${m.nombreOrigen}\n(${m.planOrigen}, ${m.gestion})`;
        let intermedio = '—';
        if (m.cod2023) {
          intermedio = `${m.cod2023}\n${m.nom2023}`;
        }
        const final = `${m.codigoDestino}\n${m.nombreDestino}\n[OK] Convalidada`;
        return [origen, intermedio, final];
      });

      doc.autoTable({
        startY: y,
        head: [['PÉNSUM 1998', 'PÉNSUM 2023', '2023 AJUSTADO']],
        body: rows1998_2023aj,
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
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 12;
    }

    // ═══════════════════════════════════════════════════════
    // SECCIÓN 3 — CONVALIDACIONES 2023 → 2023 AJUSTADO (2 columnas)
    // ═══════════════════════════════════════════════════════
    if (convalidadas2023.length > 0) {
      if (y > 230) { doc.addPage(); y = 20; }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(39, 174, 96);
      doc.text('CONVALIDACIONES 2023 → 2023 AJUSTADO', 14, y);

      y += 2;
      doc.setDrawColor(39, 174, 96);
      doc.line(14, y, 196, y);

      y += 5;

      const rows2023 = convalidadas2023.map(m => {
        const origen = `${m.codigoOrigen}\n${m.nombreOrigen}\n(${m.planOrigen}, ${m.gestion})`;
        const final = `${m.codigoDestino}\n${m.nombreDestino}\n[OK] Convalidada`;
        return [origen, final];
      });

      doc.autoTable({
        startY: y,
        head: [['PÉNSUM 2023', '2023 AJUSTADO']],
        body: rows2023,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          valign: 'middle',
          lineColor: [222, 226, 230],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [39, 174, 96],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 90, fillColor: [232, 248, 239] },
          1: { cellWidth: 92, fillColor: [212, 237, 218] },
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 12;
    }

    // ═══════════════════════════════════════════════════════
    // SECCIÓN 4 — ELECTIVAS ASIGNADAS
    // ═══════════════════════════════════════════════════════
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

    if (todasElectivas.length > 0) {
      if (y > 230) { doc.addPage(); y = 20; }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(111, 66, 193);
      doc.text('ELECTIVAS ASIGNADAS', 14, y);

      y += 2;
      doc.setDrawColor(111, 66, 193);
      doc.line(14, y, 196, y);

      y += 5;

      doc.autoTable({
        startY: y,
        head: [['Código', 'Nombre', 'Origen', 'Regla']],
        body: todasElectivas.map(e => [
          e.codigo, e.nombre, e.origen, e.regla || '64h → 32h'
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
          0: { cellWidth: 22, fontStyle: 'bold', textColor: [111, 66, 193] },
          1: { cellWidth: 85 },
          2: { cellWidth: 50 },
          3: { cellWidth: 25, halign: 'center' },
        },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 12;
    }

    // ═══════════════════════════════════════════════════════
    // SECCIÓN 5 — MATERIAS DUPLICADAS
    // ═══════════════════════════════════════════════════════
    if (resultado.duplicadas.length > 0) {
      if (y > 230) { doc.addPage(); y = 20; }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(253, 126, 20);
      doc.text('MATERIAS DUPLICADAS', 14, y);

      y += 2;
      doc.setDrawColor(253, 126, 20);
      doc.line(14, y, 196, y);

      y += 5;

      doc.autoTable({
        startY: y,
        head: [['Código', 'Nombre', 'Motivo']],
        body: resultado.duplicadas.map(d => [d.codigo, d.nombre, d.motivo]),
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
          0: { cellWidth: 25, fontStyle: 'bold', textColor: [253, 126, 20] },
          1: { cellWidth: 100 },
          2: { cellWidth: 57 },
        },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 12;
    }

    // ═══════════════════════════════════════════════════════
    // SECCIÓN 6 — RESUMEN
    // ═══════════════════════════════════════════════════════
    if (y > 240) { doc.addPage(); y = 20; }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 107);
    doc.text('RESUMEN', 14, y);

    y += 2;
    doc.setDrawColor(26, 58, 107);
    doc.line(14, y, 196, y);

    y += 8;

    const totalElectivas = todasElectivas.length;

    doc.autoTable({
      startY: y,
      body: [
        ['Materias convalidadas', resultado.convalidadas.length],
        ['Electivas asignadas', totalElectivas],
        ['Materias duplicadas', resultado.duplicadas.length],
        ['Materias no convalidables', resultado.noConvalidan.length],
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80, textColor: [26, 58, 107] },
        1: { halign: 'center', fontStyle: 'bold', cellWidth: 30, fontSize: 12 },
      },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 20;

    // ═══════════════════════════════════════════════════════
    // FOOTER — Fecha y firma
    // ═══════════════════════════════════════════════════════
    if (y > 250) { doc.addPage(); y = 20; }

    const fecha = new Date().toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(108, 117, 125);

    doc.text(`La Paz, ${fecha}`, 14, y);
    y += 25;

    doc.setDrawColor(33, 37, 41);
    doc.setLineWidth(0.3);
    doc.line(70, y, 140, y);
    y += 4;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Dirección de Carrera', 105, y, { align: 'center' });

    // Footer final
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
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
    alert("⚠️ Error al generar el PDF. Verifica la consola (F12).");
  }
}