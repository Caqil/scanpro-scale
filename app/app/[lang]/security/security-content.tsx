"use client";

import React from "react";
import {
  Shield,
  Lock,
  Globe,
  FileCheck2,
  Server,
  Key,
  ShieldAlert,
  CheckCircle2,
  Shield as ShieldIcon,
  Clock,
  RefreshCw,
  CloudOff,
  Award,
  Users,
  User,
  HelpCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";

export function SecurityContent() {
  const { t } = useLanguageStore();
  
  // Define security sections
  const securityMeasures = [
    {
      icon: <Lock className="h-8 w-8 text-blue-500" />,
      title: t('security.sections.encryption.title') || "End-to-End Encryption",
      description: t('security.sections.encryption.description') || "All files are encrypted during transfer with TLS 1.3 and at rest with AES-256 encryption. Your documents never travel unprotected."
    },
    {
      icon: <FileCheck2 className="h-8 w-8 text-green-500" />,
      title: t('security.sections.temporaryStorage.title') || "Temporary Storage",
      description: t('security.sections.temporaryStorage.description') || "Files are automatically deleted within 24 hours of processing. We don't keep your documents longer than necessary."
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-500" />,
      title: t('security.sections.access.title') || "Access Controls",
      description: t('security.sections.access.description') || "Robust authentication and authorization systems ensure only you can access your documents and account information."
    },
    {
      icon: <Server className="h-8 w-8 text-red-500" />,
      title: t('security.sections.infrastructure.title') || "Secure Infrastructure",
      description: t('security.sections.infrastructure.description') || "Our systems run on enterprise-grade cloud providers with ISO 27001 certification and regular security audits."
    },
    {
      icon: <Globe className="h-8 w-8 text-orange-500" />,
      title: t('security.sections.compliance.title') || "Compliance",
      description: t('security.sections.compliance.description') || "Our operations follow GDPR, CCPA, and other regional privacy regulations to ensure your data rights are protected."
    },
    {
      icon: <ShieldAlert className="h-8 w-8 text-amber-500" />,
      title: t('security.sections.monitoring.title') || "Continuous Monitoring",
      description: t('security.sections.monitoring.description') || "Automated and manual security reviews, vulnerability scans, and intrusion detection protect against emerging threats."
    }
  ];
  
  // Define privacy FAQs
  const privacyFaqs = [
    {
      question: t('security.faq.dataCollection.question') || "What personal data does ScanPro collect?",
      answer: t('security.faq.dataCollection.answer') || "We collect minimal information needed to provide our services. For registered users, this includes email, name, and usage statistics. We also collect anonymous usage data to improve our services. We don't analyze, scan, or mine the content of your documents."
    },
    {
      question: t('security.faq.documentStorage.question') || "How long do you store my documents?",
      answer: t('security.faq.documentStorage.answer') || "Documents are automatically deleted from our servers after processing, typically within 24 hours. For paid subscribers, document storage options are available, but these are opt-in features only."
    },
    {
      question: t('security.faq.thirdParty.question') || "Do you share my data with third parties?",
      answer: t('security.faq.thirdParty.answer') || "We do not sell or rent your personal data. We only share data with third parties when necessary to provide our services (such as payment processors for subscriptions) or when required by law. All third-party providers are carefully vetted and bound by data protection agreements."
    },
    {
      question: t('security.faq.security.question') || "How do you secure my data?",
      answer: t('security.faq.security.answer') || "We use industry-standard security measures including TLS encryption for data transfer, AES-256 encryption for stored data, secure infrastructure providers, access controls, and regular security audits. Our systems are designed with security as a priority."
    },
    {
      question: t('security.faq.rights.question') || "What are my rights regarding my data?",
      answer: t('security.faq.rights.answer') || "Depending on your region, you have rights including: access to your data, correction of inaccurate data, deletion of your data, restriction of processing, data portability, and objection to processing. To exercise these rights, contact our support team."
    },
    {
      question: t('security.faq.breach.question') || "What happens in case of a data breach?",
      answer: t('security.faq.breach.answer') || "We have protocols to detect, respond to, and notify affected users of any data breach in accordance with applicable laws. We conduct regular security assessments to minimize the risk of breaches and maintain a detailed incident response plan."
    }
  ];
  
  // Define certifications
  const certifications = [
    {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      name: "ISO 27001",
      description: "Information security management standard"
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      name: "GDPR Compliant",
      description: "European data protection regulation"
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      name: "CCPA Compliant",
      description: "California Consumer Privacy Act"
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      name: "SOC 2 Type II",
      description: "Service organization control audit"
    }
  ];

  return (
    <div className="container max-w-4xl py-12 mx-auto px-4">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="mb-6 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 inline-block">
          <Shield className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          {t('security.title') || "Security & Privacy at ScanPro"}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t('security.description') || "We take the security and privacy of your documents seriously. Learn how we protect your data."}
        </p>
      </section>

      {/* Security Measures */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          {t('security.measures.title') || "How We Protect Your Data"}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {securityMeasures.map((measure, index) => (
            <Card key={index} className="border transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="p-2 bg-primary/5 rounded-lg">
                  {measure.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{measure.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {measure.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tabs for Security & Privacy Details */}
      <section className="mb-16">
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="security">
              <ShieldIcon className="h-4 w-4 mr-2" />
              {t('security.tabs.security') || "Security"}
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <User className="h-4 w-4 mr-2" />
              {t('security.tabs.privacy') || "Privacy"}
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <Award className="h-4 w-4 mr-2" />
              {t('security.tabs.compliance') || "Compliance"}
            </TabsTrigger>
          </TabsList>
          
          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('security.tabContent.security.title') || "Our Security Approach"}</CardTitle>
                <CardDescription>
                  {t('security.tabContent.security.description') || "Comprehensive security measures to protect your files and data"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex gap-3">
                    <Key className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium">{t('security.tabContent.security.encryption.title') || "Strong Encryption"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('security.tabContent.security.encryption.description') || "We use TLS 1.3 for data in transit and AES-256 for data at rest. All file transfers are encrypted end-to-end."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Shield className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium">{t('security.tabContent.security.auth.title') || "Secure Authentication"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('security.tabContent.security.auth.description') || "Multi-factor authentication, secure password storage using bcrypt, and regular account monitoring for suspicious activities."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Server className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium">{t('security.tabContent.security.hosting.title') || "Secure Hosting"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('security.tabContent.security.hosting.description') || "Our infrastructure is hosted on enterprise-grade cloud providers with ISO 27001 certification. We implement network segmentation, firewalls, and intrusion detection systems."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <RefreshCw className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium">{t('security.tabContent.security.updates.title') || "Regular Updates"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('security.tabContent.security.updates.description') || "We maintain regular security patches and updates, conduct vulnerability assessments, and perform penetration testing to identify and address potential issues."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Privacy Tab */}
          <TabsContent value="privacy" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('security.tabContent.privacy.title') || "Privacy Practices"}</CardTitle>
                <CardDescription>
                  {t('security.tabContent.privacy.description') || "How we handle your personal data and documents"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {privacyFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                <div className="mt-6">
                  <LanguageLink href="/privacy-policy">
                    <Button variant="outline" className="w-full">
                      {t('security.tabContent.privacy.viewPolicy') || "View Full Privacy Policy"}
                    </Button>
                  </LanguageLink>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Compliance Tab */}
          <TabsContent value="compliance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('security.tabContent.compliance.title') || "Compliance & Certifications"}</CardTitle>
                <CardDescription>
                  {t('security.tabContent.compliance.description') || "Standards and regulations we adhere to"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {certifications.map((cert, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      {cert.icon}
                      <div>
                        <h3 className="font-medium">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground">{cert.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <h3 className="font-medium mb-4">{t('security.tabContent.compliance.approach.title') || "Our Compliance Approach"}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('security.tabContent.compliance.approach.description') || "ScanPro is designed with privacy and security by design principles. We regularly review and update our practices to comply with evolving regulations."}
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium mb-1">{t('security.tabContent.compliance.gdpr.title') || "GDPR Compliance"}</h4>
                      <ul className="list-disc pl-5 text-muted-foreground text-xs space-y-1">
                        <li>Data minimization principles</li>
                        <li>Right to access, delete & export</li>
                        <li>Transparent processing</li>
                        <li>Data protection by design</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium mb-1">{t('security.tabContent.compliance.hipaa.title') || "HIPAA Considerations"}</h4>
                      <ul className="list-disc pl-5 text-muted-foreground text-xs space-y-1">
                        <li>File encryption standards</li>
                        <li>Secure transmission protocols</li>
                        <li>Automatic file deletion</li>
                        <li>Access controls & logging</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Data Retention Section */}
      <section className="mb-16">
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudOff className="h-5 w-5 text-primary" />
              {t('security.retention.title') || "Data Retention Policy"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {t('security.retention.description') || "We follow strict data minimization practices. Here's how long we keep different types of data:"}
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">{t('security.retention.documents.title') || "Uploaded Documents"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('security.retention.documents.description') || "Files are automatically deleted from our servers within 24 hours of processing. We don't keep copies of your documents unless you explicitly opt into storage features available for paid plans."}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">{t('security.retention.account.title') || "Account Information"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('security.retention.account.description') || "Basic account information is kept as long as you maintain an active account. You can delete your account at any time, which will remove your personal information from our systems."}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">{t('security.retention.usage.title') || "Usage Data"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('security.retention.usage.description') || "Anonymous usage statistics are retained for up to 36 months to help us improve our services. This data cannot be used to identify you personally."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact Section */}
      <section className="mb-12 text-center">
        <h2 className="text-2xl font-bold mb-4">
          {t('security.contact.title') || "Have Security Questions?"}
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          {t('security.contact.description') || "Our security team is ready to answer your questions about how we protect your data and privacy."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <LanguageLink href="/contact">
            <Button>
              <HelpCircle className="mr-2 h-4 w-4" />
              {t('security.contact.button') || "Contact Security Team"}
            </Button>
          </LanguageLink>
          <LanguageLink href="/privacy-policy">
            <Button variant="outline">
              {t('security.policy.button') || "Privacy Policy"}
            </Button>
          </LanguageLink>
        </div>
      </section>
    </div>
  );
}