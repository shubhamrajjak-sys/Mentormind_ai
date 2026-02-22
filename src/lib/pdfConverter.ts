import { jsPDF } from "jspdf";

export async function convertToPdf(file: File): Promise<Blob> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const doc = new jsPDF();

  if (ext === "txt") {
    const text = await file.text();
    const lines = doc.splitTextToSize(text, 180);
    let y = 15;
    for (const line of lines) {
      if (y > 280) {
        doc.addPage();
        y = 15;
      }
      doc.text(line, 15, y);
      y += 7;
    }
  } else if (["jpg", "jpeg", "png"].includes(ext || "")) {
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    const img = new window.Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = dataUrl;
    });
    const pageW = 190;
    const ratio = img.height / img.width;
    const imgW = Math.min(pageW, img.width);
    const imgH = imgW * ratio;
    doc.addImage(dataUrl, ext === "png" ? "PNG" : "JPEG", 10, 10, imgW, imgH > 270 ? 270 : imgH);
  } else if (ext === "docx") {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const lines = doc.splitTextToSize(result.value, 180);
    let y = 15;
    for (const line of lines) {
      if (y > 280) {
        doc.addPage();
        y = 15;
      }
      doc.text(line, 15, y);
      y += 7;
    }
  } else {
    throw new Error("Unsupported file type for PDF conversion");
  }

  return doc.output("blob");
}
