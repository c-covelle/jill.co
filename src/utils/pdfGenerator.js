import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exports a formatted Error Notebook PDF containing all recorded weak spots,
 * correct answers, memory tips, and key takeaways.
 */
export function exportErrorNotebookPDF(vaultItems, candidateName = "Crissian Jill") {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Banner
  doc.setFillColor(10, 14, 26); // Deep slate background
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold accent rule
  doc.setFillColor(229, 184, 66);
  doc.rect(0, 42, pageWidth, 1.5, 'F');

  // Brand Titles
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(229, 184, 66);
  doc.setFontSize(18);
  doc.text('PROJECT JILL — ERROR NOTEBOOK', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 210, 230);
  doc.setFontSize(9);
  doc.text('LICENSURE EXAMINATION FOR TEACHERS (LET) PREPARATION', 14, 25);

  // Candidate Info Block
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Candidate: ${candidateName}`, 14, 34);
  doc.text(`Recorded Weak Spots: ${vaultItems.length} Items`, 95, 34);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, 155, 34);

  let currentY = 52;

  if (vaultItems.length === 0) {
    doc.setTextColor(100, 110, 130);
    doc.setFontSize(12);
    doc.text('No mistakes recorded yet! Clean slate.', pageWidth / 2, 80, { align: 'center' });
    doc.save(`Project_Jill_Error_Notebook_${new Date().toISOString().slice(0, 10)}.pdf`);
    return;
  }

  // Iterate over each recorded mistake
  vaultItems.forEach((item, index) => {
    // Check if new page is needed (leaves margin at bottom)
    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = 20;
    }

    const itemNumber = index + 1;
    const correctOption = item.options?.find(o => o.id === item.correctAnswer)?.text || item.correctAnswer;

    // Card Container
    doc.setFillColor(248, 249, 252);
    doc.setDrawColor(220, 226, 238);
    doc.roundedRect(14, currentY, pageWidth - 28, 45, 3, 3, 'FD');

    // Item Header Tag
    doc.setFillColor(22, 43, 104);
    doc.roundedRect(18, currentY + 4, 65, 6, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(`ITEM ${itemNumber} • ${item.category || 'GENERAL'}`, 21, currentY + 8);

    // Question
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 25, 40);
    const splitQuestion = doc.splitTextToSize(`Q: ${item.question}`, pageWidth - 42);
    doc.text(splitQuestion, 18, currentY + 16);

    // Correct Answer
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(16, 120, 60);
    doc.text(`Correct: [Choice ${item.correctAnswer}] ${correctOption}`, 18, currentY + 26);

    // Memory Tip / Key Takeaway Box
    if (item.memoryTip || item.rationale) {
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(18, currentY + 29, pageWidth - 36, 12, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(50, 65, 110);
      const tipText = item.memoryTip ? `Tip: ${item.memoryTip}` : `Rationale: ${item.rationale}`;
      const splitTip = doc.splitTextToSize(tipText, pageWidth - 42);
      doc.text(splitTip, 21, currentY + 35);
    }

    currentY += 50;
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 150, 165);
    doc.text(`Project Jill © 2026 • LPT Licensure Candidate Error Notebook • Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  doc.save(`Project_Jill_Error_Notebook_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Exports an Official Session Performance Summary Table
 */
export function exportSessionTranscriptPDF(historyItems, candidateName = "Crissian Jill") {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(10, 14, 26);
  doc.rect(0, 0, pageWidth, 38, 'F');

  doc.setFillColor(229, 184, 66);
  doc.rect(0, 38, pageWidth, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(229, 184, 66);
  doc.setFontSize(16);
  doc.text('PROJECT JILL — DRILL TRANSCRIPT', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 225, 240);
  doc.setFontSize(8.5);
  doc.text(`Official Drill Performance Record • Candidate: ${candidateName}`, 14, 24);
  doc.text(`Date of Export: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 14, 30);

  // AutoTable Table
  const tableData = historyItems.map((item, index) => [
    index + 1,
    item.title,
    `${item.score} / ${item.total}`,
    `${item.percentage}%`,
    `${Math.round((item.durationSecs || 60) / 60)} mins`,
    item.rating || (item.percentage >= 80 ? 'Mastered' : 'Review'),
    item.date || 'Recent'
  ]);

  autoTable(doc, {
    startY: 46,
    head: [['#', 'Drill Title', 'Score', 'Accuracy', 'Time', 'Status', 'Date']],
    body: tableData.length > 0 ? tableData : [['-', 'No drill sessions recorded', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [18, 24, 41],
      textColor: [229, 184, 66],
      fontSize: 8.5,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  doc.save(`Project_Jill_Transcript_${new Date().toISOString().slice(0, 10)}.pdf`);
}