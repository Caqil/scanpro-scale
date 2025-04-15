"use client";

import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import { HelpCircle, FileText, Lock, Key, Settings, ArrowRight } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";

export function FAQContent() {
  // Get translation function from language store
  const { t } = useLanguageStore();
  
  // Organize FAQs by category
  const faqs = {
    general: [
      {
        question: t('faq.general.question1') || "What is ScanPro?",
        answer: t('faq.general.answer1') || "ScanPro is a comprehensive online platform for PDF management and conversion. Our tools help you convert, edit, merge, split, compress, and secure your PDF documents through an intuitive web interface or API."
      },
      {
        question: t('faq.general.question2') || "Do I need to create an account to use ScanPro?",
        answer: t('faq.general.answer2') || "No, you can use our basic PDF tools without registering. However, creating a free account gives you benefits like saved history, higher file size limits, and access to additional features."
      },
      {
        question: t('faq.general.question3') || "Is my data secure on ScanPro?",
        answer: t('faq.general.answer3') || "Yes, all files are processed securely on our servers with encryption. We don't share your files with third parties, and files are automatically deleted from our servers after processing (within 24 hours). For more details, please see our Privacy Policy."
      },
      {
        question: t('faq.general.question4') || "What devices and browsers does ScanPro support?",
        answer: t('faq.general.answer4') || "ScanPro works on all modern browsers including Chrome, Firefox, Safari, and Edge. Our platform is fully responsive and works on desktop, tablet, and mobile devices."
      }
    ],
    conversion: [
      {
        question: t('faq.conversion.question1') || "What file types can I convert to and from?",
        answer: t('faq.conversion.answer1') || "ScanPro supports converting PDFs to many formats including Word (DOCX), Excel (XLSX), PowerPoint (PPTX), images (JPG, PNG), HTML, and plain text. You can also convert these formats back to PDF."
      },
      {
        question: t('faq.conversion.question2') || "How accurate are your PDF conversions?",
        answer: t('faq.conversion.answer2') || "Our conversion engine uses advanced algorithms to maintain formatting, including fonts, images, tables, and layout. However, very complex documents may have minor formatting differences. For best results, we recommend using our 'PDF to Word' or 'PDF to Excel' tools for documents with complex formatting."
      },
      {
        question: t('faq.conversion.question3') || "Is there a file size limit for conversions?",
        answer: t('faq.conversion.answer3') || "Free users can convert files up to 10MB. Basic subscribers can convert files up to 50MB, Pro subscribers up to 100MB, and Enterprise users up to 500MB. If you need to process larger files, please contact us for custom solutions."
      },
      {
        question: t('faq.conversion.question4') || "Why did my PDF conversion fail?",
        answer: t('faq.conversion.answer4') || "Conversions may fail if the file is corrupted, password-protected, or contains complex elements our system can't process. Try using our 'Repair PDF' tool first, then retry the conversion. If you're still having issues, try our 'Advanced' conversion mode or contact support."
      }
    ],
    security: [
      {
        question: t('faq.security.question1') || "How do I password protect my PDF?",
        answer: t('faq.security.answer1') || "Use our 'Protect PDF' tool. Upload your PDF, set a password, choose permission restrictions (if desired), and click 'Protect PDF'. You can control whether users can print, edit, or copy content from your PDF."
      },
      {
        question: t('faq.security.question2') || "Can I remove a password from my PDF?",
        answer: t('faq.security.answer2') || "Yes, use our 'Unlock PDF' tool. You'll need to provide the current password to remove protection. Note that we only help remove password protection from documents you own or have authorization to modify."
      },
      {
        question: t('faq.security.question3') || "What encryption level do you use for PDF protection?",
        answer: t('faq.security.answer3') || "We use industry-standard 256-bit AES encryption for PDF protection, which offers strong security for your documents. We also support 128-bit encryption if you need compatibility with older PDF readers."
      }
    ],
    account: [
      {
        question: t('faq.account.question1') || "How do I upgrade my subscription?",
        answer: t('faq.account.answer1') || "Log in to your account, go to Dashboard, and select the 'Subscription' tab. Choose the plan that meets your needs and follow the payment instructions. Your new features will be activated immediately after payment."
      },
      {
        question: t('faq.account.question2') || "Can I cancel my subscription?",
        answer: t('faq.account.answer2') || "Yes, you can cancel your subscription at any time from your Dashboard under the 'Subscription' tab. You'll continue to have access to premium features until the end of your current billing period."
      },
      {
        question: t('faq.account.question3') || "How do I reset my password?",
        answer: t('faq.account.answer3') || "On the login page, click 'Forgot password?' and enter your email address. We'll send you a password reset link that will be valid for 1 hour. If you don't receive the email, check your spam folder or contact support."
      }
    ],
    api: [
      {
        question: t('faq.api.question1') || "How do I get an API key?",
        answer: t('faq.api.answer1') || "Register for an account, then go to Dashboard > API Keys to create your first API key. Free accounts get 1 API key, Basic subscribers get 3, Pro subscribers get 10, and Enterprise users get 50+ keys."
      },
      {
        question: t('faq.api.question2') || "What are the API rate limits?",
        answer: t('faq.api.answer2') || "Rate limits depend on your subscription tier: Free (10 requests/hour), Basic (100 requests/hour), Pro (1,000 requests/hour), Enterprise (5,000+ requests/hour). Monthly operation limits also apply to each tier."
      },
      {
        question: t('faq.api.question3') || "How do I integrate the API with my application?",
        answer: t('faq.api.answer3') || "Our API uses standard REST endpoints with JSON responses. You can find comprehensive documentation, code samples, and SDKs in our Developer section. We provide examples for various programming languages including JavaScript, Python, PHP, and Java."
      }
    ]
  };

  return (
    <div className="container max-w-4xl py-12 mx-auto px-4">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="mb-6 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 inline-block">
          <HelpCircle className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          {t('splitPdf.faq.title') || "Frequently Asked Questions"}
        </h1>
       
      </section>

      {/* FAQ Categories */}
      <div className="grid gap-8 mb-12">
        {/* General Questions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('faq.categories.general') || "General Questions"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.general.map((faq, index) => (
                <AccordionItem key={`general-${index}`} value={`general-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Conversion Questions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('faq.categories.conversion') || "Conversion Questions"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.conversion.map((faq, index) => (
                <AccordionItem key={`conversion-${index}`} value={`conversion-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Security Questions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('faq.categories.security') || "Security Questions"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.security.map((faq, index) => (
                <AccordionItem key={`security-${index}`} value={`security-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Account Questions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('faq.categories.account') || "Account Questions"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.account.map((faq, index) => (
                <AccordionItem key={`account-${index}`} value={`account-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* API Questions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('faq.categories.api') || "API Questions"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.api.map((faq, index) => (
                <AccordionItem key={`api-${index}`} value={`api-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
 {/* CTA Section */}
 <section className="bg-muted/20 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          If you couldn't find the answer you were looking for, our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <LanguageLink href="/help">
            <Button className="w-full sm:w-auto">
              Visit Help Center
            </Button>
          </LanguageLink>
          <LanguageLink href="/contact">
            <Button variant="outline" className="w-full sm:w-auto">
              Contact Support
            </Button>
          </LanguageLink>
        </div>
      </section>
    </div>
  );
}