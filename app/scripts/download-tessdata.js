// scripts/download-tessdata.js
const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);

// Define languages to download (add more as needed)
const languages = [
    'eng', // English
    'fra', // French
    'deu', // German
    'spa', // Spanish
    'ita', // Italian
    'por', // Portuguese
    'chi_sim', // Chinese (Simplified)
    'chi_tra', // Chinese (Traditional)
    'jpn', // Japanese
    'kor', // Korean
    'rus', // Russian
    'ara', // Arabic
    'hin', // Hindi
];

// Create directory for language data
const tessDataDir = path.resolve(process.cwd(), 'node_modules/tesseract.js/tessdata');

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading ${url} to ${dest}...`);

        const file = fs.createWriteStream(dest);
        https.get(url, response => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${dest}`);
                resolve();
            });
        }).on('error', err => {
            fs.unlink(dest);
            reject(err);
        });
    });
}

async function ensureDirectoryExists(dir) {
    try {
        await access(dir, fs.constants.F_OK);
    } catch (e) {
        console.log(`Creating directory: ${dir}`);
        await mkdir(dir, { recursive: true });
    }
}

async function downloadLanguageFiles() {
    try {
        await ensureDirectoryExists(tessDataDir);

        for (const lang of languages) {
            const trainedDataUrl = `https://github.com/tesseract-ocr/tessdata/raw/4.0.0/${lang}.traineddata`;
            const outputPath = path.join(tessDataDir, `${lang}.traineddata`);

            try {
                // Check if file already exists
                await access(outputPath, fs.constants.F_OK);
                console.log(`Language file for ${lang} already exists, skipping.`);
            } catch (e) {
                // File doesn't exist, download it
                await downloadFile(trainedDataUrl, outputPath);
            }
        }

        console.log('All language files downloaded successfully!');
    } catch (error) {
        console.error('Error downloading language files:', error);
        process.exit(1);
    }
}

// Run the download
downloadLanguageFiles();