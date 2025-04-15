// lib/file-storage-service.ts
import { mkdir, writeFile, readFile, readdir, stat, unlink, rmdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface FileStorageOptions {
    createDirectories?: boolean;
    logOperations?: boolean;
}

export class FileStorageService {
    private rootPath: string;
    private uploadDir: string;
    private conversionDir: string;
    private compressionDir: string;
    private tempDir: string;
    private options: FileStorageOptions;

    constructor(options: FileStorageOptions = {}) {
        // Default options
        this.options = {
            createDirectories: true,
            logOperations: true,
            ...options
        };

        // Get the root path (works in both development and production)
        this.rootPath = process.cwd();

        // Define directories
        this.uploadDir = path.join(this.rootPath, 'uploads');
        this.conversionDir = path.join(this.rootPath, 'public', 'conversions');
        this.compressionDir = path.join(this.rootPath, 'public', 'compressions');
        this.tempDir = path.join(this.rootPath, 'temp-conversions');

        // Initialize directories if needed
        if (this.options.createDirectories) {
            this.ensureDirectories();
        }
    }

    private log(...args: unknown[]) {
        if (this.options.logOperations) {
            console.log(...args);
        }
    }

    // Ensure all required directories exist
    public async ensureDirectories() {
        const dirs = [
            this.uploadDir,
            this.conversionDir,
            this.compressionDir,
            this.tempDir
        ];

        for (const dir of dirs) {
            if (!existsSync(dir)) {
                this.log(`Creating directory: ${dir}`);
                await mkdir(dir, { recursive: true });
            }
        }
    }

    // Generate a unique ID for a file
    public generateUniqueId(): string {
        return uuidv4();
    }

    // Get the full path for an uploaded file
    public getUploadPath(filename: string): string {
        return path.join(this.uploadDir, filename);
    }

    // Get the full path for a converted file
    public getConversionPath(filename: string): string {
        return path.join(this.conversionDir, filename);
    }

    // Get the full path for a compressed file
    public getCompressionPath(filename: string): string {
        return path.join(this.compressionDir, filename);
    }

    // Get the full path for a temporary file
    public getTempPath(filename: string): string {
        return path.join(this.tempDir, filename);
    }

    // Get the public URL for a converted file
    public getConversionUrl(filename: string): string {
        return `/conversions/${filename}`;
    }

    // Get the public URL for a compressed file
    public getCompressionUrl(filename: string): string {
        return `/compressions/${filename}`;
    }

    // Save a file to the uploads directory
    public async saveUploadedFile(buffer: Buffer, filename: string): Promise<string> {
        const filePath = this.getUploadPath(filename);
        this.log(`Saving uploaded file to: ${filePath}`);
        await writeFile(filePath, buffer);
        return filePath;
    }

    // Save a file to the conversions directory
    public async saveConvertedFile(buffer: Buffer, filename: string): Promise<string> {
        const filePath = this.getConversionPath(filename);
        this.log(`Saving converted file to: ${filePath}`);
        await writeFile(filePath, buffer);
        return filePath;
    }

    // Save a file to the compressions directory
    public async saveCompressedFile(buffer: Buffer, filename: string): Promise<string> {
        const filePath = this.getCompressionPath(filename);
        this.log(`Saving compressed file to: ${filePath}`);
        await writeFile(filePath, buffer);
        return filePath;
    }

    // Read a file from any of the managed directories
    public async readFile(filePath: string): Promise<Buffer> {
        this.log(`Reading file from: ${filePath}`);
        if (!existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        return await readFile(filePath);
    }

    // Check if a file exists
    public fileExists(filePath: string): boolean {
        const exists = existsSync(filePath);
        this.log(`Checking if file exists at ${filePath}: ${exists}`);
        return exists;
    }

    // List all files in a directory
    public async listFiles(directoryPath: string): Promise<string[]> {
        this.log(`Listing files in directory: ${directoryPath}`);
        if (!existsSync(directoryPath)) {
            this.log(`Directory does not exist: ${directoryPath}`);
            return [];
        }
        return await readdir(directoryPath);
    }

    // Get file stats
    public async getFileStats(filePath: string) {
        this.log(`Getting stats for file: ${filePath}`);
        if (!existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        return await stat(filePath);
    }

    // Delete a file
    public async deleteFile(filePath: string): Promise<boolean> {
        this.log(`Deleting file: ${filePath}`);
        if (!existsSync(filePath)) {
            this.log(`File not found for deletion: ${filePath}`);
            return false;
        }
        await unlink(filePath);
        return true;
    }

    // Create a temp directory
    public async createTempDirectory(dirName: string): Promise<string> {
        const tempDirPath = path.join(this.tempDir, dirName);
        this.log(`Creating temp directory: ${tempDirPath}`);
        await mkdir(tempDirPath, { recursive: true });
        return tempDirPath;
    }

    // Remove a temp directory and its contents
    public async removeTempDirectory(dirName: string): Promise<boolean> {
        const tempDirPath = path.join(this.tempDir, dirName);
        this.log(`Removing temp directory: ${tempDirPath}`);
        if (!existsSync(tempDirPath)) {
            this.log(`Temp directory not found: ${tempDirPath}`);
            return false;
        }

        // Delete all files in the directory
        const files = await readdir(tempDirPath);
        for (const file of files) {
            await unlink(path.join(tempDirPath, file));
        }

        // Remove the directory itself
        await rmdir(tempDirPath);
        return true;
    }
}

// Export a singleton instance
export const fileStorage = new FileStorageService();

// Also export the class for testing or custom instances
export default FileStorageService;