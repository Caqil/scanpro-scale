declare module 'libreoffice-convert' {
    import { Buffer } from 'buffer';

    export function convert(
        input: Buffer,
        outputFormat: string,
        filterOptions?: string
    ): Promise<Buffer>;

    export function convertWithOptions(
        input: Buffer,
        outputFormat: string,
        options?: {
            filterOptions?: string;
            timeoutTime?: number;
            killTime?: number;
        }
    ): Promise<Buffer>;
}