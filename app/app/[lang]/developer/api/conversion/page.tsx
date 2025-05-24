import { LanguageLink } from "@/components/language-link";
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
import { Code, Key, FileOutput, ArrowLeft, KeySquareIcon } from "lucide-react";
import Link from "next/link";

export default function ConversionApiPage() {
  return (
    <div className="container py-12 max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-6 bg-gradient-to-b from-background to-muted/50 py-12 rounded-lg">
        <div className="p-4 rounded-full bg-primary/10">
          <FileOutput className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Conversion API
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Seamlessly convert PDFs and other documents to various formats like
          Word, Excel, images, and more with our powerful API.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="default" size="lg" className="rounded-full" asChild>
            <Link href="/en/dashboard">
              <KeySquareIcon className="mr-2 h-5 w-15" /> Get API Key
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="rounded-full" asChild>
            <LanguageLink href="/en/developer/api">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to API Documentation
            </LanguageLink>
          </Button>
        </div>
      </section>

      {/* API Details Section */}
      <section className="space-y-8">
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold">
              Conversion API Overview
            </CardTitle>
            <CardDescription className="text-lg">
              Transform documents effortlessly with robust conversion
              capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-base leading-7">
                The Conversion API enables developers to convert PDFs and other
                document formats to a wide range of output formats, including
                Word, Excel, PowerPoint, images, and text. It supports
                password-protected PDFs, OCR for text extraction, and
                customizable quality settings for image outputs.
              </p>

              <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
              <div className="bg-muted p-4 rounded-md font-mono text-sm">
                <code>POST https://api.mega-pdf.com/api/convert</code>
              </div>

              <h2 className="text-2xl font-semibold mt-8">Authentication</h2>
              <p className="text-base leading-7">
                Authenticate requests using an API key in the{" "}
                <code>x-api-key</code> header or as a query parameter (
                <code>api_key</code>).
              </p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm">
                <pre>
                  <code>{`// Header example
x-api-key: your-api-key

// Query parameter example
https://api.mega-pdf.com/api/convert?api_key=your-api-key
`}</code>
                </pre>
              </div>

              <h2 className="text-2xl font-semibold mt-8">Supported Formats</h2>
              <p className="text-base leading-7">
                The API supports the following input and output formats:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Input Formats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>PDF (.pdf)</li>
                      <li>Word (.docx)</li>
                      <li>Excel (.xlsx, .xls)</li>
                      <li>PowerPoint (.pptx)</li>
                      <li>Rich Text Format (.rtf)</li>
                      <li>Plain Text (.txt)</li>
                      <li>HTML (.html)</li>
                      <li>Images (.jpg, .jpeg, .png)</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Output Formats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>PDF (.pdf)</li>
                      <li>Word (.docx)</li>
                      <li>Excel (.xlsx, .xls)</li>
                      <li>PowerPoint (.pptx)</li>
                      <li>Rich Text Format (.rtf)</li>
                      <li>Plain Text (.txt)</li>
                      <li>HTML (.html)</li>
                      <li>Images (.jpg, .jpeg, .png)</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <h2 className="text-2xl font-semibold mt-8">
                Request Parameters
              </h2>
              <p className="text-base leading-7">
                The API accepts <code>multipart/form-data</code> requests with
                the following parameters:
              </p>
              <Table className="border rounded-md">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Parameter</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Required</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <code>file</code>
                    </TableCell>
                    <TableCell>File</TableCell>
                    <TableCell>The input file to convert</TableCell>
                    <TableCell>Yes</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <code>inputFormat</code>
                    </TableCell>
                    <TableCell>String</TableCell>
                    <TableCell>
                      Input file format (optional if detectable from file
                      extension)
                    </TableCell>
                    <TableCell>No</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <code>outputFormat</code>
                    </TableCell>
                    <TableCell>String</TableCell>
                    <TableCell>Desired output format</TableCell>
                    <TableCell>Yes</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <code>ocr</code>
                    </TableCell>
                    <TableCell>Boolean</TableCell>
                    <TableCell>
                      Enable OCR for text extraction (for PDF to TXT)
                    </TableCell>
                    <TableCell>No</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <code>quality</code>
                    </TableCell>
                    <TableCell>Number</TableCell>
                    <TableCell>
                      Image quality (1-100) for image outputs
                    </TableCell>
                    <TableCell>No (default: 90)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <code>password</code>
                    </TableCell>
                    <TableCell>String</TableCell>
                    <TableCell>Password for encrypted PDFs</TableCell>
                    <TableCell>No</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <h2 className="text-2xl font-semibold mt-8">Example Request</h2>
              <p className="text-base leading-7">
                Convert a PDF to DOCX using cURL:
              </p>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono overflow-auto">
                    <code>{`curl -X POST https://api.mega-pdf.com/api/convert \\
  -H "x-api-key: your-api-key" \\
  -F "file=@/path/to/document.pdf" \\
  -F "outputFormat=docx"
`}</code>
                  </pre>
                </CardContent>
              </Card>

              <h2 className="text-2xl font-semibold mt-8">Response Format</h2>
              <p className="text-base leading-7">
                Successful responses include the converted file URL and
                metadata:
              </p>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono overflow-auto">
                    <code>{`{
  "success": true,
  "message": "Conversion successful",
  "fileUrl": "/api/file?folder=conversions&filename=uuid-output.docx",
  "filename": "uuid-output.docx",
  "originalName": "document.pdf",
  "inputFormat": "pdf",
  "outputFormat": "docx"
}`}</code>
                  </pre>
                </CardContent>
              </Card>
              <p className="text-base leading-7">Error responses:</p>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono overflow-auto">
                    <code>{`{
  "success": false,
  "error": "Invalid or unsupported output format"
}`}</code>
                  </pre>
                </CardContent>
              </Card>

              <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
              <p className="text-base leading-7">
                Using the Conversion API with JavaScript (Node.js):
              </p>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono overflow-auto">
                    <code>{`const formData = new FormData();
formData.append('file', fs.createReadStream('document.pdf'));
formData.append('outputFormat', 'docx');

fetch('https://api.mega-pdf.com/api/convert', {
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
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
