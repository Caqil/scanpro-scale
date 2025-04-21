// scripts/cleanup-temp-files.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

async function cleanupOldFiles() {
  console.log('Starting temporary files cleanup...');
  
  // Define directories to clean up
  const directories = [
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'temp'),
    path.join(process.cwd(), 'public', 'conversions'),
    path.join(process.cwd(), 'public', 'splits'),
    path.join(process.cwd(), 'public', 'status'),
    path.join(process.cwd(), 'public', 'unlocked'),
    path.join(process.cwd(), 'public', 'ocr')
  ];
  
  // Files older than this threshold will be deleted (48 hours)
  const thresholdTime = Date.now() - (48 * 60 * 60 * 1000);
  let totalRemoved = 0;
  
  for (const dir of directories) {
    try {
      console.log(`Scanning directory: ${dir}`);
      
      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        console.log(`Directory doesn't exist: ${dir}`);
        continue;
      }
      
      const files = await readdir(dir);
      console.log(`Found ${files.length} files in ${dir}`);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        
        try {
          const fileStat = await stat(filePath);
          
          if (fileStat.isFile() && fileStat.mtimeMs < thresholdTime) {
            await unlink(filePath);
            totalRemoved++;
            console.log(`Removed: ${filePath}`);
          }
        } catch (fileError) {
          console.error(`Error processing file ${filePath}:`, fileError);
        }
      }
    } catch (dirError) {
      console.error(`Error processing directory ${dir}:`, dirError);
    }
  }
  
  console.log(`Cleanup completed. Removed ${totalRemoved} files.`);
  return totalRemoved;
}

// Execute cleanup
cleanupOldFiles()
  .then(count => {
    console.log(`Successfully removed ${count} temporary files`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });