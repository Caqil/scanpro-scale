"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguageStore } from "@/src/store/store";
import { CopyIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";

export function CodeExamples() {
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState("curl");
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  const copyToClipboard = (code: string, example: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedExample(example);
        toast.success("Code copied to clipboard");
        setTimeout(() => setCopiedExample(null), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy code");
      });
  };

  // Code examples for different languages
  const examples = {
    curl: {
      convert: `curl -X POST \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "file=@document.pdf" \\
  https://scanpro.cc/api/convert/pdf-to-docx`,
      
      merge: `curl -X POST \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "files[]=@document1.pdf" \\
  -F "files[]=@document2.pdf" \\
  https://scanpro.cc/api/pdf/merge`,
      
      protect: `curl -X POST \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "file=@document.pdf" \\
  -F "password=yourpassword123" \\
  -F "allowPrinting=true" \\
  https://scanpro.cc/api/pdf/protect`
    },
    
    python: {
      convert: `import requests

def convert_pdf_to_docx(pdf_path, api_key):
    url = "https://scanpro.cc/api/convert/pdf-to-docx"
    
    headers = {
        "x-api-key": api_key
    }
    
    files = {
        "file": open(pdf_path, "rb")
    }
    
    response = requests.post(url, headers=headers, files=files)
    
    if response.status_code == 200:
        data = response.json()
        if data["success"]:
            # Download the converted file
            converted_file_url = data["fileUrl"]
            download_url = f"https://scanpro.cc{converted_file_url}"
            
            download_response = requests.get(download_url)
            with open("converted_document.docx", "wb") as f:
                f.write(download_response.content)
            
            print(f"File converted and saved as converted_document.docx")
            return True
    
    print(f"Error: {response.text}")
    return False

# Usage
convert_pdf_to_docx("document.pdf", "YOUR_API_KEY")`,
      
      merge: `import requests

def merge_pdfs(pdf_paths, api_key):
    url = "https://scanpro.cc/api/pdf/merge"
    
    headers = {
        "x-api-key": api_key
    }
    
    files = {}
    for i, path in enumerate(pdf_paths):
        files[f"files[]"] = (f"file{i}.pdf", open(path, "rb"))
    
    response = requests.post(url, headers=headers, files=files)
    
    if response.status_code == 200:
        data = response.json()
        if data["success"]:
            # Download the merged file
            merged_file_url = data["fileUrl"]
            download_url = f"https://scanpro.cc{merged_file_url}"
            
            download_response = requests.get(download_url)
            with open("merged_document.pdf", "wb") as f:
                f.write(download_response.content)
            
            print(f"Files merged and saved as merged_document.pdf")
            return True
    
    print(f"Error: {response.text}")
    return False

# Usage
merge_pdfs(["document1.pdf", "document2.pdf"], "YOUR_API_KEY")`,
      
      protect: `import requests

def protect_pdf(pdf_path, password, api_key):
    url = "https://scanpro.cc/api/pdf/protect"
    
    headers = {
        "x-api-key": api_key
    }
    
    files = {
        "file": open(pdf_path, "rb")
    }
    
    data = {
        "password": password,
        "allowPrinting": "true"
    }
    
    response = requests.post(url, headers=headers, files=files, data=data)
    
    if response.status_code == 200:
        data = response.json()
        if data["success"]:
            # Download the protected file
            protected_file_url = data["fileUrl"]
            download_url = f"https://scanpro.cc{protected_file_url}"
            
            download_response = requests.get(download_url)
            with open("protected_document.pdf", "wb") as f:
                f.write(download_response.content)
            
            print(f"File protected and saved as protected_document.pdf")
            return True
    
    print(f"Error: {response.text}")
    return False

# Usage
protect_pdf("document.pdf", "yourpassword123", "YOUR_API_KEY")`
    },
    
    node: {
      convert: `const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function convertPdfToDocx(pdfPath, apiKey) {
  const url = 'https://scanpro.cc/api/convert/pdf-to-docx';
  
  // Create form data
  const formData = new FormData();
  formData.append('file', fs.createReadStream(pdfPath));
  
  try {
    // Send request
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        'x-api-key': apiKey
      }
    });
    
    const data = response.data;
    
    if (data.success) {
      // Download the converted file
      const downloadUrl = \`https://scanpro.cc\${data.fileUrl}\`;
      const outputPath = 'converted_document.docx';
      
      const downloadResponse = await axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'stream'
      });
      
      // Save the file
      const writer = fs.createWriteStream(outputPath);
      downloadResponse.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(\`File converted and saved as \${outputPath}\`);
          resolve(true);
        });
        writer.on('error', reject);
      });
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return false;
  }
}

// Usage
convertPdfToDocx('document.pdf', 'YOUR_API_KEY')
  .then(result => console.log(\`Operation \${result ? 'succeeded' : 'failed'}\`))
  .catch(err => console.error('Error:', err));`,

      merge: `const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function mergePdfs(pdfPaths, apiKey) {
  const url = 'https://scanpro.cc/api/pdf/merge';
  
  // Create form data
  const formData = new FormData();
  
  // Add all PDF files
  for (const pdfPath of pdfPaths) {
    formData.append('files[]', fs.createReadStream(pdfPath));
  }
  
  try {
    // Send request
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        'x-api-key': apiKey
      }
    });
    
    const data = response.data;
    
    if (data.success) {
      // Download the merged file
      const downloadUrl = \`https://scanpro.cc\${data.fileUrl}\`;
      const outputPath = 'merged_document.pdf';
      
      const downloadResponse = await axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'stream'
      });
      
      // Save the file
      const writer = fs.createWriteStream(outputPath);
      downloadResponse.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(\`Files merged and saved as \${outputPath}\`);
          resolve(true);
        });
        writer.on('error', reject);
      });
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return false;
  }
}

// Usage
mergePdfs(['document1.pdf', 'document2.pdf'], 'YOUR_API_KEY')
  .then(result => console.log(\`Operation \${result ? 'succeeded' : 'failed'}\`))
  .catch(err => console.error('Error:', err));`,

      protect: `const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function protectPdf(pdfPath, password, apiKey) {
  const url = 'https://scanpro.cc/api/pdf/protect';
  
  // Create form data
  const formData = new FormData();
  formData.append('file', fs.createReadStream(pdfPath));
  formData.append('password', password);
  formData.append('allowPrinting', 'true');
  
  try {
    // Send request
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        'x-api-key': apiKey
      }
    });
    
    const data = response.data;
    
    if (data.success) {
      // Download the protected file
      const downloadUrl = \`https://scanpro.cc\${data.fileUrl}\`;
      const outputPath = 'protected_document.pdf';
      
      const downloadResponse = await axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'stream'
      });
      
      // Save the file
      const writer = fs.createWriteStream(outputPath);
      downloadResponse.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(\`File protected and saved as \${outputPath}\`);
          resolve(true);
        });
        writer.on('error', reject);
      });
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return false;
  }
}

// Usage
protectPdf('document.pdf', 'yourpassword123', 'YOUR_API_KEY')
  .then(result => console.log(\`Operation \${result ? 'succeeded' : 'failed'}\`))
  .catch(err => console.error('Error:', err));`
    },
    
    php: {
      convert: `<?php
function convertPdfToDocx($pdfPath, $apiKey) {
    $url = 'https://scanpro.cc/api/convert/pdf-to-docx';
    
    $curl = curl_init();
    
    // Create POST data with file
    $postData = array(
        'file' => new CURLFile($pdfPath)
    );
    
    // Set cURL options
    curl_setopt_array($curl, array(
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postData,
        CURLOPT_HTTPHEADER => array(
            'x-api-key: ' . $apiKey,
        ),
    ));
    
    // Execute the request
    $response = curl_exec($curl);
    $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    
    curl_close($curl);
    
    if ($statusCode == 200) {
        $data = json_decode($response, true);
        
        if ($data['success']) {
            // Download the converted file
            $downloadUrl = 'https://scanpro.cc' . $data['fileUrl'];
            $outputPath = 'converted_document.docx';
            
            file_put_contents($outputPath, file_get_contents($downloadUrl));
            
            echo "File converted and saved as $outputPath";
            return true;
        }
    }
    
    echo "Error: $response";
    return false;
}

// Usage
convertPdfToDocx('document.pdf', 'YOUR_API_KEY');`,
      
      merge: `<?php
function mergePdfs($pdfPaths, $apiKey) {
    $url = 'https://scanpro.cc/api/pdf/merge';
    
    $curl = curl_init();
    
    // Create POST data with files
    $postData = array();
    foreach ($pdfPaths as $index => $pdfPath) {
        $postData["files[$index]"] = new CURLFile($pdfPath);
    }
    
    // Set cURL options
    curl_setopt_array($curl, array(
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postData,
        CURLOPT_HTTPHEADER => array(
            'x-api-key: ' . $apiKey,
        ),
    ));
    
    // Execute the request
    $response = curl_exec($curl);
    $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    
    curl_close($curl);
    
    if ($statusCode == 200) {
        $data = json_decode($response, true);
        
        if ($data['success']) {
            // Download the merged file
            $downloadUrl = 'https://scanpro.cc' . $data['fileUrl'];
            $outputPath = 'merged_document.pdf';
            
            file_put_contents($outputPath, file_get_contents($downloadUrl));
            
            echo "Files merged and saved as $outputPath";
            return true;
        }
    }
    
    echo "Error: $response";
    return false;
}

// Usage
mergePdfs(['document1.pdf', 'document2.pdf'], 'YOUR_API_KEY');`,
      
      protect: `<?php
function protectPdf($pdfPath, $password, $apiKey) {
    $url = 'https://scanpro.cc/api/pdf/protect';
    
    $curl = curl_init();
    
    // Create POST data with file and parameters
    $postData = array(
        'file' => new CURLFile($pdfPath),
        'password' => $password,
        'allowPrinting' => 'true'
    );
    
    // Set cURL options
    curl_setopt_array($curl, array(
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postData,
        CURLOPT_HTTPHEADER => array(
            'x-api-key: ' . $apiKey,
        ),
    ));
    
    // Execute the request
    $response = curl_exec($curl);
    $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    
    curl_close($curl);
    
    if ($statusCode == 200) {
        $data = json_decode($response, true);
        
        if ($data['success']) {
            // Download the protected file
            $downloadUrl = 'https://scanpro.cc' . $data['fileUrl'];
            $outputPath = 'protected_document.pdf';
            
            file_put_contents($outputPath, file_get_contents($downloadUrl));
            
            echo "File protected and saved as $outputPath";
            return true;
        }
    }
    
    echo "Error: $response";
    return false;
}

// Usage
protectPdf('document.pdf', 'yourpassword123', 'YOUR_API_KEY');`
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('developer.examples.title') || "Code Examples"}</CardTitle>
          <CardDescription>
            {t('developer.examples.subtitle') || "Learn how to integrate our API with these ready-to-use examples"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="node">Node.js</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-6">
              <div className="space-y-8">
                {/* PDF to Word conversion example */}
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t('developer.examples.pdfToWord') || "PDF to Word Conversion"}
                  </h3>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                      <code>{examples[activeTab as keyof typeof examples].convert}</code>
                    </pre>
                    <Button
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                      onClick={() => copyToClipboard(examples[activeTab as keyof typeof examples].convert, "convert")}
                    >
                      {copiedExample === "convert" ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Merge PDFs example */}
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t('developer.examples.mergePdfs') || "Merge PDFs"}
                  </h3>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                      <code>{examples[activeTab as keyof typeof examples].merge}</code>
                    </pre>
                    <Button
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                      onClick={() => copyToClipboard(examples[activeTab as keyof typeof examples].merge, "merge")}
                    >
                      {copiedExample === "merge" ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Protect PDF example */}
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t('developer.examples.protectPdf') || "Protect PDF"}
                  </h3>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                      <code>{examples[activeTab as keyof typeof examples].protect}</code>
                    </pre>
                    <Button
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                      onClick={() => copyToClipboard(examples[activeTab as keyof typeof examples].protect, "protect")}
                    >
                      {copiedExample === "protect" ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}