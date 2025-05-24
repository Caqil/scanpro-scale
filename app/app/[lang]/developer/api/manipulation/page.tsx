// For app/app/[lang]/developer/api/manipulation/page.tsx
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
import { FilePlus, ArrowLeft, KeySquareIcon } from "lucide-react";
import Link from "next/link";

export default function ManipulationApiPage() {
  return (
    <div className="container py-12 max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-6 bg-gradient-to-b from-background to-muted/50 py-12 rounded-lg">
        <div className="p-4 rounded-full bg-primary/10">
          <FilePlus className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Manipulation API
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Merge, split, compress, rotate, and modify PDFs with simple API calls
          to enhance your document processing workflows.
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
        <Tabs defaultValue="merge" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 gap-2 bg-muted/50 rounded-lg">
            <TabsTrigger value="merge" className="rounded-md">
              Merge API
            </TabsTrigger>
            <TabsTrigger value="compress" className="rounded-md">
              Compress API
            </TabsTrigger>
            <TabsTrigger value="split" className="rounded-md">
              Split API
            </TabsTrigger>
            <TabsTrigger value="rotate" className="rounded-md">
              Rotate API
            </TabsTrigger>
          </TabsList>

          {/* Merge API Tab */}
          <TabsContent value="merge">
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-bold">Merge API</CardTitle>
                <CardDescription className="text-lg">
                  Combine multiple PDFs into a single document with customizable
                  order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-base leading-7">
                    The Merge API allows you to combine multiple PDF files into
                    a single PDF document. You can specify the order of the
                    files, and the API handles large merges efficiently using a
                    staged approach for more than 10 files.
                  </p>

                  <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <code>POST https://api.mega-pdf.com/api/pdf/merge</code>
                  </div>

                  <h2 className="text-2xl font-semibold mt-8">
                    Authentication
                  </h2>
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
https://api.mega-pdf.com/api/pdf/merge?api_key=your-api-key
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
                          <code>files</code>
                        </TableCell>
                        <TableCell>File[]</TableCell>
                        <TableCell>
                          Array of PDF files to merge (minimum 2 files)
                        </TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>order</code>
                        </TableCell>
                        <TableCell>String (JSON array)</TableCell>
                        <TableCell>
                          Array of indices specifying the merge order (e.g.,{" "}
                          <code>[0, 1, 2]</code>)
                        </TableCell>
                        <TableCell>No</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h2 className="text-2xl font-semibold mt-8">
                    Example Request
                  </h2>
                  <p className="text-base leading-7">
                    Merge two PDFs using cURL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/merge \\
  -H "x-api-key: your-api-key" \\
  -F "files=@/path/to/doc1.pdf" \\
  -F "files=@/path/to/doc2.pdf" \\
  -F "order=[0,1]"
`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Response Format
                  </h2>
                  <p className="text-base leading-7">
                    Successful responses include the merged file URL and
                    metadata:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "message": "PDF merge successful",
  "fileUrl": "/api/file?folder=merges&filename=uuid-merged.pdf",
  "filename": "uuid-merged.pdf",
  "mergedSize": 1234567,
  "totalInputSize": 2345678,
  "fileCount": 2,
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
  "error": "At least two PDF files are required for merging"
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
                  <p className="text-base leading-7">
                    Using the Merge API with JavaScript (Node.js):
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`const formData = new FormData();
formData.append('files', fs.createReadStream('doc1.pdf'));
formData.append('files', fs.createReadStream('doc2.pdf'));
formData.append('order', JSON.stringify([0, 1]));

fetch('https://api.mega-pdf.com/api/pdf/merge', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Merge successful:', data.fileUrl);
    } else {
      console.error('Merge failed:', data.error);
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

          {/* Compress API Tab */}
          <TabsContent value="compress">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">
                  Compress API
                </CardTitle>
                <CardDescription className="text-lg">
                  Reduce PDF file size while maintaining quality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-base leading-7">
                    The Compress API allows you to reduce the file size of PDFs
                    while preserving quality. This is useful for sharing,
                    storing, or uploading large PDF files.
                  </p>

                  <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <code>POST https://api.mega-pdf.com/api/pdf/compress</code>
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
                        <TableCell>PDF file to compress (max 50MB)</TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h2 className="text-2xl font-semibold mt-8">
                    Example Request
                  </h2>
                  <p className="text-base leading-7">
                    Compress a PDF using cURL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/compress \\
  -H "x-api-key: your-api-key" \\
  -F "file=@/path/to/document.pdf"
`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Response Format
                  </h2>
                  <p className="text-base leading-7">
                    Successful responses include the compressed file URL and
                    compression statistics:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "message": "PDF compression successful with 75.20% reduction",
  "fileUrl": "/api/file?folder=compressions&filename=uuid-compressed.pdf",
  "filename": "uuid-compressed.pdf",
  "originalName": "document.pdf",
  "originalSize": 2345678,
  "compressedSize": 582749,
  "compressionRatio": "75.20%",
  "billing": {
    "currentBalance": 10.50,
    "freeOperationsRemaining": 9,
    "operationCost": 0.00,
    "usedFreeOperation": true
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
  "error": "Failed to compress PDF: Invalid file format"
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
                  <p className="text-base leading-7">
                    Using the Compress API with JavaScript:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`const formData = new FormData();
formData.append('file', fs.createReadStream('document.pdf'));

fetch('https://api.mega-pdf.com/api/pdf/compress', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Compression successful:');
      console.log('File URL:', data.fileUrl);
      console.log('Original size:', data.originalSize, 'bytes');
      console.log('Compressed size:', data.compressedSize, 'bytes');
      console.log('Compression ratio:', data.compressionRatio);
    } else {
      console.error('Compression failed:', data.error);
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

          {/* Split API Tab */}
          <TabsContent value="split">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">Split API</CardTitle>
                <CardDescription className="text-lg">
                  Divide a PDF into multiple documents based on various criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-base leading-7">
                    The Split API enables you to divide a PDF document into
                    multiple separate PDF files. You can split by page ranges,
                    extract specific pages, or split every N pages
                    automatically.
                  </p>

                  <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <code>POST https://api.mega-pdf.com/api/pdf/split</code>
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
                        <TableCell>PDF file to split (max 50MB)</TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>splitMethod</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Split method: <code>range</code>, <code>extract</code>
                          , or <code>every</code>
                        </TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>pageRanges</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Page ranges for splitting (e.g.,{" "}
                          <code>1-3,4,5-7</code>)
                        </TableCell>
                        <TableCell>
                          Required if splitMethod is "range"
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>everyNPages</code>
                        </TableCell>
                        <TableCell>Integer</TableCell>
                        <TableCell>Split every N pages</TableCell>
                        <TableCell>
                          Required if splitMethod is "every"
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h2 className="text-2xl font-semibold mt-8">
                    Example Request
                  </h2>
                  <p className="text-base leading-7">
                    Split a PDF by page ranges using cURL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/split \\
  -H "x-api-key: your-api-key" \\
  -F "file=@/path/to/document.pdf" \\
  -F "splitMethod=range" \\
  -F "pageRanges=1-3,5,7-9"
`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Response Format
                  </h2>
                  <p className="text-base leading-7">
                    For small jobs that complete immediately, the response
                    includes all split files:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "message": "PDF split into 3 files",
  "originalName": "document.pdf",
  "totalPages": 15,
  "splitParts": [
    {
      "fileUrl": "/api/file?folder=splits&filename=uuid-split-1.pdf",
      "filename": "uuid-split-1.pdf",
      "pages": [1, 2, 3],
      "pageCount": 3
    },
    {
      "fileUrl": "/api/file?folder=splits&filename=uuid-split-2.pdf",
      "filename": "uuid-split-2.pdf",
      "pages": [5],
      "pageCount": 1
    },
    {
      "fileUrl": "/api/file?folder=splits&filename=uuid-split-3.pdf",
      "filename": "uuid-split-3.pdf",
      "pages": [7, 8, 9],
      "pageCount": 3
    }
  ],
  "isLargeJob": false
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>
                  <p className="text-base leading-7">
                    For large jobs, processing happens in the background:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "message": "PDF splitting started",
  "jobId": "uuid-job-identifier",
  "statusUrl": "/api/pdf/split/status?id=uuid-job-identifier",
  "originalName": "document.pdf",
  "totalPages": 150,
  "estimatedSplits": 25,
  "isLargeJob": true
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>
                  <p className="text-base leading-7">Job status response:</p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "id": "uuid-job-identifier",
  "status": "processing", // or "completed", "error"
  "progress": 75,
  "total": 25,
  "completed": 18,
  "results": [
    {
      "fileUrl": "/api/file?folder=splits&filename=uuid-split-1.pdf",
      "filename": "uuid-split-1.pdf",
      "pages": [1, 2, 3],
      "pageCount": 3
    },
    // more split files...
  ],
  "error": null
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
                  <p className="text-base leading-7">
                    Using the Split API with JavaScript:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`const formData = new FormData();
formData.append('file', fs.createReadStream('document.pdf'));
formData.append('splitMethod', 'every');
formData.append('everyNPages', '5');

fetch('https://api.mega-pdf.com/api/pdf/split', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      if (data.isLargeJob) {
        console.log('Large job started, check status at:', data.statusUrl);
        // Poll status endpoint for results
        checkJobStatus(data.statusUrl);
      } else {
        console.log('PDF split successfully into', data.splitParts.length, 'files');
        // Process the split parts
        data.splitParts.forEach(part => {
          console.log('Part with pages', part.pages, 'available at', part.fileUrl);
        });
      }
    } else {
      console.error('Split failed:', data.error);
    }
  })
  .catch(error => console.error('Error:', error));

// Function to poll job status for large jobs
function checkJobStatus(statusUrl) {
  fetch('https://mega-pdf.com' + statusUrl)
    .then(response => response.json())
    .then(status => {
      console.log('Job progress:', status.progress + '%');
      
      if (status.status === 'completed') {
        console.log('Job completed!', status.results.length, 'files created');
      } else if (status.status === 'error') {
        console.error('Job failed:', status.error);
      } else {
        // Still processing, poll again after a delay
        setTimeout(() => checkJobStatus(statusUrl), 2000);
      }
    });
}
`}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rotate API Tab */}
          <TabsContent value="rotate">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">Rotate API</CardTitle>
                <CardDescription className="text-lg">
                  Rotate pages in a PDF document by a specified angle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-base leading-7">
                    The Rotate API allows you to rotate pages in a PDF document
                    by a specified angle (90, 180, or 270 degrees). You can
                    rotate all pages or specify specific pages to rotate.
                  </p>

                  <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <code>POST https://api.mega-pdf.com/api/pdf/rotate</code>
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
                        <TableCell>PDF file to rotate (max 50MB)</TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>angle</code>
                        </TableCell>
                        <TableCell>Integer</TableCell>
                        <TableCell>
                          Rotation angle in degrees (90, 180, or 270)
                        </TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>pages</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Pages to rotate (e.g., <code>1-3,5,7-9</code>), empty
                          for all pages
                        </TableCell>
                        <TableCell>No (default: all)</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h2 className="text-2xl font-semibold mt-8">
                    Example Request
                  </h2>
                  <p className="text-base leading-7">
                    Rotate specific pages in a PDF using cURL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/rotate \\
  -H "x-api-key: your-api-key" \\
  -F "file=@/path/to/document.pdf" \\
  -F "angle=90" \\
  -F "pages=1-3,5"
`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Response Format
                  </h2>
                  <p className="text-base leading-7">
                    Successful responses include the rotated file URL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "message": "PDF rotated by 90 degrees successfully",
  "fileUrl": "/api/file?folder=rotations&filename=uuid-rotated.pdf",
  "filename": "uuid-rotated.pdf",
  "originalName": "document.pdf",
  "billing": {
    "currentBalance": 10.50,
    "freeOperationsRemaining": 9,
    "operationCost": 0.00,
    "usedFreeOperation": true
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
  "error": "Invalid rotation angle. Must be 90, 180, or 270 degrees"
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
                  <p className="text-base leading-7">
                    Using the Rotate API with JavaScript:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`const formData = new FormData();
formData.append('file', fs.createReadStream('document.pdf'));
formData.append('angle', '180');
// Rotate all pages by not specifying the pages parameter

fetch('https://api.mega-pdf.com/api/pdf/rotate', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Rotation successful:', data.fileUrl);
    } else {
      console.error('Rotation failed:', data.error);
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
