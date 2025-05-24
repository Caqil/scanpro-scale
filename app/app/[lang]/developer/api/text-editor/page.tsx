// For app/app/[lang]/developer/api/text-editor/page.tsx
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
import { Pencil, ArrowLeft, Type, ImageIcon } from "lucide-react";
import Link from "next/link";

export default function TextEditorApiPage() {
  return (
    <div className="container py-12 max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-6 bg-gradient-to-b from-background to-muted/50 py-12 rounded-lg">
        <div className="p-4 rounded-full bg-primary/10">
          <Type className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          PDF Text Editor API
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Extract, edit, and update text content in PDF documents with powerful
          text editing capabilities while preserving layout and images.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" className="rounded-full">
            Get API Key <Type className="ml-2 h-5 w-5" />
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
              Extract Content API
            </TabsTrigger>
            <TabsTrigger value="save" className="rounded-md">
              Save Edited Text API
            </TabsTrigger>
          </TabsList>

          {/* Extract Content API Tab */}
          <TabsContent value="extract">
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-bold">
                  Extract Content API
                </CardTitle>
                <CardDescription className="text-lg">
                  Extract text blocks and images from PDF documents for editing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-base leading-7">
                    The Extract Content API extracts text blocks and images from
                    PDF documents with precise positioning information. This
                    enables you to create a rich editing experience that
                    maintains the original document layout and allows targeted
                    text modifications.
                  </p>

                  <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <code>POST https://api.mega-pdf.com/api/pdf/extract-text</code>
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
                          PDF file to extract content from (max 50MB)
                        </TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h2 className="text-2xl font-semibold mt-8">
                    Example Request
                  </h2>
                  <p className="text-base leading-7">
                    Extract content from a PDF using cURL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/extract-text \\
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
                    Successful responses include detailed text and image content
                    with positioning:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "message": "Content extracted successfully from 3 pages with 125 text blocks and 4 images",
  "extractedData": {
    "pages": [
      {
        "page_number": 1,
        "width": 612,
        "height": 792,
        "texts": [
          {
            "text": "Sample document title",
            "x0": 100.5,
            "y0": 50.2,
            "x1": 400.8,
            "y1": 75.3,
            "font": "Helvetica-Bold",
            "size": 18.0,
            "color": 0
          },
          // More text blocks...
        ],
        "images": [
          {
            "x0": 50.0,
            "y0": 100.0,
            "x1": 250.0,
            "y1": 300.0,
            "width": 200.0,
            "height": 200.0,
            "image_data": "base64-encoded-image-data...",
            "format": "jpeg",
            "image_id": "session_id_page1_img0"
          },
          // More images...
        ]
      },
      // More pages...
    ],
    "metadata": {
      "total_pages": 3,
      "total_text_blocks": 125,
      "total_images": 4,
      "extraction_method": "PyMuPDF Enhanced with Images"
    }
  },
  "sessionId": "unique-session-identifier",
  "originalName": "document.pdf",
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
  "error": "No content found in the PDF. The PDF may be empty or password protected."
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Data Structure
                  </h2>
                  <p className="text-base leading-7">
                    The response includes detailed information about each text
                    block and image:
                  </p>
                  <h3 className="text-xl font-semibold mt-6">
                    Text Block Properties
                  </h3>
                  <Table className="border rounded-md">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">
                          Property
                        </TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">
                          Description
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <code>text</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>The actual text content</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>x0</code>, <code>y0</code>
                        </TableCell>
                        <TableCell>Float</TableCell>
                        <TableCell>Top-left corner coordinates</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>x1</code>, <code>y1</code>
                        </TableCell>
                        <TableCell>Float</TableCell>
                        <TableCell>Bottom-right corner coordinates</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>font</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>Font family name</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>size</code>
                        </TableCell>
                        <TableCell>Float</TableCell>
                        <TableCell>Font size in points</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>color</code>
                        </TableCell>
                        <TableCell>Integer</TableCell>
                        <TableCell>RGB color value as an integer</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h3 className="text-xl font-semibold mt-6">
                    Image Properties
                  </h3>
                  <Table className="border rounded-md">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">
                          Property
                        </TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">
                          Description
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <code>x0</code>, <code>y0</code>
                        </TableCell>
                        <TableCell>Float</TableCell>
                        <TableCell>Top-left corner coordinates</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>x1</code>, <code>y1</code>
                        </TableCell>
                        <TableCell>Float</TableCell>
                        <TableCell>Bottom-right corner coordinates</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>width</code>, <code>height</code>
                        </TableCell>
                        <TableCell>Float</TableCell>
                        <TableCell>Image dimensions in points</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>image_data</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>Base64-encoded image data</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>format</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>Image format (jpeg, png, etc.)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>image_id</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>Unique identifier for the image</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
                  <p className="text-base leading-7">
                    Using the Extract Content API with JavaScript:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`const formData = new FormData();
formData.append('file', fs.createReadStream('document.pdf'));

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
      console.log('Content extracted successfully');
      console.log('Total pages:', data.extractedData.metadata.total_pages);
      console.log('Total text blocks:', data.extractedData.metadata.total_text_blocks);
      console.log('Total images:', data.extractedData.metadata.total_images);
      
      // Store the session ID for later use when saving edits
      const sessionId = data.sessionId;
      
      // Process the extracted data
      data.extractedData.pages.forEach(page => {
        console.log(\`Page \${page.page_number} has \${page.texts.length} text blocks and \${page.images?.length || 0} images\`);
        
        // Access text blocks for editing
        page.texts.forEach(textBlock => {
          console.log(\`Text: "\${textBlock.text.substring(0, 50)}..."\`);
          console.log(\`Position: (\${textBlock.x0}, \${textBlock.y0}) to (\${textBlock.x1}, \${textBlock.y1})\`);
          console.log(\`Font: \${textBlock.font} at \${textBlock.size}pt\`);
        });
      });
    } else {
      console.error('Failed to extract content:', data.error);
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

          {/* Save Edited Text API Tab */}
          <TabsContent value="save">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">
                  Save Edited Text API
                </CardTitle>
                <CardDescription className="text-lg">
                  Create a new PDF with your edited text changes while
                  preserving layout and images
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-base leading-7">
                    The Save Edited Text API creates a new PDF document with
                    your text edits while maintaining the original layout,
                    fonts, and preserving all images. This API works in
                    conjunction with the Extract Content API to provide a
                    complete text editing workflow.
                  </p>

                  <h2 className="text-2xl font-semibold mt-8">Endpoint</h2>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm">
                    <code>
                      POST https://api.mega-pdf.com/api/pdf/save-edited-text
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
                          <code>sessionId</code>
                        </TableCell>
                        <TableCell>String</TableCell>
                        <TableCell>
                          Session ID from the extract content API response
                        </TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <code>editedData</code>
                        </TableCell>
                        <TableCell>String (JSON)</TableCell>
                        <TableCell>
                          JSON string containing the edited content structure
                          with text changes
                        </TableCell>
                        <TableCell>Yes</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h2 className="text-2xl font-semibold mt-8">
                    Example Request
                  </h2>
                  <p className="text-base leading-7">
                    Save edited text to create a new PDF using cURL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`curl -X POST https://api.mega-pdf.com/api/pdf/save-edited-text \\
  -H "x-api-key: your-api-key" \\
  -F "sessionId=unique-session-identifier" \\
  -F 'editedData={"pages":[{"page_number":1,"width":612,"height":792,"texts":[{"text":"Modified title text","x0":100.5,"y0":50.2,"x1":400.8,"y1":75.3,"font":"Helvetica-Bold","size":18.0,"color":0}],"images":[...]}]}'
`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Response Format
                  </h2>
                  <p className="text-base leading-7">
                    Successful responses include the edited PDF file URL:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`{
  "success": true,
  "message": "PDF saved successfully with improved spacing and preserved images",
  "fileUrl": "/api/file?folder=edited&filename=unique-session-identifier-edited.pdf",
  "filename": "unique-session-identifier-edited.pdf",
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
  "error": "Invalid edited data format: unexpected end of JSON input"
}`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Editing Workflow
                  </h2>
                  <p className="text-base leading-7">
                    The complete PDF text editing workflow consists of these
                    steps:
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-base leading-7">
                    <li>
                      Extract text and images using the Extract Content API
                    </li>
                    <li>Modify text content in the extracted data structure</li>
                    <li>Send the modified data to the Save Edited Text API</li>
                    <li>Download the resulting PDF with your text changes</li>
                  </ol>
                  <p className="text-base leading-7 mt-4">
                    The API automatically improves text spacing and alignment in
                    the generated PDF.
                  </p>

                  <h2 className="text-2xl font-semibold mt-8">Code Examples</h2>
                  <p className="text-base leading-7">
                    Using the Save Edited Text API with JavaScript:
                  </p>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-sm font-mono overflow-auto">
                        <code>{`// Assuming extractedData contains the original data from the Extract Content API
// and we have made changes to text content

// Example: Change the text of the first text block on the first page
const editedData = JSON.parse(JSON.stringify(extractedData)); // Deep copy
editedData.pages[0].texts[0].text = "This is my modified title";

const formData = new FormData();
formData.append('sessionId', sessionId); // Session ID from Extract Content API response
formData.append('editedData', JSON.stringify(editedData));

fetch('https://api.mega-pdf.com/api/pdf/save-edited-text', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key'
  },
  body: formData
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('PDF saved successfully with text edits');
      console.log('Download URL:', data.fileUrl);
      
      // Provide download link to user
      const downloadLink = 'https://mega-pdf.com' + data.fileUrl;
      console.log('Full download URL:', downloadLink);
    } else {
      console.error('Failed to save edited PDF:', data.error);
    }
  })
  .catch(error => console.error('Error:', error));
`}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <h2 className="text-2xl font-semibold mt-8">
                    Editing Best Practices
                  </h2>
                  <p className="text-base leading-7">
                    For optimal results when editing PDF text:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-base leading-7">
                    <li>
                      Preserve the original font and size information for
                      consistent appearance
                    </li>
                    <li>
                      Avoid drastically changing text length, as it may affect
                      layout
                    </li>
                    <li>
                      Keep the bounding box coordinates (x0, y0, x1, y1)
                      unchanged unless you specifically want to reposition text
                    </li>
                    <li>
                      Do not modify or remove the images array to ensure all
                      images are preserved
                    </li>
                    <li>
                      Test with sample documents to understand how your edits
                      affect the final PDF
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
