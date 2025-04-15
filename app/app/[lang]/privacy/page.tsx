// app/privacy/page.tsx
import { LanguageLink } from "@/components/language-link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | ScanPro - PDF Tools",
  description: "Privacy Policy for ScanPro PDF Tools. Learn how we handle your data and protect your privacy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <div className="mb-8 flex items-center">
      
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>

      <div className="space-y-6 text-base">
        <p className="text-muted-foreground">Last Updated: March 18, 2025</p>

        <p>This Privacy Policy describes how ScanPro collects, uses, and discloses information when you use our website, mobile applications, and services (collectively, the Services).</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
        <p>We collect several types of information from and about users of our Services:</p>

        <h3 className="text-xl font-bold mt-6 mb-2">1.1. Information You Provide to Us</h3>
        <p><span className="font-semibold">Account Information:</span> When you register for an account, we collect your name, email address, and password.</p>
        <p><span className="font-semibold">Payment Information:</span> If you purchase premium services, we collect payment information, which may include credit card details, billing address, and other financial information. Payment processing is handled by our third-party payment processors, and we do not store complete credit card information on our servers.</p>
        <p><span className="font-semibold">Files and Content:</span> We collect the files you upload to our Services for processing (such as PDFs and other documents).</p>
        <p><span className="font-semibold">Communications:</span> If you contact us directly, we may collect information about your communication and any additional information you provide.</p>

        <h3 className="text-xl font-bold mt-6 mb-2">1.2. Information We Collect Automatically</h3>
        <p><span className="font-semibold">Usage Data:</span> We collect information about how you interact with our Services, including the features you use, the time spent on the Services, and the pages you visit.</p>
        <p><span className="font-semibold">Device and Connection Information:</span> We collect information about your device and internet connection, including your IP address, browser type, operating system, and device identifiers.</p>
        <p><span className="font-semibold">Cookies and Similar Technologies:</span> We use cookies and similar tracking technologies to track activity on our Services and to maintain certain information. For more information about our use of cookies, please see Section 5 below.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
        <p>We use the information we collect for various purposes, including to:</p>
        <ul className="list-disc pl-8 space-y-2">
          <li>Provide, maintain, and improve our Services</li>
          <li>Process and complete transactions, and send related information including confirmations</li>
          <li>Send administrative information, such as updates, security alerts, and support messages</li>
          <li>Respond to your comments, questions, and requests, and provide customer service</li>
          <li>Communicate with you about products, services, offers, promotions, and events</li>
          <li>Monitor and analyze trends, usage, and activities in connection with our Services</li>
          <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
          <li>Personalize and improve your experience with our Services</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Handle Your Files</h2>

        <h3 className="text-xl font-bold mt-6 mb-2">3.1. File Processing</h3>
        <p>Files you upload to our Services are processed on our servers to provide the requested conversion or manipulation functionality. This processing is typically automated and does not involve human review of your content.</p>

        <h3 className="text-xl font-bold mt-6 mb-2">3.2. File Storage and Retention</h3>
        <p><span className="font-semibold">Temporary Storage:</span> Uploaded files are stored temporarily on our servers to provide our Services. Files are automatically deleted after 24 hours unless you are a premium user with extended storage options.</p>
        <p><span className="font-semibold">Converted Files:</span> The resulting converted or processed files are also stored temporarily and are available for download for 24 hours, after which they are automatically deleted.</p>

        <h3 className="text-xl font-bold mt-6 mb-2">3.3. File Security</h3>
        <p>We implement reasonable security measures designed to protect your files from unauthorized access, disclosure, alteration, or destruction. However, please note that no method of transmission over the internet or method of electronic storage is 100% secure.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. Sharing of Information</h2>
        <p>We may share information as follows:</p>

        <h3 className="text-xl font-bold mt-6 mb-2">4.1. Service Providers</h3>
        <p>We may share your information with third-party vendors, service providers, contractors, or agents who perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, and customer service.</p>

        <h3 className="text-xl font-bold mt-6 mb-2">4.2. Business Transfers</h3>
        <p>If we are involved in a merger, acquisition, financing, reorganization, bankruptcy, or sale of company assets, your information may be transferred as part of that transaction.</p>

        <h3 className="text-xl font-bold mt-6 mb-2">4.3. Legal Requirements</h3>
        <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Cookies and Tracking Technologies</h2>

        <h3 className="text-xl font-bold mt-6 mb-2">5.1. Types of Cookies We Use</h3>
        <p><span className="font-semibold">Essential Cookies:</span> These cookies are necessary for the Services to function properly.</p>
        <p><span className="font-semibold">Analytics Cookies:</span> We use these cookies to analyze how users interact with our Services, which helps us improve functionality and user experience.</p>
        <p><span className="font-semibold">Preference Cookies:</span> These cookies enable us to remember information that changes the way the Services behave or look, such as your preferred language or region.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. Your Rights and Choices</h2>
        <p>Depending on your location, you may have certain rights regarding your personal information:</p>
        <ul className="list-disc pl-8 space-y-2">
          <li>Request access to your personal information</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Object to our processing of your information</li>
          <li>Request restriction of processing</li>
          <li>Request data portability</li>
          <li>Withdraw consent at any time, where processing is based on consent</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">7. Contact Information</h2>
        <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:</p>
        <p className="mt-2"><span className="font-semibold">Email:</span> privacy@scanpro.cc<br />
        <span className="font-semibold">Address:</span> Indonesia, Bangka Belitung</p>

        <hr className="my-8 border-t border-gray-200 dark:border-gray-700" />

        <p>By using ScanPro, you acknowledge that you have read and understood this Privacy Policy.</p>
      </div>

      <div className="mt-8 flex justify-center">
        <LanguageLink href="/terms">
          <Button>View Terms of Service</Button>
        </LanguageLink>
      </div>
    </div>
  );
}