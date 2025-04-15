declare module "pdf-parse" {
    interface PDFData {
        numpages: number
        numrender: number
        info: {
            PDFFormatVersion: string
            IsAcroFormPresent: boolean
            IsXFAPresent: boolean
            [key: string]: unknown
        }
        metadata: unknown
        text: string
    }

    function pdfParse(
        dataBuffer: Buffer,
        options?: {
            pagerender?: (pageData: unknown) => string
            max?: number
            version?: string
        },
    ): Promise<PDFData>

    export default pdfParse
}
