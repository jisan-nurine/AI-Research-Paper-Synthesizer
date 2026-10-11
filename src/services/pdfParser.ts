import * as pdfjsLib from 'pdfjs-dist';

// Configure CDN worker for browser execution
try {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('Could not set pdf worker src:', e);
}

export interface ExtractedPdf {
  text: string;
  pageCount: number;
  fileName: string;
}

/**
 * Extracts raw textual content from uploaded PDF or text file
 */
export async function extractTextFromFile(file: File): Promise<ExtractedPdf> {
  const fileName = file.name;

  // If text, markdown, or tex file, read as text
  if (
    file.type === 'text/plain' ||
    file.type === 'text/markdown' ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.md') ||
    fileName.endsWith('.tex')
  ) {
    const text = await file.text();
    return {
      text,
      pageCount: Math.ceil(text.length / 3000) || 1,
      fileName,
    };
  }

  // PDF processing
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let pageNum = 1; pageNum <= Math.min(numPages, 40); pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageItems = textContent.items.map((item: any) => item.str || '').join(' ');
      fullText += `--- Page ${pageNum} ---\n` + pageItems + '\n\n';
    }

    return {
      text: fullText.trim(),
      pageCount: numPages,
      fileName,
    };
  } catch (error: any) {
    console.error('PDF parsing error, attempting string fallback:', error);
    // Fallback: read text representation
    const text = await file.text();
    return {
      text: text.slice(0, 30000),
      pageCount: 1,
      fileName,
    };
  }
}
