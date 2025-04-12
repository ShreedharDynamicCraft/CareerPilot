import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';

export async function POST(req) {
  try {
    const { latex } = await req.json();
    const tempDir = os.tmpdir();
    const timestamp = Date.now();
    const texFile = path.join(tempDir, `resume_${timestamp}.tex`);
    const pdfFile = path.join(tempDir, `resume_${timestamp}.pdf`);

    // Write LaTeX content to temp file
    await writeFile(texFile, latex);

    // Compile LaTeX to PDF using pdflatex
    await new Promise((resolve, reject) => {
      exec(`pdflatex -output-directory=${tempDir} ${texFile}`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    // Read the generated PDF
    const pdfBuffer = await readFile(pdfFile);

    // Clean up temporary files
    await Promise.all([
      unlink(texFile),
      unlink(pdfFile),
      unlink(path.join(tempDir, `resume_${timestamp}.aux`)),
      unlink(path.join(tempDir, `resume_${timestamp}.log`))
    ].map(p => p.catch(() => {})));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=resume.pdf'
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return new NextResponse(JSON.stringify({ error: 'PDF generation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
