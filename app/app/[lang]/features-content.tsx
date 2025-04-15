"use client";

import Image from "next/image";
import { useLanguageStore } from "@/src/store/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LanguageLink } from "@/components/language-link";
import { 
  FileText, 
  ArrowRight, 
  Lock, 
  Layers, 
  Settings, 
  Code, 
  Globe, 
  Zap, 
  FileSearch, 
  UploadCloud, 
  Shield, 
  Users, 
  Cloud, 
  FileCheck2, 
  FileBox, 
  Stamp, 
  Scissors, 
  Download, 
  Search, 
  PenTool,
  ImageIcon,
  LightbulbIcon,
  SmartphoneIcon,
  ServerIcon
} from "lucide-react";
import { JSX } from "react";
interface Feature {
  title: string;
  description: string;
  icon: JSX.Element;
  link?: string;
  badge?: string;
}
export default function FeaturesPageContent() {
  const { t } = useLanguageStore();
  const featureCategories: {
    id: string;
    title: string;
    description: string;
    icon: JSX.Element;
    features: Feature[];
  }[] = [
    {
      id: "pdf-conversion",
      title: t("features.categories.conversion.title") || "PDF Conversion",
      description: t("features.categories.conversion.description") || "Convert PDFs to and from various formats with high accuracy and formatting retention.",
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      features: [
        {
          title: t("features.categories.conversion.features.pdfToWord.title") || "PDF to Word Conversion",
          description: t("features.categories.conversion.features.pdfToWord.description") || "Convert PDF files to editable Word documents with preserved formatting, tables, and images.",
          icon: <FileText className="h-5 w-5 text-blue-500" />,
          link: "/convert/pdf-to-docx"
        },
        {
          title: t("features.categories.conversion.features.pdfToExcel.title") || "PDF to Excel Conversion",
          description: t("features.categories.conversion.features.pdfToExcel.description") || "Extract tables from PDFs into editable Excel spreadsheets with accurate data formatting.",
          icon: <Layers className="h-5 w-5 text-green-500" />,
          link: "/convert/pdf-to-xlsx"
        },
        {
          title: t("features.categories.conversion.features.pdfToImage.title") || "PDF to Image Conversion",
          description: t("features.categories.conversion.features.pdfToImage.description") || "Convert PDF pages to high-quality JPG, PNG, or TIFF images with customizable resolution.",
          icon: <ImageIcon className="h-5 w-5 text-amber-500" />,
          link: "/convert/pdf-to-jpg"
        },
        {
          title: t("features.categories.conversion.features.officeToPdf.title") || "Office to PDF Conversion",
          description: t("features.categories.conversion.features.officeToPdf.description") || "Convert Word, Excel, PowerPoint files to PDF format with preserved layout and formatting.",
          icon: <ArrowRight className="h-5 w-5 text-red-500" />,
          link: "/convert/docx-to-pdf"
        }
      ]
    },
    {
      id: "pdf-editing",
      title: t("features.categories.editing.title") || "PDF Editing & Management",
      description: t("features.categories.editing.description") || "Edit, organize, and optimize your PDF documents with our comprehensive toolset.",
      icon: <PenTool className="h-6 w-6 text-green-500" />,
      features: [
        {
          title: t("features.categories.editing.features.merge.title") || "Merge PDFs",
          description: t("features.categories.editing.features.merge.description") || "Combine multiple PDF files into a single document with customizable page ordering.",
          icon: <ArrowRight className="h-5 w-5 text-red-500" />,
          link: "/merge-pdf"
        },
        {
          title: t("features.categories.editing.features.split.title") || "Split PDFs",
          description: t("features.categories.editing.features.split.description") || "Divide large PDFs into smaller documents by page ranges or extract specific pages.",
          icon: <Scissors className="h-5 w-5 text-orange-500" />,
          link: "/split-pdf"
        },
        {
          title: t("features.categories.editing.features.compress.title") || "Compress PDFs",
          description: t("features.categories.editing.features.compress.description") || "Reduce PDF file size while maintaining quality for easier sharing and storage.",
          icon: <Download className="h-5 w-5 text-purple-500" />,
          link: "/compress-pdf"
        },
        {
          title: t("features.categories.editing.features.watermark.title") || "Add Watermarks",
          description: t("features.categories.editing.features.watermark.description") || "Add text or image watermarks to your PDFs with customizable transparency, position, and rotation.",
          icon: <Stamp className="h-5 w-5 text-blue-500" />,
          link: "/watermark-pdf"
        }
      ]
    },
    {
      id: "pdf-security",
      title: t("features.categories.security.title") || "PDF Security & Protection",
      description: t("features.categories.security.description") || "Secure your PDF documents with encryption, password protection, and digital signatures.",
      icon: <Shield className="h-6 w-6 text-purple-500" />,
      features: [
        {
          title: t("features.categories.security.features.protect.title") || "Password Protection",
          description: t("features.categories.security.features.protect.description") || "Encrypt PDFs with password protection to control access and prevent unauthorized viewing.",
          icon: <Lock className="h-5 w-5 text-blue-500" />,
          link: "/protect-pdf"
        },
        {
          title: t("features.categories.security.features.unlock.title") || "PDF Unlocking",
          description: t("features.categories.security.features.unlock.description") || "Remove password protection from PDFs where you have authorized access.",
          icon: <Lock className="h-5 w-5 text-green-500" />,
          link: "/unlock-pdf"
        },
        {
          title: t("features.categories.security.features.signature.title") || "Digital Signatures",
          description: t("features.categories.security.features.signature.description") || "Add digital signatures to PDFs for document authentication and verification.",
          icon: <PenTool className="h-5 w-5 text-purple-500" />,
          link: "/sign-pdf"
        },
        {
          title: t("features.categories.security.features.redaction.title") || "PDF Redaction",
          description: t("features.categories.security.features.redaction.description") || "Permanently remove sensitive information from PDF documents.",
          icon: <Shield className="h-5 w-5 text-red-500" />,
          link: "/redact"
        }
      ]
    },
    {
      id: "ocr-technology",
      title: t("features.categories.ocr.title") || "OCR Technology",
      description: t("features.categories.ocr.description") || "Extract text from scanned documents and images using our advanced OCR technology.",
      icon: <FileSearch className="h-6 w-6 text-amber-500" />,
      features: [
        {
          title: t("features.categories.ocr.features.textExtraction.title") || "Text Extraction",
          description: t("features.categories.ocr.features.textExtraction.description") || "Extract text from scanned PDFs and images with high accuracy and language support.",
          icon: <FileSearch className="h-5 w-5 text-blue-500" />,
          link: "/ocr"
        },
        {
          title: t("features.categories.ocr.features.searchable.title") || "Searchable PDFs",
          description: t("features.categories.ocr.features.searchable.description") || "Convert scanned documents into searchable PDFs with text recognition.",
          icon: <Search className="h-5 w-5 text-green-500" />,
          link: "/ocr"
        },
        {
          title: t("features.categories.ocr.features.multilingual.title") || "Multilingual Support",
          description: t("features.categories.ocr.features.multilingual.description") || "OCR support for over 100 languages including non-Latin scripts and special characters.",
          icon: <Globe className="h-5 w-5 text-purple-500" />,
          link: "/ocr"
        },
        {
          title: t("features.categories.ocr.features.batchProcessing.title") || "Batch Processing",
          description: t("features.categories.ocr.features.batchProcessing.description") || "Process multiple documents at once with our efficient batch OCR capabilities.",
          icon: <Layers className="h-5 w-5 text-orange-500" />,
          link: "/ocr"
        }
      ]
    },
    {
      id: "api-integration",
      title: t("features.categories.api.title") || "API & Integration",
      description: t("features.categories.api.description") || "Integrate our PDF processing capabilities into your applications with our robust API.",
      icon: <Code className="h-6 w-6 text-indigo-500" />,
      features: [
        {
          title: t("features.categories.api.features.restful.title") || "RESTful API",
          description: t("features.categories.api.features.restful.description") || "Simple and powerful RESTful API for PDF processing and document management.",
          icon: <Globe className="h-5 w-5 text-blue-500" />,
          link: "/en/developer-api"
        },
        {
          title: t("features.categories.api.features.sdks.title") || "SDKs & Libraries",
          description: t("features.categories.api.features.sdks.description") || "Developer-friendly SDKs for various programming languages including JavaScript, Python, and PHP.",
          icon: <Code className="h-5 w-5 text-green-500" />,
          link: "/en/developer-api"
        },
        {
          title: t("features.categories.api.features.webhooks.title") || "Webhooks",
          description: t("features.categories.api.features.webhooks.description") || "Real-time event notifications for asynchronous PDF processing workflows.",
          icon: <Zap className="h-5 w-5 text-amber-500" />,
          link: "/en/developer-api"
        },
        {
          title: t("features.categories.api.features.customization.title") || "API Customization",
          description: t("features.categories.api.features.customization.description") || "Tailor the API to your specific needs with customizable endpoints and parameters.",
          icon: <Settings className="h-5 w-5 text-purple-500" />,
          link: "/en/developer-api"
        }
      ]
    },
   
    {
      id: "enterprise-features",
      title: t("features.categories.enterprise.title") || "Enterprise Features",
      description: t("features.categories.enterprise.description") || "Advanced features designed for business and enterprise requirements.",
      icon: <ServerIcon className="h-6 w-6 text-slate-500" />,
      features: [
        {
          title: t("features.categories.enterprise.features.batch.title") || "Batch Processing",
          description: t("features.categories.enterprise.features.batch.description") || "Process hundreds of documents simultaneously with our efficient batch processing system.",
          icon: <FileBox className="h-5 w-5 text-blue-500" />,
          badge: "Pro"
        },
        {
          title: t("features.categories.enterprise.features.workflow.title") || "Custom Workflows",
          description: t("features.categories.enterprise.features.workflow.description") || "Create automated document processing workflows tailored to your business needs.",
          icon: <Settings className="h-5 w-5 text-green-500" />,
          badge: "Enterprise"
        },
        {
          title: t("features.categories.enterprise.features.compliance.title") || "Compliance & Audit",
          description: t("features.categories.enterprise.features.compliance.description") || "Enhanced security features for GDPR, HIPAA, and other regulatory compliance.",
          icon: <Shield className="h-5 w-5 text-purple-500" />,
          badge: "Enterprise"
        },
        {
          title: t("features.categories.enterprise.features.analytics.title") || "Usage Analytics",
          description: t("features.categories.enterprise.features.analytics.description") || "Detailed insights into document processing activities and user operations.",
          icon: <FileSearch className="h-5 w-5 text-amber-500" />,
          badge: "Pro"
        }
      ]
    }
  ];

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="mb-6 p-3 rounded-full bg-primary/10 inline-block">
          <LightbulbIcon className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          {t("features.hero.title") || "Advanced PDF Tools & Features"}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t("features.hero.description") || "Discover the comprehensive suite of tools and features that make ScanPro the ultimate solution for all your document management needs."}
        </p>
      </section>

      {/* Key Features Overview */}
      <section className="mb-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-muted/30">
            <CardHeader>
              <div className="p-2 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t("features.overview.power.title") || "Powerful Processing"}</CardTitle>
              <CardDescription>
                {t("features.overview.power.description") || "Advanced algorithms ensure high-quality document processing and conversion with exceptional accuracy."}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-muted/30">
            <CardHeader>
              <div className="p-2 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>{t("features.overview.security.title") || "Bank-Level Security"}</CardTitle>
              <CardDescription>
                {t("features.overview.security.description") || "Your documents are protected with 256-bit SSL encryption and automatically deleted after processing."}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-muted/30">
            <CardHeader>
              <div className="p-2 w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle>{t("features.overview.accessibility.title") || "Universal Accessibility"}</CardTitle>
              <CardDescription>
                {t("features.overview.accessibility.description") || "Access your documents and our tools from any device with full cross-platform compatibility."}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t("features.allFeatures.title") || "All Features"}
        </h2>
        
        <Tabs defaultValue="pdf-conversion" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-auto mb-8">
            {featureCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="py-2 h-auto">
                <div className="flex flex-col items-center gap-1">
                  {category.icon}
                  <span>{category.title}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {featureCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-4">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold">{category.title}</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto mt-2">{category.description}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {category.features.map((feature, index) => (
                  <Card key={index} className="hover:shadow-md transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {feature.icon}
                          </div>
                          <CardTitle className="text-lg">
                            {feature.title}
                            {feature.badge && (
                              <Badge className="ml-2 bg-primary/20 text-primary text-xs">
                                {feature.badge}
                              </Badge>
                            )}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                      {feature.link && (
                        <div className="mt-4">
                          <LanguageLink href={feature.link}>
                            <Button variant="outline" className="text-sm">
                              {t("features.learnMore") || "Learn More"}
                            </Button>
                          </LanguageLink>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Mobile App Section */}
      <section className="mb-16 bg-muted/30 p-10 rounded-xl">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 inline-block mb-4">
              <SmartphoneIcon className="h-6 w-6 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              {t("features.mobile.title") || "ScanPro Mobile App"}
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              {t("features.mobile.description") || "Take ScanPro's powerful PDF tools with you on the go. Our mobile app offers the same robust functionality in a convenient, mobile-friendly interface."}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/30">
                  <FileCheck2 className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium">{t("features.mobile.feature1.title") || "Scan & Digitize Documents"}</h3>
                  <p className="text-sm text-muted-foreground">{t("features.mobile.feature1.description") || "Use your camera to scan physical documents and convert them to high-quality PDFs instantly."}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <FileText className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium">{t("features.mobile.feature2.title") || "Edit PDFs On the Go"}</h3>
                  <p className="text-sm text-muted-foreground">{t("features.mobile.feature2.description") || "Edit, annotate, and sign PDF documents from your smartphone or tablet with ease."}</p>
                </div>
              </div>
              
            
            </div>
            
            <div className="mt-8 flex gap-4">
              <a 
                href="https://apps.apple.com/us/app/scanpro-pdf-scanner-app/id6743518395" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-2">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                iOS App
              </a>
              <a 
                href="https://play.google.com/store/apps/details?id=com.scanpro.documentconverter" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary/90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-2">
                  <path d="M5 3l-.65 1.87L3 6v12l1.35 1.13L5 21l12-9L5 3z" />
                </svg>
                Android App
              </a>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -top-6 -left-6 bottom-6 right-6 rounded-xl bg-primary/5 transform rotate-3"></div>
            <div className="relative p-2 bg-background border rounded-xl shadow-lg">
              <Image 
                src="/images/ic_icon.png" 
                alt="ScanPro Mobile App" 
                width={500} 
                height={600} 
                className="rounded-lg w-full" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          {t("features.testimonials.title") || "What Our Users Say"}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-muted/20">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "{t("features.testimonials.quote1") || "ScanPro has revolutionized the way our team handles documents. The OCR functionality is incredibly accurate, and the batch processing saves us hours every week."}"
                </p>
                <div>
                  <p className="font-medium">{t("features.testimonials.name1") || "Sarah Johnson"}</p>
                  <p className="text-sm text-muted-foreground">{t("features.testimonials.title1") || "Operations Manager"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/20">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "{t("features.testimonials.quote2") || "The API integration was seamless. We've integrated ScanPro into our workflow and the difference in efficiency is night and day. Their support team is also top-notch."}"
                </p>
                <div>
                  <p className="font-medium">{t("features.testimonials.name2") || "David Chen"}</p>
                  <p className="text-sm text-muted-foreground">{t("features.testimonials.title2") || "Tech Lead"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/20">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "{t("features.testimonials.quote3") || "As a small business owner, the affordable pricing and comprehensive toolset make ScanPro an incredible value. I especially love the mobile app which lets me handle documents on the go."}"
                </p>
                <div>
                  <p className="font-medium">{t("features.testimonials.name3") || "Maria Garcia"}</p>
                  <p className="text-sm text-muted-foreground">{t("features.testimonials.title3") || "Business Owner"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

    </div>
  );
}