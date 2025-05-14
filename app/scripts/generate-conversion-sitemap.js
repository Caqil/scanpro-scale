// scripts/generate-conversion-sitemap.js
const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

// Define supported languages
const LANGUAGES = ['en', 'id', 'es', 'fr', 'zh', 'ar', 'hi', 'ru', 'pt', 'de', 'ja', 'ko', 'it', 'tr'];

// Define all file format conversions
const CONVERSION_TYPES = [
  { from: 'pdf', to: 'docx', slug: 'pdf-to-docx' },
  { from: 'pdf', to: 'xlsx', slug: 'pdf-to-xlsx' },
  { from: 'pdf', to: 'pptx', slug: 'pdf-to-pptx' },
  { from: 'pdf', to: 'jpg', slug: 'pdf-to-jpg' },
  { from: 'pdf', to: 'png', slug: 'pdf-to-png' },
  { from: 'pdf', to: 'html', slug: 'pdf-to-html' },
  { from: 'docx', to: 'pdf', slug: 'docx-to-pdf' },
  { from: 'xlsx', to: 'pdf', slug: 'xlsx-to-pdf' },
  { from: 'pptx', to: 'pdf', slug: 'pptx-to-pdf' },
  { from: 'jpg', to: 'pdf', slug: 'jpg-to-pdf' },
  { from: 'png', to: 'pdf', slug: 'png-to-pdf' },
  { from: 'html', to: 'pdf', slug: 'html-to-pdf' },
  { from: 'pdf', to: 'word', slug: 'pdf-to-word' },
  { from: 'pdf', to: 'excel', slug: 'pdf-to-excel' },
  { from: 'pdf', to: 'powerpoint', slug: 'pdf-to-powerpoint' },
  { from: 'word', to: 'pdf', slug: 'word-to-pdf' },
  { from: 'excel', to: 'pdf', slug: 'excel-to-pdf' },
  { from: 'powerpoint', to: 'pdf', slug: 'powerpoint-to-pdf' },
];

async function generateConversionSitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mega-pdf.com';
  const links = [];

  // Generate URLs for all language and conversion combinations
  LANGUAGES.forEach(lang => {
    CONVERSION_TYPES.forEach(conversion => {
      const url = `/${lang}/convert/${conversion.slug}`; // Correct URL structure
      links.push({
        url: url,
        changefreq: 'weekly', // Match the image's changefreq
        priority: 0.8, // Match the image's priority
        lastmod: new Date().toISOString(), // Full ISO timestamp to match image
      });
    });
  });

  // Create a sitemap from our data
  const stream = new SitemapStream({ hostname: siteUrl });

  // Return a promise that resolves with the XML string
  return streamToPromise(Readable.from(links).pipe(stream)).then(data =>
    data.toString()
  );
}

async function run() {
  try {
    const sitemapXml = await generateConversionSitemap();
    fs.writeFileSync('./public/conversion-sitemap.xml', sitemapXml);
    console.log('✅ Conversion sitemap generated successfully');
  } catch (error) {
    console.error('Error generating conversion sitemap:', error);
  }
}

// Only run the script directly if called directly
if (require.main === module) {
  run();
}

module.exports = { generateConversionSitemap };