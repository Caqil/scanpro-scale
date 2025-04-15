"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, ReactNode } from "react";
import { FileUploader } from "@/components/file-uploader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Image, Table, File } from "lucide-react";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";

// Define conversion type interface
interface ConversionType {
  title: string;
  description: string;
  icon: ReactNode;
  iconBg: string;
  inputFormat: string;
  outputFormat: string;
}

interface ConversionParams {
  conversion: string;
  [key: string]: string | string[];
}

export const useConversionTypes = () => {
  const { t } = useLanguageStore();

  const conversionTypes: Record<string, ConversionType> = {
    "pdf-to-docx": {
      title: t("convert.title.pdfToWord"),
      description: t("convert.description.pdfToWord"),
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      inputFormat: "pdf",
      outputFormat: "docx",
    },
    "pdf-to-xlsx": {
      title: t("convert.title.pdfToExcel"),
      description: t("convert.description.pdfToExcel"),
      icon: <Table className="h-8 w-8 text-green-500" />,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      inputFormat: "pdf",
      outputFormat: "xlsx",
    },
    "pdf-to-pptx": {
      title: t("convert.title.pdfToPowerPoint"),
      description: t("convert.description.pdfToPowerPoint"),
      icon: <FileText className="h-8 w-8 text-orange-500" />,
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      inputFormat: "pdf",
      outputFormat: "pptx",
    },
    "pdf-to-jpg": {
      title: t("convert.title.pdfToJpg"),
      description: t("convert.description.pdfToJpg"),
      icon: <Image className="h-8 w-8 text-yellow-500" />,
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      inputFormat: "pdf",
      outputFormat: "jpg",
    },
    "pdf-to-png": {
      title: t("convert.title.pdfToPng"),
      description: t("convert.description.pdfToPng"),
      icon: <Image className="h-8 w-8 text-yellow-500" />,
      iconBg: "bg-blue-100 dark:bg-yellow-900/30",
      inputFormat: "pdf",
      outputFormat: "png",
    },
    "pdf-to-html": {
      title: t("convert.title.pdfToHtml"),
      description: t("convert.description.pdfToHtml"),
      icon: <File className="h-8 w-8 text-purple-500" />,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      inputFormat: "pdf",
      outputFormat: "html",
    },
    "docx-to-pdf": {
      title: t("convert.title.wordToPdf"),
      description: t("convert.description.wordToPdf"),
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      inputFormat: "docx",
      outputFormat: "pdf",
    },
    "xlsx-to-pdf": {
      title: t("convert.title.excelToPdf"),
      description: t("convert.description.excelToPdf"),
      icon: <Table className="h-8 w-8 text-green-500" />,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      inputFormat: "xlsx",
      outputFormat: "pdf",
    },
    "pptx-to-pdf": {
      title: t("convert.title.powerPointToPdf"),
      description: t("convert.description.powerPointToPdf"),
      icon: <FileText className="h-8 w-8 text-orange-500" />,
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      inputFormat: "pptx",
      outputFormat: "pdf",
    },
    "jpg-to-pdf": {
      title: t("convert.title.jpgToPdf"),
      description: t("convert.description.jpgToPdf"),
      icon: <Image className="h-8 w-8 text-yellow-500" />,
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      inputFormat: "jpg",
      outputFormat: "pdf",
    },
    "png-to-pdf": {
      title: t("convert.title.pngToPdf"),
      description: t("convert.description.pngToPdf"),
      icon: <Image className="h-8 w-8 text-yellow-500" />,
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      inputFormat: "png",
      outputFormat: "pdf",
    },
    "html-to-pdf": {
      title: t("convert.title.htmlToPdf"),
      description: t("convert.description.htmlToPdf"),
      icon: <File className="h-8 w-8 text-purple-500" />,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      inputFormat: "html",
      outputFormat: "pdf",
    },
  };

  return conversionTypes;
};

export function ClientConversionContent() {
  const params = useParams<ConversionParams>();
  const conversionPath = params.conversion as string;
  const conversionTypes = useConversionTypes();
  const [inputFormat, setInputFormat] = useState<string>("pdf");
  const [outputFormat, setOutputFormat] = useState<string>("docx");
  const [conversionDetails, setConversionDetails] =
    useState<ConversionType | null>(null);
  const { t } = useLanguageStore();
  useEffect(() => {
    if (conversionPath) {
      console.log(`Processing conversion path: ${conversionPath}`);

      if (conversionTypes[conversionPath]) {
        const details = conversionTypes[conversionPath];
        setInputFormat(details.inputFormat);
        setOutputFormat(details.outputFormat);
        setConversionDetails(details);
      } else {
        const parts = conversionPath.split("-to-");
        if (parts.length === 2) {
          setInputFormat(parts[0]);
          setOutputFormat(parts[1]);

          const fallbackKey = Object.keys(conversionTypes).find(
            (key) =>
              conversionTypes[key].inputFormat === parts[0] &&
              conversionTypes[key].outputFormat === parts[1]
          );

          if (fallbackKey) {
            setConversionDetails(conversionTypes[fallbackKey]);
          } else {
            setConversionDetails({
              title: `${parts[0].toUpperCase()} to ${parts[1].toUpperCase()}`,
              description: `Convert ${parts[0].toUpperCase()} files to ${parts[1].toUpperCase()} format`,
              icon: <File className="h-8 w-8 text-blue-500" />,
              iconBg: "bg-blue-100 dark:bg-blue-900/30",
              inputFormat: parts[0],
              outputFormat: parts[1],
            });
          }
        }
      }
    }
  }, [conversionPath]);

  const getRelatedConversions = () => {
    const isFromPdf = inputFormat === "pdf";

    if (isFromPdf) {
      return Object.entries(conversionTypes)
        .filter(
          ([key, value]) =>
            value.inputFormat === "pdf" && key !== conversionPath
        )
        .slice(0, 4)
        .map(([key, value]) => ({ id: key, ...value }));
    } else {
      return Object.entries(conversionTypes)
        .filter(
          ([key, value]) =>
            value.outputFormat === "pdf" && key !== conversionPath
        )
        .slice(0, 4)
        .map(([key, value]) => ({ id: key, ...value }));
    }
  };

  const relatedConversions = getRelatedConversions();

  if (!conversionDetails) {
    return (
      <div className="container py-20">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="h-16 w-16 mx-auto mb-4 border-4 border-t-primary rounded-full animate-spin"></div>
            <p className="text-muted-foreground">{t("ui.loading")}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container max-w-5xl py-12 mx-auto">
      <div className="mx-auto flex flex-col items-center text-center mb-8">
        <div className={`mb-4 p-3 rounded-full ${conversionDetails.iconBg}`}>
          {conversionDetails.icon}
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {conversionDetails.title}
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
          {conversionDetails.description}
        </p>
      </div>

      <Card className="mb-8 border shadow-sm">
        <CardHeader>
          <CardTitle>{t("ui.upload")}</CardTitle>
          <CardDescription>
            {inputFormat === "pdf"
              ? t("convert.description.generic")
                  .replace("{from}", "PDF")
                  .replace("{to}", outputFormat.toUpperCase())
              : t("convert.description.generic")
                  .replace("{from}", inputFormat.toUpperCase())
                  .replace("{to}", "PDF")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader
            initialInputFormat={inputFormat}
            initialOutputFormat={outputFormat}
            key={`${inputFormat}-to-${outputFormat}`}
          />
        </CardContent>
      </Card>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t("convert.howTo.title")
            .replace("{from}", inputFormat.toUpperCase())
            .replace("{to}", outputFormat.toUpperCase())}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="font-bold">1</span>
            </div>
            <h3 className="text-lg font-medium mb-2">
              {t("convert.howTo.step1.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {inputFormat === "pdf"
                ? t("convert.howTo.step1.description").replace("{from}", "PDF")
                : t("convert.howTo.step1.description").replace(
                    "{from}",
                    inputFormat.toUpperCase()
                  )}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="font-bold">2</span>
            </div>
            <h3 className="text-lg font-medium mb-2">
              {t("convert.howTo.step2.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("convert.howTo.step2.description")}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="font-bold">3</span>
            </div>
            <h3 className="text-lg font-medium mb-2">
              {t("convert.howTo.step3.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {inputFormat === "pdf"
                ? t("convert.howTo.step3.description").replace(
                    "{to}",
                    outputFormat.toUpperCase()
                  )
                : t("convert.howTo.step3.description").replace("{to}", "PDF")}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t("convert.moreTools")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relatedConversions.map((conversion) => (
            <LanguageLink
              key={conversion.id}
              href={`/convert/${conversion.id}`}
              className="border rounded-lg p-4 text-center hover:border-primary transition-colors"
            >
              <div className="flex flex-col items-center">
                <div className={`p-2 rounded-full ${conversion.iconBg} mb-2`}>
                  {conversion.icon}
                </div>
                <span className="text-sm font-medium">{conversion.title}</span>
              </div>
            </LanguageLink>
          ))}
        </div>
        <div className="text-center mt-6">
          <LanguageLink href="/pdf-tools">
            <Button variant="outline">{t("popular.viewAll")}</Button>
          </LanguageLink>
        </div>
      </div>
    </div>
  );
}
