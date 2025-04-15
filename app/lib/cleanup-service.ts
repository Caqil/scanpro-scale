// lib/cleanup-service.ts
import { unlink, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from './prisma';

// Define directories to clean
const DIRECTORIES = [
  'uploads',
  'public/conversions',
  'public/compressions',
  'public/merges',
  'public/splits',
  'public/rotations',
  'public/watermarks',
  'public/protected',
  'public/unlocked',
  'public/edited',
  'temp',
];

/**
 * Cleanup expired password reset tokens
 * This should be run periodically to keep the database clean
 */
export async function cleanupExpiredResetTokens(): Promise<{ count: number }> {
  try {
    // Delete all tokens that have expired
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        expires: {
          lt: new Date(), // less than current time (expired)
        },
      },
    });

    console.log(`Deleted ${result.count} expired password reset tokens`);
    return { count: result.count };
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    throw error;
  }
}

// This function can be called from a cron job or API route
export async function runCleanupTasks(): Promise<{
  success: boolean;
  results: Record<string, any>;
}> {
  try {
    // Run all cleanup tasks
    const tokenCleanupResult = await cleanupExpiredResetTokens();

    // Add more cleanup tasks as needed

    return {
      success: true,
      results: {
        expiredTokens: tokenCleanupResult,
      },
    };
  } catch (error) {
    console.error('Error running cleanup tasks:', error);
    return {
      success: false,
      results: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}
/**
 * Clean up old temporary files to free up disk space
 * @param maxAgeMinutes Maximum age of files to keep (in minutes)
 * @returns Result of cleanup operation
 */
export async function cleanupFiles(maxAgeMinutes: number = 60): Promise<{
  success: boolean;
  error?: string;
  stats?: {
    totalCleaned: number;
    byDir: Record<string, number>;
    totalSize: number;
  };
}> {
  try {
    const now = Date.now();
    const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
    const stats = {
      totalCleaned: 0,
      byDir: {} as Record<string, number>,
      totalSize: 0,
    };

    // Process each directory
    for (const dir of DIRECTORIES) {
      const dirPath = join(process.cwd(), dir);

      // Skip if directory doesn't exist
      if (!existsSync(dirPath)) {
        continue;
      }

      stats.byDir[dir] = 0;

      // Read all files in the directory
      const files = await readdir(dirPath);

      // Process each file
      for (const file of files) {
        const filePath = join(dirPath, file);

        try {
          // Get file stats
          const fileStat = await stat(filePath);

          // Skip directories
          if (fileStat.isDirectory()) {
            continue;
          }

          // Check if file is older than max age
          const fileAge = now - fileStat.mtime.getTime();

          if (fileAge > maxAge) {
            // File is older than max age, delete it
            const fileSize = fileStat.size;
            await unlink(filePath);

            // Update stats
            stats.totalCleaned++;
            stats.byDir[dir]++;
            stats.totalSize += fileSize;
          }
        } catch (fileError) {
          // Skip files with errors
          console.error(`Error processing file ${filePath}:`, fileError);
        }
      }
    }

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error('Error cleaning up files:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during cleanup',
    };
  }
}