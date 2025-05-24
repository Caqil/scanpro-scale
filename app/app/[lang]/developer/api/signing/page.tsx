// For app/app/[lang]/developer/api/signing/page.tsx
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
import { PenSquare, ArrowLeft, FileSignature } from "lucide-react";
import Link from "next/link";

export default function SigningApiPage() {
  return (
    <div className="container py-12 max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-6 bg-gradient-to-b from-background to-muted/50 py-12 rounded-lg">
        <div className="p-4 rounded-full bg-primary/10">
          <FileSignature className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          PDF Signing API
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Add signatures to PDF documents with precise positioning and
          customization options for enhanced document workflow.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" className="rounded-full">
            Get API Key <FileSignature className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="rounded-full" asChild>
            <Link href="/en/developer/api">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to API Documentation
            </Link>
          </Button>
        </div>
      </section>

      {/* API Details Section */}
      <section className="space-y-8">
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold">Sign PDF API</CardTitle>
            <CardDescription className="text-lg">
              Add signature images to PDF documents with customizable
              positioning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-base leading-7">
                The Sign PDF API allows you to add signature images to PDF
                documents. You can specify the page, position, and scale of the
                signature for professional document finalization. This is ideal
                for adding signatures to contracts, agreements, and other
                business documents.
              </p>

              <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
              <div className="bg-muted p-4 rounded-md font-mono text-sm">
                <code>POST https://api.mega-pdf.com/api/pdf/sign</code>
              </div>

              <h2 className="text-2xl font-semibold mt-8">Authentication</h2>
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
                    <TableCell>PDF file to sign (max 50MB)</TableCell>
                    <TableCell>Yes</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <code>signature</code>
                    </TableCell>
                    <TableCell>File</TableCell>
                    <TableCell>Signature image file (PNG or JPG)</TableCell>
                    <TableCell>Yes</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <code>page</code>
                    </TableCell>
                    <TableCell>String</TableCell>
                    <TableCell>
                      Page number to add signature (default: 1)
                    </TableCell>
                    <TableCell>No</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <code>position</code>
                    </TableCell>
                    <TableCell>String</TableCell>
                    <TableCell>
                      Position on page: center, bl (bottom-left), br
                      (bottom-right), tl (top-left), tr (top-right)
                    </TableCell>
                    <TableCell>No (default: center)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <code>scale</code>
                    </TableCell>
                    <TableCell>Number</TableCell>
                    <TableCell>Scale factor for signature</TableCell>
                    <TableCell>No (default: 0.3)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <h2 className="text-2xl font-semibold mt-8">Example Request</h2>
              <p className="text-base leading-7">
                Add a signature to a PDF using cURL:
              </p>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono overflow-auto">
                    <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/sign \\
  -H "x-api-key: your-api-key" \\
  -F "file=@/path/to/document.pdf" \\
  -F "signature=@/path/to/signature.png" \\
  -F "page=1" \\
  -F "position=br" \\
  -F "scale=0.4"
`}</code>
                  </pre>
                </CardContent>
              </Card>

              <h2 className="text-2xl font-semibold mt-8">Response Format</h2>
              <p className="text-base leading-7">
                Successful responses include the signed PDF file URL:
              </p>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono overflow-auto">
                    <code>{`{
  "success": true,
  "message": "PDF signed successfully",
  "fileUrl": "/api/file?folder=signatures&filename=uuid-signed.pdf",
  "filename": "uuid-signed.pdf",
  "originalName": "document.pdf"
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
  "error": "Signature must be PNG or JPG image"
}`}</code>
                  </pre>
                </CardContent>
              </Card>

              <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
              <p className="text-base leading-7">
                Using the Sign PDF API with JavaScript:
              </p>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono overflow-auto">
                    <code>{`const formData = new FormData();
formData.append('file', fs.createReadStream('document.pdf'));
formData.append('signature', fs.createReadStream('signature.png'));
formData.append('page', '2'); // Sign page 2
formData.append('position', 'br'); // Bottom right
formData.append('scale', '0.35');

fetch('https://api.mega-pdf.com/api/pdf/sign', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('PDF signed successfully:', data.fileUrl);
    } else {
      console.error('Failed to sign PDF:', data.error);
    }
  })
  .catch(error => console.error('Error:', error));
`}</code>
                  </pre>
                </CardContent>
              </Card>

              <h2 className="text-2xl font-semibold mt-8">
                Supported Signature Formats
              </h2>
              <p className="text-base leading-7">
                The API supports the following signature image formats:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-base leading-7">
                <li>
                  PNG (.png) - Recommended for best quality with transparency
                </li>
                <li>
                  JPEG/JPG (.jpg, .jpeg) - Good for photos without transparency
                </li>
              </ul>
              <p className="text-base leading-7 mt-4">
                For best results, use a transparent PNG with a clean background
                for your signature. This ensures the signature appears naturally
                on the document without covering important content with a white
                background.
              </p>

              <h2 className="text-2xl font-semibold mt-8">Position Options</h2>
              <p className="text-base leading-7">
                The <code>position</code> parameter accepts the following
                values:
              </p>
              <Table className="border rounded-md mt-4">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Value</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <code>center</code>
                    </TableCell>
                    <TableCell>Center of the page</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <code>bl</code>
                    </TableCell>
                    <TableCell>Bottom-left corner</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <code>br</code>
                    </TableCell>
                    <TableCell>Bottom-right corner</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <code>tl</code>
                    </TableCell>
                    <TableCell>Top-left corner</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <code>tr</code>
                    </TableCell>
                    <TableCell>Top-right corner</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-base leading-7 mt-4">
                The API automatically adds appropriate margins from the edges
                when using corner positions.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
