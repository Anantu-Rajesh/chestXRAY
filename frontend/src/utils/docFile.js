import { jsPDF } from "jspdf";

export const handleDownload = async (record) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const black     = [0, 0, 0]
    const darkGray  = [60, 60, 60]
    const gray      = [100, 100, 100]
    const lightGray = [180, 180, 180]
    const divider   = [200, 200, 200]
    const setColor = (rgb) => doc.setTextColor(...rgb)
    const setFill  = (rgb) => doc.setFillColor(...rgb)
    const setDraw  = (rgb) => doc.setDrawColor(...rgb)
   
    // ── HEADER ───────────────────────────────────────────
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    setColor(black)
    doc.text("PneuScan", 10, 15)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    setColor(darkGray)
    doc.text("Chest X-Ray Analysis Report", 10, 23)
    const reportId = record._id
      ? `Report ID: ${record._id.slice(-8).toUpperCase()}`
      : "Report ID: —"
    doc.setFontSize(9)
    setColor(gray)
    doc.text(reportId, pageWidth - 10, 15, { align: "right" })
    setDraw(divider)
    doc.setLineWidth(0.4)
    doc.line(10, 28, pageWidth - 10, 28)

    // ── ANALYSIS SUMMARY TABLE ───────────────────────────
    let y = 38
    doc.setFontSize(10)
    setColor(black)
    doc.setFont("helvetica", "bold")
    doc.text("ANALYSIS SUMMARY", 10, y)
    y += 6
    const colW = (pageWidth - 20) / 3
    const tableH = 18
    // header row background
    setFill([230, 230, 230])
    doc.rect(10, y, pageWidth - 20, 8, "F")
    // column headers
    doc.setFontSize(8)
    setColor(black)
    doc.setFont("helvetica", "bold")
    doc.text("Prediction", 10 + colW * 0 + colW / 2, y + 5.5, { align: "center" })
    doc.text("Confidence", 10 + colW * 1 + colW / 2, y + 5.5, { align: "center" })
    doc.text("Analysis Time (UTC)", 10 + colW * 2 + colW / 2, y + 5.5, { align: "center" })
    y += 8
    // content row background
    setFill([248, 248, 248])
    doc.rect(10, y, pageWidth - 20, tableH, "F")
    // table borders
    setDraw(divider)
    doc.setLineWidth(0.3)
    doc.rect(10, y - 8, pageWidth - 20, tableH + 8)
    // vertical dividers
    doc.line(10 + colW,     y - 8, 10 + colW,     y + tableH)
    doc.line(10 + colW * 2, y - 8, 10 + colW * 2, y + tableH)
    const isPneumonia = record.label === "Pneumonia"
    const confidencePct = Math.round(record.probability * 100)
    const formattedDate = record.created_at
      ? new Date(record.created_at).toLocaleString("en-IN", {
          year: "numeric", month: "short", day: "numeric",
          hour: "2-digit", minute: "2-digit"
        })
      : "Unknown"
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    setColor(isPneumonia ? [180, 40, 40] : [30, 120, 60])
    doc.text(record.label, 10 + colW * 0 + colW / 2, y + 11, { align: "center" })
    setColor(darkGray)
    doc.text(`${confidencePct}%`, 10 + colW * 1 + colW / 2, y + 11, { align: "center" })
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    setColor(darkGray)
    // split date into two lines if long
    const dateParts = formattedDate.split(",")
    if (dateParts.length >= 2) {
      doc.text(dateParts[0].trim(), 10 + colW * 2 + colW / 2, y + 8, { align: "center" })
      doc.text(dateParts.slice(1).join(",").trim(), 10 + colW * 2 + colW / 2, y + 14, { align: "center" })
    } else {
      doc.text(formattedDate, 10 + colW * 2 + colW / 2, y + 11, { align: "center" })
    }

    // ── IMAGES SECTION ───────────────────────────────────
    y += tableH + 10
    setDraw(divider)
    doc.setLineWidth(0.3)
    doc.line(10, y, pageWidth - 10, y)
    y += 8
    doc.setFontSize(10)
    setColor(black)
    doc.setFont("helvetica", "bold")
    doc.text("X-RAY IMAGING", 10, y)
    y += 6
    const imgWidth  = 85
    const imgHeight = 75
    setDraw(lightGray)
    doc.setLineWidth(0.3)
    doc.rect(10, y, imgWidth, imgHeight + 8)
    doc.rect(pageWidth / 2 + 2, y, imgWidth, imgHeight + 8)
    doc.setFontSize(7.5)
    setColor(gray)
    doc.setFont("helvetica", "normal")
    doc.text("Original X-Ray", 10 + imgWidth / 2, y + 5, { align: "center" })
    doc.text("Grad-CAM Overlay", pageWidth / 2 + 2 + imgWidth / 2, y + 5, { align: "center" })
    if (record.original_image) {
      try {
        doc.addImage(record.original_image, "JPEG", 11, y + 7, imgWidth - 2, imgHeight - 2)
      } catch (e) {
        doc.setFontSize(7)
        setColor(lightGray)
        doc.text("Image unavailable", 10 + imgWidth / 2, y + imgHeight / 2, { align: "center" })
      }
    } else {
      doc.setFontSize(7)
      setColor(lightGray)
      doc.text("Original not stored", 10 + imgWidth / 2, y + imgHeight / 2, { align: "center" })
    }
    if (record.heatmap) {
      try {
        doc.addImage(record.heatmap, "JPEG", pageWidth / 2 + 3, y + 7, imgWidth - 2, imgHeight - 2)
      } catch (e) {
        doc.setFontSize(7)
        setColor(lightGray)
        doc.text("Heatmap unavailable", pageWidth / 2 + 2 + imgWidth / 2, y + imgHeight / 2, { align: "center" })
      }
    }

    // ── INTERPRETATION SECTION ───────────────────────────
    y += imgHeight + 14
    setDraw(divider)
    doc.setLineWidth(0.3)
    doc.line(10, y, pageWidth - 10, y)
    y += 8
    doc.setFontSize(10)
    setColor(black)
    doc.setFont("helvetica", "bold")
    doc.text("INTERPRETATION", 10, y)
    y += 7
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    let interpretationText = ""
    if (confidencePct >= 85) {
      // always pneumonia territory
      interpretationText = `High confidence (${confidencePct}%): Strong indicators of pneumonia detected. Immediate clinical evaluation is strongly recommended.`
    } else if (confidencePct >= 60) {
      // borderline — could go either way
      interpretationText = `Moderate confidence (${confidencePct}%): Some patterns suggestive of pneumonia detected but with moderate certainty. Clinical correlation and further evaluation is recommended.`
    } else {
      // low score = normal territory
      interpretationText = `Low likelihood of pneumonia (${confidencePct}%): No significant pneumonia patterns detected. Routine follow-up as advised by your physician.`
    }
    const splitInterpretation = doc.splitTextToSize(interpretationText, pageWidth - 20)
    setColor(darkGray)
    doc.text(splitInterpretation, 10, y)

    // ── HEATMAP NOTE ─────────────────────────────────────
    y += splitInterpretation.length * 5.5 + 6
    setDraw(divider)
    doc.setLineWidth(0.3)
    doc.line(10, y, pageWidth - 10, y)
    y += 8
    doc.setFontSize(10)
    setColor(black)
    doc.setFont("helvetica", "bold")
    doc.text("ABOUT THE GRAD-CAM OVERLAY", 10, y)
    y += 7
    // split into two parts — normal text and bold warning
    const heatmapPart1 = `The Grad-CAM overlay highlights regions the model focused on when making its prediction. Warmer colors (red/yellow) indicate higher attention while cooler colors (blue) indicate lower attention.`
    const heatmapPart2 = `Important limitation:`
    const heatmapPart3 = ` In some cases, particularly for normal X-rays, the model may assign attention to regions outside the chest area. This is a known characteristic of the visualization layer and does not indicate a flaw in the model's classification ability.`
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    setColor(darkGray)
    const splitPart1 = doc.splitTextToSize(heatmapPart1, pageWidth - 20)
    doc.text(splitPart1, 10, y)
    y += splitPart1.length * 5.5 + 3
    doc.setFont("helvetica", "bold")
    setColor(black)
    doc.text(heatmapPart2, 10, y)
    const boldWidth = doc.getTextWidth(heatmapPart2)
    doc.setFont("helvetica", "normal")
    setColor(darkGray)
    const splitPart3 = doc.splitTextToSize(heatmapPart3, pageWidth - 20 - boldWidth)
    doc.text(splitPart3, 10 + boldWidth, y)

    // ── FOOTER ───────────────────────────────────────────
    const footerY = pageHeight - 20
    setDraw(divider)
    doc.setLineWidth(0.4)
    doc.line(10, footerY - 4, pageWidth - 10, footerY - 4)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    setColor(black)
    doc.text("Disclaimer", 10, footerY + 3)
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "normal")
    setColor(darkGray)
    const disclaimer1 = "This report is generated by an AI-based screening system and "
    const disclaimer2 = "should NOT be used as a substitute for professional medical diagnosis."
    const disclaimer3 = " Consultation with a qualified healthcare professional is strongly recommended before making any clinical decisions."
    const fullDisclaimer = disclaimer1 + disclaimer2 + disclaimer3
    const splitDisclaimer = doc.splitTextToSize(fullDisclaimer, pageWidth - 20)

    // render with bold on "should NOT..."
    doc.text(disclaimer1, 10, footerY + 9)
    const d1Width = doc.getTextWidth(disclaimer1)
    doc.setFont("helvetica", "bold")
    setColor(black)
    doc.text(disclaimer2, 10 + d1Width, footerY + 9)
    doc.setFont("helvetica", "normal")
    setColor(darkGray)
    const splitD3 = doc.splitTextToSize(disclaimer3, pageWidth - 20)
    doc.text(splitD3, 10, footerY + 14)

    // ── SAVE ─────────────────────────────────────────────
    const filename = `pneuscan_report_${record._id ? record._id.slice(-6) : "report"}.pdf`
    doc.save(filename)
  }