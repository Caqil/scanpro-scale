"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  ChevronRight,
  FileOutput,
  FilePlus,
  Lock,
  PencilRuler,
  FileText,
} from "lucide-react";
import Link from "next/link";

const categories = [
  {
    title: "Conversion API",
    description:
      "Convert PDFs to and from various formats including Word, Excel, JPG, and more.",
    icon: FileOutput,
    path: "conversion",
  },
  {
    title: "Manipulation API",
    description:
      "Merge, split, compress, rotate and modify PDFs with simple API calls.",
    icon: FilePlus,
    path: "manipulation",
  },
  {
    title: "Security API",
    description:
      "Add password protection, remove restrictions, and secure your PDF documents.",
    icon: Lock,
    path: "security",
  },
  {
    title: "Editing API",
    description:
      "Add signatures, watermarks, page numbers, and more to PDF documents.",
    icon: PencilRuler,
    path: "editing",
  },
  {
    title: "OCR API",
    description:
      "Extract text from scanned documents and create searchable PDFs with OCR.",
    icon: FileText,
    path: "ocr",
  },
  {
    title: "Getting Started",
    description:
      "Learn the basics of integrating our API, authentication, and handling responses.",
    icon: BookOpen,
    path: "getting-started",
  },
];

export default function APICategories() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {categories.map((category) => (
        <Card
          key={category.title}
          className="hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <category.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>{category.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              {category.description}
            </CardDescription>
            <Button variant="secondary" size="sm" className="w-full" asChild>
              <Link href={`/en/developer/api/${category.path}`}>
                View Documentation <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
