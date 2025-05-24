// For app/app/[lang]/developer/api/ocr/page.tsx
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

export default function OcrApiPage() {
  return (
    <div className="container py-12 max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-6 bg-gradient-to-b from-background to-muted/50 py-12 rounded-lg">
        <div className="p-4 rounded-full bg-primary/10">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          OCR API
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Extract text from scanned documents and images, create searchable
          PDFs, and make your content accessible with powerful OCR capabilities.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" className="rounded-full">
            Get API Key <FileText className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="rounded-full" asChild>
            <Link href="/en/developer/api">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to API Documentation
            </Link>
          </Button>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="space-y-8">
        <Tabs defaultValue="extract" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2 bg-muted/50 p-2 rounded-lg">
            <TabsTrigger value="extract" className="rounded-md">
              Text Extraction API
            </TabsTrigger>
            <TabsTrigger value="searchable" className="rounded-md">
              Searchable PDF API
            </TabsTrigger>
          </TabsList>

          {/* Text Extraction API Tab */}
          <TabsContent value="extract">
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-bold">
                  Text Extraction API
                </CardTitle>
                <CardDescription className="text-lg">
                  Extract text from scanned documents and images using OCR
                  technology
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-base leading-7">
                    The Text Extraction API uses Optical Character Recognition
                    (OCR) to extract text from scanned documents, images, and
                    non-searchable PDFs. This powerful feature converts visual
                    text content into machine-readable text that can be
                    searched, copied, and analyzed.
                  </p>

                  <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <code>
                      POST https://api.mega-pdf.com/api/pdf/extract-text
                    </code>
                  </div>

                  <h2 className="text-2xl font-semibold mt-8">
                    Authentication
                  </h2>
                  <p className="text-base leading-7">
                    Authenticate requests using an API key in the{" "}
                    <code>x-api-key</code> header.
                  </p>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <pre>
                      <code>{`// Header example
x-api-key: your-api-key
`}</code>
                    </pre>
                  </div>

                  <h2 className="text-2xl font-semibold mt-8">
                    Request Parameters
                  </h2>
                  <p className="text-base leading-7">
                    The API accepts <code>multipart/form-data</code> requests
                    with the following parameters:
                  </p>
                  <Table className="border rounded-md">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">
                          Parameter
                        </TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">
                          Description
                        </TableHead>
                        <TableHead className="font-semibold">
                          Required
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <code>file</code>
                        </TableCell>
                        <TableCell>File</TableCell>
                        <TableCell>
                          PDF file or image to extract text from (max 50MB)
                        </TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>language</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          OCR language code (e.g., 'eng' for English, 'fra' for
                          French)
                        </TableCell>
                        <TableCell>No (default: eng)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>outputFormat</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Output format: 'txt', 'json', 'xml', or 'html'
                        </TableCell>
                        <TableCell>No (default: txt)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>enhanceImages</code>
                        </TableCell>
                        <TableCell>Boolean</TableCell>
                        <TableCell>
                          Preprocess images to improve OCR accuracy
                        </TableCell>
                        <TableCell>No (default: false)</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h2 className="text-2xl font-semibold mt-8">
                    Example Request
                  </h2>
                  <p className="text-base leading-7">
                    Extract text from a scanned PDF using cURL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/extract-text \\
  -H "x-api-key: your-api-key" \\
  -F "file=@/path/to/scanned-document.pdf" \\
  -F "language=eng" \\
  -F "outputFormat=txt" \\
  -F "enhanceImages=true"
`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Response Format
                  </h2>
                  <p className="text-base leading-7">
                    Successful responses include the extracted text content:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "message": "Text extracted successfully",
  "fileUrl": "/api/file?folder=extracted&filename=uuid-extracted.txt",
  "filename": "uuid-extracted.txt",
  "originalName": "scanned-document.pdf",
  "pageCount": 5,
  "characterCount": 15230,
  "detectedLanguage": "English",
  "previewText": "This is a preview of the extracted text content...",
  "billing": {
    "usedFreeOperation": true,
    "freeOperationsRemaining": 9,
    "currentBalance": 10.50,
    "operationCost": 0.00
  }
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>
                  <p className="text-base leading-7">For JSON output format:</p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "message": "Text extracted successfully",
  "fileUrl": "/api/file?folder=extracted&filename=uuid-extracted.json",
  "filename": "uuid-extracted.json",
  "originalName": "scanned-document.pdf",
  "pageCount": 5,
  "data": {
    "pages": [
      {
        "pageNumber": 1,
        "text": "Content of page 1...",
        "blocks": [
          {
            "text": "Block of text",
            "bbox": [100, 200, 300, 250],
            "confidence": 0.95
          },
          // more text blocks...
        ]
      },
      // more pages...
    ]
  },
  "billing": {
    "usedFreeOperation": true,
    "freeOperationsRemaining": 9,
    "currentBalance": 10.50,
    "operationCost": 0.00
  }
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
  "error": "Failed to extract text: The document appears to be password protected"
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
                  <p className="text-base leading-7">
                    Using the Text Extraction API with JavaScript:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`const formData = new FormData();
formData.append('file', fs.createReadStream('scanned-document.pdf'));
formData.append('language', 'eng');
formData.append('outputFormat', 'json');
formData.append('enhanceImages', 'true');

fetch('https://api.mega-pdf.com/api/pdf/extract-text', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Text extracted successfully');
      console.log('Page count:', data.pageCount);
      console.log('Character count:', data.characterCount);
      console.log('Download URL:', data.fileUrl);
      
      // If using JSON output format, you can access the structured data
      if (data.data && data.data.pages) {
        data.data.pages.forEach(page => {
          console.log(\`Page \${page.pageNumber} content: \${page.text.substring(0, 100)}...\`);
        });
      }
    } else {
      console.error('Failed to extract text:', data.error);
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
          </TabsContent>

          {/* Searchable PDF API Tab */}
          <TabsContent value="searchable">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">
                  Searchable PDF API
                </CardTitle>
                <CardDescription className="text-lg">
                  Convert scanned documents to searchable PDFs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-base leading-7">
                    The Searchable PDF API converts scanned or image-based PDFs
                    into fully searchable PDFs by adding an invisible text layer
                    over the original document. This preserves the original
                    appearance while making the content searchable, selectable,
                    and accessible.
                  </p>

                  <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <code>
                      POST https://api.mega-pdf.com/api/pdf/make-searchable
                    </code>
                  </div>

                  <h2 className="text-2xl font-semibold mt-8">
                    Authentication
                  </h2>
                  <p className="text-base leading-7">
                    Authenticate requests using an API key in the{" "}
                    <code>x-api-key</code> header.
                  </p>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <pre>
                      <code>{`// Header example
x-api-key: your-api-key
`}</code>
                    </pre>
                  </div>

                  <h2 className="text-2xl font-semibold mt-8">
                    Request Parameters
                  </h2>
                  <p className="text-base leading-7">
                    The API accepts <code>multipart/form-data</code> requests
                    with the following parameters:
                  </p>
                  <Table className="border rounded-md">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">
                          Parameter
                        </TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">
                          Description
                        </TableHead>
                        <TableHead className="font-semibold">
                          Required
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <code>file</code>
                        </TableCell>
                        <TableCell>File</TableCell>
                        <TableCell>
                          PDF file to make searchable (max 50MB)
                        </TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>language</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          OCR language code (e.g., 'eng' for English, 'fra' for
                          French)
                        </TableCell>
                        <TableCell>No (default: eng)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>enhanceImages</code>
                        </TableCell>
                        <TableCell>Boolean</TableCell>
                        <TableCell>
                          Preprocess images to improve OCR accuracy
                        </TableCell>
                        <TableCell>No (default: false)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>ocrDpi</code>
                        </TableCell>
                        <TableCell>Integer</TableCell>
                        <TableCell>
                          DPI for OCR processing (higher values for better
                          quality)
                        </TableCell>
                        <TableCell>No (default: 300)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>skipTextPages</code>
                        </TableCell>
                        <TableCell>Boolean</TableCell>
                        <TableCell>
                          Skip pages that already contain text
                        </TableCell>
                        <TableCell>No (default: true)</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h2 className="text-2xl font-semibold mt-8">
                    Example Request
                  </h2>
                  <p className="text-base leading-7">
                    Make a PDF searchable using cURL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/make-searchable \\
  -H "x-api-key: your-api-key" \\
  -F "file=@/path/to/scanned-document.pdf" \\
  -F "language=eng" \\
  -F "enhanceImages=true" \\
  -F "ocrDpi=300"
`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Response Format
                  </h2>
                  <p className="text-base leading-7">
                    Successful responses include the searchable PDF URL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "message": "PDF made searchable successfully",
  "fileUrl": "/api/file?folder=searchable&filename=uuid-searchable.pdf",
  "filename": "uuid-searchable.pdf",
  "originalName": "scanned-document.pdf",
  "pageCount": 5,
  "processedPages": 5,
  "alreadyTextPages": 0,
  "billing": {
    "usedFreeOperation": true,
    "freeOperationsRemaining": 9,
    "currentBalance": 10.50,
    "operationCost": 0.00
  }
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
  "error": "Failed to process PDF: The document is already fully searchable"
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
                  <p className="text-base leading-7">
                    Using the Searchable PDF API with JavaScript:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`const formData = new FormData();
formData.append('file', fs.createReadStream('scanned-document.pdf'));
formData.append('language', 'eng');
formData.append('enhanceImages', 'true');
formData.append('ocrDpi', '300');
formData.append('skipTextPages', 'true');

fetch('https://api.mega-pdf.com/api/pdf/make-searchable', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('PDF made searchable successfully');
      console.log('Total pages:', data.pageCount);
      console.log('Processed pages:', data.processedPages);
      console.log('Pages already with text:', data.alreadyTextPages);
      console.log('Download URL:', data.fileUrl);
    } else {
      console.error('Failed to make PDF searchable:', data.error);
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
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
