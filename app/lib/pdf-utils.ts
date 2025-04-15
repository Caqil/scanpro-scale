// lib/pdf-utils.ts
import * as pdfjs from 'pdfjs-dist';

/**
 * Initialize PDF.js with the correct worker path
 * This function should be called before using PDF.js in any component
 */
export function initPDFJS() {
    // Configure correct worker URL path
    // In production, we need to use a path relative to the public directory
    const workerPath = '/pdf.worker.min.js';
    pdfjs.GlobalWorkerOptions.workerSrc = workerPath;
}

/**
 * Load a PDF document and return it
 * @param source URL or ArrayBuffer containing the PDF data
 * @returns PDF document object
 */
export async function loadPDF(source: string | ArrayBuffer) {
    // Make sure PDF.js is initialized
    initPDFJS();

    // Load the PDF document
    try {
        const loadingTask = pdfjs.getDocument(source);
        return await loadingTask.promise;
    } catch (error) {
        console.error('Error loading PDF:', error);
        throw error;
    }
}