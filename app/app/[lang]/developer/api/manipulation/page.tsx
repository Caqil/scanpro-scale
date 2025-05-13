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
import { FilePlus, ArrowLeft } from "lucide-react";
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
          <Button size="lg" className="rounded-full">
            Get API Key <FilePlus className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="rounded-full" asChild>
            <Link href="/developer/api">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to API Documentation
            </Link>
          </Button>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="space-y-8">
        <Tabs defaultValue="merge" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 bg-muted/50 p-2 rounded-lg">
            <TabsTrigger value="merge" className="rounded-md">
              Merge API
            </TabsTrigger>
            <TabsTrigger value="compress" className="rounded-md" disabled>
              Compress API (Coming Soon)
            </TabsTrigger>
            <TabsTrigger value="split" className="rounded-md" disabled>
              Split API (Coming Soon)
            </TabsTrigger>
            <TabsTrigger value="rotate" className="rounded-md" disabled>
              Rotate API (Coming Soon)
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
                    <code>POST https://mega-pdf.com/api/merge</code>
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
https://mega-pdf.com/api/merge?api_key=your-api-key
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
                        <code>{`curl -X POST https://mega-pdf.com/api/merge \\
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
  "fileCount": 2
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

fetch('https://mega-pdf.com/api/merge', {
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

          {/* Placeholder Tabs for Other Tools */}
          <TabsContent value="compress">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">
                  Compress API
                </CardTitle>
                <CardDescription className="text-lg">
                  Coming Soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-7">
                  The Compress API will allow you to reduce the file size of
                  PDFs while maintaining quality. Check back soon for
                  documentation and availability.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="split">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">Split API</CardTitle>
                <CardDescription className="text-lg">
                  Coming Soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-7">
                  The Split API will enable splitting a PDF into multiple
                  documents based on page ranges or other criteria. Check back
                  soon for documentation and availability.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rotate">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">Rotate API</CardTitle>
                <CardDescription className="text-lg">
                  Coming Soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-7">
                  The Rotate API will allow rotating pages within a PDF
                  document. Check back soon for documentation and availability.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
