// For app/app/[lang]/developer/api/getting-started/page.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  ArrowLeft,
  Key,
  Code,
  FileCode,
  CheckCircle,
  FileText,
  ChevronRight,
  PencilRuler,
  FilePlus,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GettingStartedPage() {
  return (
    <div className="container py-12 max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-6 bg-gradient-to-b from-background to-muted/50 py-12 rounded-lg">
        <div className="p-4 rounded-full bg-primary/10">
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Getting Started
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Learn how to integrate the MegaPDF API into your applications with
          comprehensive guides, authentication setup, and sample code.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" className="rounded-full">
            Get API Key <Key className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="rounded-full" asChild>
            <Link href="/developer/api">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to API Documentation
            </Link>
          </Button>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="space-y-8">
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold">
              Quick Start Guide
            </CardTitle>
            <CardDescription className="text-lg">
              Get up and running with the MegaPDF API in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-base leading-7">
                Welcome to the MegaPDF API! This guide will help you quickly
                integrate our API into your applications. The MegaPDF API
                provides a comprehensive set of PDF manipulation tools that you
                can access through simple HTTP requests.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 my-6">
                <h3 className="text-blue-800 dark:text-blue-200 text-lg font-medium flex items-center gap-2 mt-0">
                  <CheckCircle className="h-5 w-5" />
                  Prerequisites
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                  To use the MegaPDF API, you need:
                </p>
                <ul className="text-blue-700 dark:text-blue-300 text-sm mt-2 list-disc pl-5 space-y-1">
                  <li>A MegaPDF account</li>
                  <li>
                    An API key (get yours from the{" "}
                    <a
                      href="/dashboard/api-keys"
                      className="text-blue-600 dark:text-blue-400 underline"
                    >
                      API Keys Dashboard
                    </a>
                    )
                  </li>
                  <li>Basic knowledge of HTTP requests and JSON</li>
                </ul>
              </div>

              <h2 className="text-2xl font-semibold mt-8">
                1. Get Your API Key
              </h2>
              <p className="text-base leading-7">
                All requests to the MegaPDF API require authentication using an
                API key. To get your API key:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-base leading-7">
                <li>Log in to your MegaPDF account</li>
                <li>
                  Navigate to the{" "}
                  <a
                    href="/dashboard/api-keys"
                    className="text-primary hover:underline"
                  >
                    API Keys Dashboard
                  </a>
                </li>
                <li>Click "Generate New API Key"</li>
                <li>Copy your API key and store it securely</li>
              </ol>
              <div className="bg-muted/50 p-4 rounded-lg my-4">
                <p className="text-sm font-semibold">Example API Key</p>
                <code className="text-xs">
                  sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe
                </code>
              </div>
              <Alert className="my-4">
                <AlertTitle className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" /> Security Notice
                </AlertTitle>
                <AlertDescription className="text-amber-600/90 dark:text-amber-400/90">
                  Keep your API key secure and never expose it in client-side
                  code. If your key is compromised, you can revoke it and
                  generate a new one from your dashboard.
                </AlertDescription>
              </Alert>

              <h2 className="text-2xl font-semibold mt-8">2. API Base URL</h2>
              <p className="text-base leading-7">
                All API endpoints are available at the following base URL:
              </p>
              <div className="bg-muted p-3 rounded-md font-mono text-sm my-4">
                <code>https://mega-pdf.com/api</code>
              </div>
              <p className="text-base leading-7">
                For example, to access the PDF conversion endpoint, you would
                use:
              </p>
              <div className="bg-muted p-3 rounded-md font-mono text-sm my-4">
                <code>https://mega-pdf.com/api/pdf/convert</code>
              </div>

              <h2 className="text-2xl font-semibold mt-8">3. Authentication</h2>
              <p className="text-base leading-7">
                There are two ways to authenticate your API requests:
              </p>
              <h3 className="text-xl font-semibold mt-6">
                Option 1: HTTP Header (Recommended)
              </h3>
              <p className="text-base leading-7">
                Include your API key in the <code>x-api-key</code> request
                header:
              </p>
              <div className="bg-muted p-3 rounded-md font-mono text-sm my-4">
                <code>x-api-key: your-api-key</code>
              </div>
              <h3 className="text-xl font-semibold mt-6">
                Option 2: Query Parameter
              </h3>
              <p className="text-base leading-7">
                Include your API key as a query parameter:
              </p>
              <div className="bg-muted p-3 rounded-md font-mono text-sm my-4">
                <code>
                  https://mega-pdf.com/api/pdf/convert?api_key=your-api-key
                </code>
              </div>

              <h2 className="text-2xl font-semibold mt-8">
                4. Making Your First API Request
              </h2>
              <p className="text-base leading-7">
                Let's make a simple API request to convert a PDF to an image
                using cURL:
              </p>
              <Card className="bg-muted/50 my-4">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono overflow-auto">
                    <code>{`curl -X POST https://mega-pdf.com/api/pdf/convert \\
  -H "x-api-key: your-api-key" \\
  -F "file=@/path/to/document.pdf" \\
  -F "outputFormat=jpg"
`}</code>
                  </pre>
                </CardContent>
              </Card>
              <p className="text-base leading-7">
                And here's how to do the same request in JavaScript:
              </p>
              <Card className="bg-muted/50 my-4">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono overflow-auto">
                    <code>{`const formData = new FormData();
formData.append('file', fs.createReadStream('document.pdf'));
formData.append('outputFormat', 'jpg');

fetch('https://mega-pdf.com/api/pdf/convert', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Conversion successful:', data.fileUrl);
    } else {
      console.error('Conversion failed:', data.error);
    }
  })
  .catch(error => console.error('Error:', error));
`}</code>
                  </pre>
                </CardContent>
              </Card>

              <h2 className="text-2xl font-semibold mt-8">
                5. Response Format
              </h2>
              <p className="text-base leading-7">
                All API responses include a <code>success</code> boolean
                indicating if the request was successful:
              </p>
              <Card className="bg-muted/50 my-4">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono overflow-auto">
                    <code>{`// Success response
{
  "success": true,
  "message": "Operation completed successfully",
  "fileUrl": "/api/file?folder=conversions&filename=abc123.jpg",
  "filename": "abc123.jpg",
  // Additional operation-specific data...
}

// Error response
{
  "success": false,
  "error": "Detailed error message"
}
`}</code>
                  </pre>
                </CardContent>
              </Card>

              <h2 className="text-2xl font-semibold mt-8">
                6. Downloading Results
              </h2>
              <p className="text-base leading-7">
                For operations that generate files, the response will include a{" "}
                <code>fileUrl</code> path. To download the file, prepend the
                base URL:
              </p>
              <div className="bg-muted p-3 rounded-md font-mono text-sm my-4">
                <code>
                  https://mega-pdf.com/api/file?folder=conversions&filename=abc123.jpg
                </code>
              </div>
              <p className="text-base leading-7">
                Files remain available for download for 24 hours, after which
                they are automatically deleted.
              </p>

              <h2 className="text-2xl font-semibold mt-8">7. Error Handling</h2>
              <p className="text-base leading-7">
                When an error occurs, the API returns a JSON response with{" "}
                <code>success: false</code> and an <code>error</code> message
                explaining what went wrong:
              </p>
              <Card className="bg-muted/50 my-4">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono overflow-auto">
                    <code>{`{
  "success": false,
  "error": "Authentication failed: Invalid API key"
}
`}</code>
                  </pre>
                </CardContent>
              </Card>
              <p className="text-base leading-7">
                Common HTTP status codes you may encounter:
              </p>
              <Table className="border rounded-md my-4">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Status Code</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>200 OK</TableCell>
                    <TableCell>Request successful</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>400 Bad Request</TableCell>
                    <TableCell>Invalid request parameters</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>401 Unauthorized</TableCell>
                    <TableCell>Invalid or missing API key</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>402 Payment Required</TableCell>
                    <TableCell>
                      Insufficient account balance or free operations
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>500 Internal Server Error</TableCell>
                    <TableCell>Server-side error occurred</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <h2 className="text-2xl font-semibold mt-8">8. Rate Limits</h2>
              <p className="text-base leading-7">
                The MegaPDF API enforces rate limits to ensure fair usage:
              </p>
              <Table className="border rounded-md my-4">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Plan</TableHead>
                    <TableHead className="font-semibold">Rate Limit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Free</TableCell>
                    <TableCell>10 requests per minute</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Basic</TableCell>
                    <TableCell>60 requests per minute</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Pro</TableCell>
                    <TableCell>200 requests per minute</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Enterprise</TableCell>
                    <TableCell>Custom rate limits</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-base leading-7">
                When you exceed your rate limit, the API returns a 429 Too Many
                Requests response. The response includes a{" "}
                <code>Retry-After</code> header indicating how many seconds to
                wait before making another request.
              </p>

              <h2 className="text-2xl font-semibold mt-8">9. Available APIs</h2>
              <p className="text-base leading-7">
                MegaPDF offers a comprehensive suite of PDF processing APIs:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <Card className="bg-muted/20">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileCode className="h-5 w-5 text-primary" />
                      Conversion API
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Convert PDFs to and from various formats
                    </p>
                    <Button variant="link" size="sm" className="px-0" asChild>
                      <Link href="/en/developer/api/conversion">
                        View Documentation{" "}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-muted/20">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FilePlus className="h-5 w-5 text-primary" />
                      Manipulation API
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Merge, split, compress, and rotate PDFs
                    </p>
                    <Button variant="link" size="sm" className="px-0" asChild>
                      <Link href="/en/developer/api/manipulation">
                        View Documentation{" "}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-muted/20">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      OCR API
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Extract text and create searchable PDFs
                    </p>
                    <Button variant="link" size="sm" className="px-0" asChild>
                      <Link href="/en/developer/api/ocr">
                        View Documentation{" "}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-muted/20">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PencilRuler className="h-5 w-5 text-primary" />
                      Editing API
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Add watermarks, page numbers, and more
                    </p>
                    <Button variant="link" size="sm" className="px-0" asChild>
                      <Link href="/en/developer/api/editing">
                        View Documentation{" "}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <p className="text-base leading-7">
                Explore all available APIs in the{" "}
                <Link
                  href="/en/developer/api"
                  className="text-primary hover:underline"
                >
                  API Documentation
                </Link>
                .
              </p>

              <h2 className="text-2xl font-semibold mt-8">
                10. SDKs and Client Libraries
              </h2>
              <p className="text-base leading-7">
                While you can use the API directly with HTTP requests, we also
                provide official client libraries for popular programming
                languages:
              </p>
              <Table className="border rounded-md my-4">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Language</TableHead>
                    <TableHead className="font-semibold">Repository</TableHead>
                    <TableHead className="font-semibold">
                      Installation
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>JavaScript/TypeScript</TableCell>
                    <TableCell>
                      <a
                        href="https://github.com/MegaPDF/megapdf-js"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        megapdf-js
                      </a>
                    </TableCell>
                    <TableCell>
                      <code>npm install megapdf</code>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Python</TableCell>
                    <TableCell>
                      <a
                        href="https://github.com/MegaPDF/megapdf-python"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        megapdf-python
                      </a>
                    </TableCell>
                    <TableCell>
                      <code>pip install megapdf</code>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>PHP</TableCell>
                    <TableCell>
                      <a
                        href="https://github.com/MegaPDF/megapdf-php"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        megapdf-php
                      </a>
                    </TableCell>
                    <TableCell>
                      <code>composer require megapdf/megapdf</code>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Java</TableCell>
                    <TableCell>
                      <a
                        href="https://github.com/MegaPDF/megapdf-java"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        megapdf-java
                      </a>
                    </TableCell>
                    <TableCell>Available through Maven</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <h2 className="text-2xl font-semibold mt-8">
                11. Complete Example: PDF to DOCX Conversion
              </h2>
              <p className="text-base leading-7">
                Here's a complete example of converting a PDF to a DOCX file
                using Node.js:
              </p>
              <Card className="bg-muted/50 my-4">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono overflow-auto">
                    <code>{`// Save as convert-pdf.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const API_KEY = 'your-api-key'; // Replace with your actual API key
const API_URL = 'https://mega-pdf.com/api/pdf/convert';
const PDF_FILE_PATH = './document.pdf'; // Path to your PDF file
const OUTPUT_FORMAT = 'docx';

async function convertPDF() {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(PDF_FILE_PATH));
    formData.append('outputFormat', OUTPUT_FORMAT);
    
    // Make API request
    console.log('Converting PDF to DOCX...');
    const response = await axios.post(API_URL, formData, {
      headers: {
        'x-api-key': API_KEY,
        ...formData.getHeaders()
      },
      responseType: 'json'
    });
    
    // Check if the request was successful
    if (response.data.success) {
      console.log('Conversion successful!');
      
      // Download the converted file
      const fileUrl = \`https://mega-pdf.com\${response.data.fileUrl}\`;
      const outputPath = \`./converted-\${path.basename(PDF_FILE_PATH, '.pdf')}.\${OUTPUT_FORMAT}\`;
      
      console.log(\`Downloading converted file from \${fileUrl}...\`);
      const fileResponse = await axios.get(fileUrl, { responseType: 'stream' });
      
      // Save the file
      const writer = fs.createWriteStream(outputPath);
      fileResponse.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(\`File saved to \${outputPath}\`);
          resolve(outputPath);
        });
        writer.on('error', reject);
      });
    } else {
      throw new Error(response.data.error || 'Conversion failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

// Run the conversion
convertPDF()
  .then(outputPath => console.log('Done!'))
  .catch(error => console.error('Conversion failed:', error));
`}</code>
                  </pre>
                </CardContent>
              </Card>
              <p className="text-base leading-7">To run this example:</p>
              <ol className="list-decimal pl-5 space-y-2 text-base leading-7">
                <li>
                  Install dependencies: <code>npm install axios form-data</code>
                </li>
                <li>
                  Replace <code>'your-api-key'</code> with your actual API key
                </li>
                <li>
                  Place a PDF file named <code>document.pdf</code> in the same
                  directory
                </li>
                <li>
                  Run the script: <code>node convert-pdf.js</code>
                </li>
              </ol>

              <h2 className="text-2xl font-semibold mt-8">
                12. Billing and Usage
              </h2>
              <p className="text-base leading-7">
                MegaPDF uses a credit-based billing system:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-base leading-7">
                <li>Each API operation costs 1 credit</li>
                <li>Free accounts receive 10 free operations per month</li>
                <li>Paid plans include a monthly credit allocation</li>
                <li>Additional credits can be purchased from your dashboard</li>
              </ul>
              <p className="text-base leading-7 mt-4">
                When you make an API request, you'll receive billing information
                in the response:
              </p>
              <Card className="bg-muted/50 my-4">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono overflow-auto">
                    <code>{`{
  "success": true,
  "message": "Operation successful",
  "fileUrl": "/api/file?folder=conversions&filename=abc123.jpg",
  "billing": {
    "usedFreeOperation": true,
    "freeOperationsRemaining": 9,
    "currentBalance": 50.00,
    "operationCost": 0.00
  }
}
`}</code>
                  </pre>
                </CardContent>
              </Card>
              <p className="text-base leading-7">
                You can view your current usage and billing information on the
                <a
                  href="/dashboard/billing"
                  className="text-primary hover:underline"
                >
                  {" "}
                  Billing Dashboard
                </a>
                .
              </p>

              <h2 className="text-2xl font-semibold mt-8">Next Steps</h2>
              <p className="text-base leading-7">
                Now that you're familiar with the basics, explore the
                documentation for specific API endpoints to learn more about
                their capabilities and parameters:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-base leading-7">
                <li>
                  <Link
                    href="/en/developer/api/conversion"
                    className="text-primary hover:underline"
                  >
                    Conversion API
                  </Link>{" "}
                  - Convert between PDF and other formats
                </li>
                <li>
                  <Link
                    href="/en/developer/api/manipulation"
                    className="text-primary hover:underline"
                  >
                    Manipulation API
                  </Link>{" "}
                  - Merge, split, compress, and rotate PDFs
                </li>
                <li>
                  <Link
                    href="/en/developer/api/security"
                    className="text-primary hover:underline"
                  >
                    Security API
                  </Link>{" "}
                  - Password protect and unlock PDFs
                </li>
                <li>
                  <Link
                    href="/en/developer/api/editing"
                    className="text-primary hover:underline"
                  >
                    Editing API
                  </Link>{" "}
                  - Add watermarks, page numbers, and remove pages
                </li>
                <li>
                  <Link
                    href="/en/developer/api/ocr"
                    className="text-primary hover:underline"
                  >
                    OCR API
                  </Link>{" "}
                  - Extract text from scanned documents
                </li>
                <li>
                  <Link
                    href="/en/developer/api/signing"
                    className="text-primary hover:underline"
                  >
                    Signing API
                  </Link>{" "}
                  - Add signatures to PDF documents
                </li>
                <li>
                  <Link
                    href="/en/developer/api/text-editor"
                    className="text-primary hover:underline"
                  >
                    Text Editor API
                  </Link>{" "}
                  - Edit text content in PDFs
                </li>
              </ul>
              <p className="text-base leading-7 mt-4">
                If you need help, check out our{" "}
                <a href="/support" className="text-primary hover:underline">
                  Support Center
                </a>{" "}
                or contact our{" "}
                <a href="/contact" className="text-primary hover:underline">
                  Support Team
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
