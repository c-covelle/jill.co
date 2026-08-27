import jsPDF from 'jspdf';

export function generateMistakesPdf(questions, candidateName = "Crissian Jill") {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 25, 40);
  doc.text("PROJECT JILL", 20, yPos);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(candidateName, pageWidth - 20, yPos, { align: 'right' });
  doc.text(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), pageWidth - 20, yPos + 5, { align: 'right' });

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(190, 40, 40);
  doc.text("BOSS MODE: ERROR NOTEBOOK", 20, yPos);

  yPos += 7;
  doc.setFontSize(12);
  doc.setTextColor(20, 25, 40);
  doc.text("PERSONAL MISTAKES LOG & REFLECTION GUIDE", 20, yPos);

  yPos += 5;
  doc.setDrawColor(220, 220, 230);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  questions.forEach((item, index) => {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    // Question Number Badge
    doc.setFillColor(220, 53, 69);
    doc.circle(24, yPos - 1.5, 3.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(String(index + 1), 24, yPos - 0.5, { align: 'center' });

    // Question Text
    doc.setTextColor(20, 25, 40);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    const splitQuestion = doc.splitTextToSize(item.question, pageWidth - 55);
    doc.text(splitQuestion, 32, yPos);
    yPos += splitQuestion.length * 4.5 + 2;

    // Correct Answer Box
    doc.setFillColor(240, 248, 245);
    doc.roundedRect(32, yPos, pageWidth - 52, 16, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 140, 80);
    doc.text(`CORRECT ANSWER: ${item.choices[item.correctAnswer]}`, 35, yPos + 5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    const splitExp = doc.splitTextToSize(item.explanation, pageWidth - 60);
    doc.text(splitExp, 35, yPos + 9.5);
    yPos += 19;

    // Memory Tip Box
    if (item.memoryTip) {
      doc.setFillColor(254, 249, 235);
      doc.roundedRect(32, yPos, pageWidth - 52, 8, 2, 2, 'F');
      doc.setTextColor(180, 110, 10);
      doc.setFont("helvetica", "bold");
      doc.text("💡 TIP: " + item.memoryTip.slice(0, 85) + "...", 35, yPos + 5.5);
      yPos += 11;
    }

    // Student Lined Reflection Space
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150);
    doc.text("MY REFLECTION & MEMORY ANCHOR:", 32, yPos);
    yPos += 3;
    doc.setDrawColor(230, 230, 235);
    doc.line(32, yPos, pageWidth - 20, yPos);
    yPos += 12;
  });

  doc.save(`Project_Jill_Error_Notebook_${Date.now()}.pdf`);
}