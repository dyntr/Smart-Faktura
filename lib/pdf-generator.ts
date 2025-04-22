import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDF(elementId: string, filename: string = 'invoice.pdf'): Promise<void> {
  try {
    // Get the element that we want to convert to PDF
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }

    // Create a clone to avoid modifying the original element
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '794px'; // A4 width in pixels at 96 DPI
    clone.style.padding = '40px';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);

    // Use html2canvas to render the element to a canvas
    const canvas = await html2canvas(clone, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // To handle images from different origins
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Remove the clone from the DOM
    document.body.removeChild(clone);

    // Calculate the PDF dimensions (A4 format)
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // A4 size: 210 x 297 mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    
    // Calculate the ratio to fit the canvas in the PDF
    const ratio = Math.min(
      pdfWidth / canvas.width,
      pdfHeight / canvas.height
    );
    
    const canvasWidth = canvas.width * ratio;
    const canvasHeight = canvas.height * ratio;
    
    // Center the image in the PDF
    const offsetX = (pdfWidth - canvasWidth) / 2;
    const offsetY = 0;

    // Add the image to the PDF
    pdf.addImage(imgData, 'PNG', offsetX, offsetY, canvasWidth, canvasHeight);

    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
} 