// app/[lang]/pdf-editor/pdf-editor-content.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileEdit, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LanguageLink } from "@/components/language-link";
import { LibreOfficeEditor } from "@/components/pdf-editor";
import { FileUpload } from "@/components/file-upload";

export function PDFEditorContent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editedFileUrl, setEditedFileUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleFileSelected = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please select a PDF file");
      return;
    }

    setSelectedFile(file);
    setIsEditing(true);
  };

  const handleEditComplete = (fileUrl: string) => {
    setEditedFileUrl(fileUrl);
    setIsEditing(false);
    toast.success("PDF edited successfully!");
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
  };

  const handleStartOver = () => {
    setSelectedFile(null);
    setEditedFileUrl(null);
    setIsEditing(false);
  };

  return (
    <div className="container max-w-7xl py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PDF Editor</h1>
          <p className="text-muted-foreground">
            Edit text, add checkboxes, and modify content in your PDF documents
          </p>
        </div>
        <LanguageLink href="/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </LanguageLink>
      </div>

      {!selectedFile && !editedFileUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Upload PDF</CardTitle>
            <CardDescription>
              Select a PDF file to edit. You can modify text, check boxes, and
              more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              accept=".pdf"
              maxSize={10}
              onFileSelected={handleFileSelected}
              icon={<FileEdit className="h-10 w-10 text-muted-foreground" />}
              title="Upload a PDF to edit"
              subtitle="Drag and drop a PDF, or click to browse"
            />
          </CardContent>
        </Card>
      )}

      {isEditing && selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Editing {selectedFile.name}</CardTitle>
            <CardDescription>
              Click on text to edit. Click checkboxes to toggle them. Changes
              are applied when you save.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[800px]">
              <LibreOfficeEditor
                pdfFile={selectedFile}
                onComplete={handleEditComplete}
                onCancel={handleEditCancel}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {editedFileUrl && !isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>PDF Successfully Edited</CardTitle>
            <CardDescription>
              Your PDF has been edited. You can download it or edit another
              file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
              <div className="text-center">
                <FileEdit className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium">Edit Complete</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Your PDF has been successfully edited and is ready for
                  download
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button asChild variant="outline">
                <a href={editedFileUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download Edited PDF
                </a>
              </Button>
              <Button onClick={handleStartOver}>Edit Another PDF</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-muted rounded-lg p-4">
        <h2 className="text-lg font-medium mb-2">About PDF Editing</h2>
        <p className="text-sm text-muted-foreground">
          Our PDF editor allows you to edit text, toggle checkboxes, and make
          changes while preserving the original layout. Text editing is
          maintained in its original position and font. This editor is best for
          making small changes to text and form fields in existing PDFs.
        </p>
      </div>
    </div>
  );
}
