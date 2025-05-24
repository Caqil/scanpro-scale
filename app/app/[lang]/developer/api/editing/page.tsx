// For app/app/[lang]/developer/api/editing/page.tsx
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
import { PencilRuler, ArrowLeft, Pencil, FileText, KeySquareIcon } from "lucide-react";
import Link from "next/link";

export default function EditingApiPage() {
  return (
    <div className="container py-12 max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-6 bg-gradient-to-b from-background to-muted/50 py-12 rounded-lg">
        <div className="p-4 rounded-full bg-primary/10">
          <PencilRuler className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Editing API
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Add watermarks, page numbers, modify content, and enhance your PDF
          documents with powerful editing capabilities.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="default" size="lg" className="rounded-full" asChild>
          <Link href="/en/dashboard">
              <KeySquareIcon className="mr-2 h-5 w-15" /> Get API Key
            </Link>
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
        <Tabs defaultValue="watermark" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 bg-muted/50 rounded-lg">
            <TabsTrigger value="watermark" className="rounded-md">
              Watermark API
            </TabsTrigger>
            <TabsTrigger value="pagenumbers" className="rounded-md">
              Page Numbers API
            </TabsTrigger>
            <TabsTrigger value="removepages" className="rounded-md">
              Remove Pages API
            </TabsTrigger>
          </TabsList>

          {/* Watermark API Tab */}
          <TabsContent value="watermark">
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-bold">
                  Watermark API
                </CardTitle>
                <CardDescription className="text-lg">
                  Add text or image watermarks to PDF documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-base leading-7">
                    The Watermark API allows you to add text or image watermarks
                    to PDF documents. You can customize the position, opacity,
                    rotation, and other properties of the watermark for
                    branding, copyright protection, or document classification.
                  </p>

                  <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <code>POST https://api.mega-pdf.com/api/pdf/watermark</code>
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
                        <TableCell>PDF file to watermark (max 50MB)</TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>watermarkType</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Type of watermark: <code>text</code> or{" "}
                          <code>image</code>
                        </TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>text</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Text for watermark (required if watermarkType is text)
                        </TableCell>
                        <TableCell>Conditional</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>textColor</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Color for text watermark (hex format, e.g., #FF0000)
                        </TableCell>
                        <TableCell>No (default: #FF0000)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>fontSize</code>
                        </TableCell>
                        <TableCell>Integer</TableCell>
                        <TableCell>
                          Font size for text watermark (8-120)
                        </TableCell>
                        <TableCell>No (default: 48)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>fontFamily</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>Font family for text watermark</TableCell>
                        <TableCell>No (default: Helvetica)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>watermarkImage</code>
                        </TableCell>
                        <TableCell>File</TableCell>
                        <TableCell>
                          Image file for watermark (required if watermarkType is
                          image)
                        </TableCell>
                        <TableCell>Conditional</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>position</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Watermark position: center, top-left, top-right,
                          bottom-left, bottom-right, custom, tile
                        </TableCell>
                        <TableCell>No (default: center)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>rotation</code>
                        </TableCell>
                        <TableCell>Integer</TableCell>
                        <TableCell>Rotation angle (0-360 degrees)</TableCell>
                        <TableCell>No (default: 0)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>opacity</code>
                        </TableCell>
                        <TableCell>Integer</TableCell>
                        <TableCell>Watermark opacity (1-100)</TableCell>
                        <TableCell>No (default: 30)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>scale</code>
                        </TableCell>
                        <TableCell>Integer</TableCell>
                        <TableCell>
                          Image scale percentage (10-100, only for image
                          watermarks)
                        </TableCell>
                        <TableCell>No (default: 50)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>pages</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Pages to apply watermark to (all, even, odd, or
                          custom)
                        </TableCell>
                        <TableCell>No (default: all)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>customPages</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Custom page range (e.g., '1-3,5,7-9', required if
                          pages is custom)
                        </TableCell>
                        <TableCell>Conditional</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>customX</code>
                        </TableCell>
                        <TableCell>Integer</TableCell>
                        <TableCell>
                          Custom X position percentage (0-100, required if
                          position is custom)
                        </TableCell>
                        <TableCell>Conditional</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>customY</code>
                        </TableCell>
                        <TableCell>Integer</TableCell>
                        <TableCell>
                          Custom Y position percentage (0-100, required if
                          position is custom)
                        </TableCell>
                        <TableCell>Conditional</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h2 className="text-2xl font-semibold mt-8">
                    Example Request
                  </h2>
                  <p className="text-base leading-7">
                    Add a text watermark to a PDF using cURL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/watermark \\
  -H "x-api-key: your-api-key" \\
  -F "file=@/path/to/document.pdf" \\
  -F "watermarkType=text" \\
  -F "text=CONFIDENTIAL" \\
  -F "textColor=#FF0000" \\
  -F "fontSize=72" \\
  -F "opacity=30" \\
  -F "position=center" \\
  -F "rotation=45"
`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <p className="text-base leading-7 mt-4">
                    Add an image watermark to a PDF using cURL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/watermark \\
  -H "x-api-key: your-api-key" \\
  -F "file=@/path/to/document.pdf" \\
  -F "watermarkType=image" \\
  -F "watermarkImage=@/path/to/logo.png" \\
  -F "opacity=50" \\
  -F "position=bottom-right" \\
  -F "scale=30"
`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Response Format
                  </h2>
                  <p className="text-base leading-7">
                    Successful responses include the watermarked file URL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "message": "Watermark added to PDF successfully",
  "fileUrl": "/api/file?folder=watermarked&filename=uuid-watermarked.pdf",
  "filename": "uuid-watermarked.pdf",
  "originalName": "document.pdf",
  "fileSize": 1234567,
  "totalPages": 5,
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
  "error": "Text is required for text watermarks"
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
                  <p className="text-base leading-7">
                    Using the Watermark API with JavaScript:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`const formData = new FormData();
formData.append('file', fs.createReadStream('document.pdf'));
formData.append('watermarkType', 'text');
formData.append('text', 'DRAFT');
formData.append('textColor', '#0000FF'); // Blue
formData.append('fontSize', '60');
formData.append('opacity', '40');
formData.append('rotation', '30');
formData.append('position', 'center');
formData.append('pages', 'all');

fetch('https://api.mega-pdf.com/api/pdf/watermark', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Watermark added successfully:', data.fileUrl);
    } else {
      console.error('Failed to add watermark:', data.error);
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

          {/* Page Numbers API Tab */}
          <TabsContent value="pagenumbers">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">
                  Page Numbers API
                </CardTitle>
                <CardDescription className="text-lg">
                  Add page numbers to PDF documents with customizable formatting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-base leading-7">
                    The Page Numbers API allows you to add page numbers to PDF
                    documents. You can customize the position, format, font,
                    color, and other properties of the page numbers to match
                    your document style.
                  </p>

                  <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <code>
                      POST https://api.mega-pdf.com/api/pdf/add-page-numbers
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
                          PDF file to add page numbers to (max 50MB)
                        </TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>position</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Position: bottom-center, bottom-left, bottom-right,
                          top-center, top-left, top-right
                        </TableCell>
                        <TableCell>No (default: bottom-center)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>format</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Format: numeric, roman, alphabetic
                        </TableCell>
                        <TableCell>No (default: numeric)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>fontFamily</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>Font family for page numbers</TableCell>
                        <TableCell>No (default: Helvetica)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>fontSize</code>
                        </TableCell>
                        <TableCell>Integer</TableCell>
                        <TableCell>Font size for page numbers (1-72)</TableCell>
                        <TableCell>No (default: 12)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>color</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Color for page numbers (hex format, e.g., #000000)
                        </TableCell>
                        <TableCell>No (default: #000000)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>startNumber</code>
                        </TableCell>
                        <TableCell>Integer</TableCell>
                        <TableCell>Starting page number</TableCell>
                        <TableCell>No (default: 1)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>prefix</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Text to add before page number (e.g., "Page ")
                        </TableCell>
                        <TableCell>No (default: "")</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>suffix</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Text to add after page number (e.g., " of 10")
                        </TableCell>
                        <TableCell>No (default: "")</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>marginX</code>
                        </TableCell>
                        <TableCell>Integer</TableCell>
                        <TableCell>Horizontal margin in pixels</TableCell>
                        <TableCell>No (default: 40)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>marginY</code>
                        </TableCell>
                        <TableCell>Integer</TableCell>
                        <TableCell>Vertical margin in pixels</TableCell>
                        <TableCell>No (default: 30)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>selectedPages</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Pages to add numbers to (e.g., "1-3,5,7-9"), empty for
                          all pages
                        </TableCell>
                        <TableCell>No (default: all pages)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>skipFirstPage</code>
                        </TableCell>
                        <TableCell>Boolean</TableCell>
                        <TableCell>Whether to skip the first page</TableCell>
                        <TableCell>No (default: false)</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h2 className="text-2xl font-semibold mt-8">
                    Example Request
                  </h2>
                  <p className="text-base leading-7">
                    Add page numbers to a PDF using cURL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/add-page-numbers \\
  -H "x-api-key: your-api-key" \\
  -F "file=@/path/to/document.pdf" \\
  -F "position=bottom-center" \\
  -F "format=numeric" \\
  -F "prefix=Page " \\
  -F "suffix= of 10" \\
  -F "fontSize=12" \\
  -F "color=#000000" \\
  -F "skipFirstPage=true"
`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Response Format
                  </h2>
                  <p className="text-base leading-7">
                    Successful responses include the file URL with page numbers:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "message": "Page numbers added successfully",
  "fileUrl": "/api/file?folder=pagenumbers&filename=uuid-numbered.pdf",
  "fileName": "uuid-numbered.pdf",
  "originalName": "document.pdf",
  "totalPages": 10,
  "numberedPages": 9,
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
  "error": "Cannot skip first page when PDF has only one page"
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
                  <p className="text-base leading-7">
                    Using the Page Numbers API with JavaScript:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`const formData = new FormData();
formData.append('file', fs.createReadStream('document.pdf'));
formData.append('position', 'bottom-right');
formData.append('format', 'roman');
formData.append('fontSize', '14');
formData.append('color', '#0066CC');
formData.append('prefix', 'Page ');
formData.append('marginX', '50');
formData.append('marginY', '40');
formData.append('skipFirstPage', 'true');

fetch('https://api.mega-pdf.com/api/pdf/add-page-numbers', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Page numbers added successfully:', data.fileUrl);
      console.log('Total pages:', data.totalPages);
      console.log('Numbered pages:', data.numberedPages);
    } else {
      console.error('Failed to add page numbers:', data.error);
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

          {/* Remove Pages API Tab */}
          <TabsContent value="removepages">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">
                  Remove Pages API
                </CardTitle>
                <CardDescription className="text-lg">
                  Remove specific pages from PDF documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-base leading-7">
                    The Remove Pages API allows you to delete specific pages
                    from a PDF document. This is useful for removing unwanted
                    content, blank pages, or preparing documents for
                    distribution.
                  </p>

                  <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <code>
                      POST https://api.mega-pdf.com/api/pdf/remove-pages
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
                        <TableCell>PDF file to process (max 50MB)</TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>pagesToRemove</code>
                        </TableCell>
                        <TableCell>String (JSON array)</TableCell>
                        <TableCell>
                          JSON array of page numbers to remove (e.g., [1,3,5])
                        </TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h2 className="text-2xl font-semibold mt-8">
                    Example Request
                  </h2>
                  <p className="text-base leading-7">
                    Remove specific pages from a PDF using cURL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/remove-pages \\
  -H "x-api-key: your-api-key" \\
  -F "file=@/path/to/document.pdf" \\
  -F 'pagesToRemove=[1,3,5]'
`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Response Format
                  </h2>
                  <p className="text-base leading-7">
                    Successful responses include the processed file URL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "fileUrl": "/api/file?folder=processed&filename=uuid-output.pdf",
  "originalPages": 10,
  "removedPages": 3,
  "resultingPages": 7,
  "originalName": "document.pdf",
  "message": "Successfully removed 3 pages from PDF"
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
  "error": "Cannot remove all pages from PDF"
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
                  <p className="text-base leading-7">
                    Using the Remove Pages API with JavaScript:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`const formData = new FormData();
formData.append('file', fs.createReadStream('document.pdf'));
formData.append('pagesToRemove', JSON.stringify([1, 3, 5]));

fetch('https://api.mega-pdf.com/api/pdf/remove-pages', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Pages removed successfully');
      console.log('Original pages:', data.originalPages);
      console.log('Removed pages:', data.removedPages);
      console.log('Resulting pages:', data.resultingPages);
      console.log('Download URL:', data.fileUrl);
    } else {
      console.error('Failed to remove pages:', data.error);
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
