
import APICategories from "@/components/api/api-category";
import Hero from "@/components/api/hero";
import SearchBar from "@/components/api/search-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ApiDocumentationPage() {
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <Hero />
      <SearchBar />
      <APICategories />
      {/* API Overview Section */}
      <div className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">API Overview</CardTitle>
            <CardDescription>
              The MegaPDF API provides powerful PDF processing capabilities for
              developers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none dark:prose-invert">
              <p>
                The MegaPDF API enables you to convert, manipulate, secure, and
                process PDF documents through simple HTTP requests. Our REST API
                supports a wide range of operations from basic conversions to
                advanced text extraction, editing, and security features.
              </p>

              <h3>Base URL</h3>
              <div className="bg-muted p-3 rounded-md">
                <code>https://mega-pdf.com/api</code>
              </div>

              <h3>Authentication</h3>
              <p>
                All API requests require authentication with an API key. You can
                include your API key in either the <code>x-api-key</code> header
                or as a query parameter in your requests.
              </p>

              <h3>Response Format</h3>
              <p>
                All API responses include a <code>success</code> boolean
                indicating if the request was successful, along with other
                relevant data. When processing files, a <code>fileUrl</code>{" "}
                will be provided to download the result.
              </p>
              <div className="bg-muted p-4 rounded-md overflow-auto">
                <pre className="text-sm">
                  <code>{`// Example success response
{
  "success": true,
  "message": "PDF processed successfully",
  "fileUrl": "/api/file?folder=compressions&filename=abc123.pdf",
  "filename": "abc123.pdf"
}

// Example error response
{
  "success": false,
  "error": "No PDF file provided"
}`}</code>
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
