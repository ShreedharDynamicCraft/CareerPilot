import pdfParse from 'pdf-parse/lib/pdf-parse';

export async function extractTextFromPDF(buffer) {
  try {
    // Configure options to skip loading test files
    const options = {
      max: 0, // No limit on pages
      version: 'default'
    };

    const data = await pdfParse(buffer, options);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}
