import { PDFWorker } from 'pdfjs-dist/legacy/build/pdf';

let worker = null;

export function getWorker() {
  if (!worker) {
    worker = new PDFWorker();
  }
  return worker;
}
