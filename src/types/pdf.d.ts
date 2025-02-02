// src/types/pdf.d.ts -->

declare module 'pdfjs-dist/legacy/build/pdf.worker.entry';
declare module 'pdfjs-dist' {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export const version: string;
  export function getDocument(src: string): any;
}