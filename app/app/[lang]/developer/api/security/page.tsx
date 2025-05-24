// For app/app/[lang]/developer/api/security/page.tsx
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
import { Lock, UnlockIcon, ArrowLeft, KeySquareIcon } from "lucide-react";
import Link from "next/link";

export default function SecurityApiPage() {
  return (
    <div className="container py-12 max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-6 bg-gradient-to-b from-background to-muted/50 py-12 rounded-lg">
        <div className="p-4 rounded-full bg-primary/10">
          <Lock className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Security API
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Add password protection, remove restrictions, and secure your PDF
          documents with enterprise-grade encryption.
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
        <Tabs defaultValue="protect" className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-2 bg-muted/50 rounded-lg">
            <TabsTrigger value="protect" className="rounded-md">
              Protect API
            </TabsTrigger>
            <TabsTrigger value="unlock" className="rounded-md">
              Unlock API
            </TabsTrigger>
          </TabsList>

          {/* Protect API Tab */}
          <TabsContent value="protect">
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-bold">
                  Protect API
                </CardTitle>
                <CardDescription className="text-lg">
                  Add password protection and permission restrictions to PDF
                  documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-base leading-7">
                    The Protect API allows you to secure PDF documents with
                    password protection and control permissions like printing,
                    copying, and editing. This helps you safeguard sensitive
                    information and control how recipients can interact with
                    your documents.
                  </p>

                  <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <code>POST https://api.mega-pdf.com/api/pdf/protect</code>
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
                        <TableCell>PDF file to protect (max 50MB)</TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>password</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Password to set for the PDF (minimum 4 characters)
                        </TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>permission</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Permission level: <code>restricted</code> (apply
                          specific permissions) or <code>all</code> (grant all
                          permissions)
                        </TableCell>
                        <TableCell>No (default: restricted)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>allowPrinting</code>
                        </TableCell>
                        <TableCell>Boolean</TableCell>
                        <TableCell>Allow document printing</TableCell>
                        <TableCell>No (default: false)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>allowCopying</code>
                        </TableCell>
                        <TableCell>Boolean</TableCell>
                        <TableCell>Allow content copying</TableCell>
                        <TableCell>No (default: false)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>allowEditing</code>
                        </TableCell>
                        <TableCell>Boolean</TableCell>
                        <TableCell>Allow content editing</TableCell>
                        <TableCell>No (default: false)</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h2 className="text-2xl font-semibold mt-8">
                    Example Request
                  </h2>
                  <p className="text-base leading-7">
                    Add password protection to a PDF with restricted permissions
                    using cURL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/protect \\
  -H "x-api-key: your-api-key" \\
  -F "file=@/path/to/document.pdf" \\
  -F "password=SecureP@ssword" \\
  -F "permission=restricted" \\
  -F "allowPrinting=true"
`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Response Format
                  </h2>
                  <p className="text-base leading-7">
                    Successful responses include the protected file URL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "message": "PDF protected with password successfully",
  "fileUrl": "/api/file?folder=protected&filename=uuid-protected.pdf",
  "filename": "uuid-protected.pdf",
  "originalName": "document.pdf",
  "methodUsed": "pdfcpu",
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
  "error": "Password must be at least 4 characters"
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
                  <p className="text-base leading-7">
                    Using the Protect API with JavaScript:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`const formData = new FormData();
formData.append('file', fs.createReadStream('document.pdf'));
formData.append('password', 'SecureP@ssword');
formData.append('permission', 'all'); // Grant all permissions

fetch('https://api.mega-pdf.com/api/pdf/protect', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('PDF protection successful:', data.fileUrl);
    } else {
      console.error('Protection failed:', data.error);
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

          {/* Unlock API Tab */}
          <TabsContent value="unlock">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">Unlock API</CardTitle>
                <CardDescription className="text-lg">
                  Remove password protection from PDF documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-base leading-7">
                    The Unlock API allows you to remove password protection from
                    PDF documents. This is useful for removing restrictions from
                    password-protected files when you have the correct password.
                  </p>

                  <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <code>POST https://api.mega-pdf.com/api/pdf/unlock</code>
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
                          Password-protected PDF file to unlock (max 50MB)
                        </TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>password</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>Current password for the PDF</TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h2 className="text-2xl font-semibold mt-8">
                    Example Request
                  </h2>
                  <p className="text-base leading-7">
                    Unlock a password-protected PDF using cURL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/unlock \\
  -H "x-api-key: your-api-key" \\
  -F "file=@/path/to/protected-document.pdf" \\
  -F "password=YourPassword"
`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Response Format
                  </h2>
                  <p className="text-base leading-7">
                    Successful responses include the unlocked file URL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "message": "PDF unlocked successfully",
  "fileUrl": "/api/file?folder=unlocked&filename=uuid-unlocked.pdf",
  "filename": "uuid-unlocked.pdf",
  "originalName": "protected-document.pdf",
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
  "error": "Failed to unlock PDF. The password may be incorrect: [error details]"
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
                  <p className="text-base leading-7">
                    Using the Unlock API with JavaScript:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`const formData = new FormData();
formData.append('file', fs.createReadStream('protected-document.pdf'));
formData.append('password', 'YourPassword');

fetch('https://api.mega-pdf.com/api/pdf/unlock', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('PDF unlocked successfully:', data.fileUrl);
    } else {
      console.error('Failed to unlock PDF:', data.error);
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
