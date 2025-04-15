// app/terms/page.tsx
import { LanguageLink } from "@/components/language-link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | ScanPro - PDF Tools",
  description: "Terms of Service for ScanPro PDF Tools. Read about our terms and conditions for using our services.",
};

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <div className="mb-8 flex items-center">
        
        <h1 className="text-3xl font-bold">Terms of Service</h1>
      </div>

      <div className="space-y-6 text-base">
        <p className="text-muted-foreground">Last Updated: March 18, 2025</p>

        <p>Welcome to ScanPro. Please read these Terms of Service carefully before using our website, mobile applications, and services (collectively, the Services).</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Services</h2>
        <p>ScanPro provides tools for PDF document conversion, manipulation, and optimization, including but not limited to:</p>
        <ul className="list-disc pl-8 space-y-2">
          <li>Converting PDFs to various formats (DOCX, XLSX, JPG, etc.)</li>
          <li>Converting documents to PDF format</li>
          <li>Compressing PDF files</li>
          <li>Merging multiple PDF files</li>
          <li>Splitting PDF files into separate documents</li>
          <li>Rotating PDF pages</li>
          <li>Adding watermarks to PDF files</li>
          <li>Other PDF processing functions</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. Account Registration</h2>
        <p>3.1. Some features of our Services may require you to register for an account. When you register, you agree to provide accurate, current, and complete information.</p>
        <p>3.2. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
        <p>3.3. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. User Obligations</h2>
        <p><span className="font-semibold">4.1. Lawful Use.</span> You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree not to use our Services:</p>
        <ul className="list-disc pl-8 space-y-2">
          <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
          <li>To transmit any material that contains viruses, Trojan horses, worms, malware, or other harmful code</li>
          <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
        </ul>

        <p><span className="font-semibold">4.2. Content Ownership and Responsibility.</span> You retain all ownership rights to the files you upload to our Services. You are solely responsible for the content of your files and the legality of uploading, processing, and downloading such content.</p>
        
        <p><span className="font-semibold">4.3. No Sensitive Information.</span> You agree not to upload files containing sensitive personal information such as social security numbers, financial account information, health information, or any other information subject to specific regulatory protection.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Privacy</h2>
        <p>Your privacy is important to us. Our <LanguageLink href="/privacy" className="text-primary hover:underline">Privacy Policy</LanguageLink>, which is incorporated into these Terms by reference, explains how we collect, use, and disclose information about you.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. Intellectual Property Rights</h2>
        <p><span className="font-semibold">6.1. Our Intellectual Property.</span> The Services, including all content, features, and functionality, are owned by us, our licensors, or other providers and are protected by copyright, trademark, and other intellectual property laws.</p>
        
        <p><span className="font-semibold">6.2. Limited License to Use.</span> We grant you a limited, non-exclusive, non-transferable, revocable license to use our Services for your personal or internal business purposes.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">7. Disclaimers and Limitations of Liability</h2>
        <p><span className="font-semibold">7.1. Service Provided As Is.</span> The Services are provided on an AS IS and AS AVAILABLE basis, without warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
        
        <p><span className="font-semibold">7.2. Limitation of Liability.</span> To the fullest extent permitted by applicable law, in no event will we or our affiliates, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use or inability to use the Services, including any direct, indirect, special, incidental, consequential, or punitive damages.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">8. Term and Termination</h2>
        <p>8.1. These Terms shall remain in full force and effect while you use the Services.</p>
        
        <p>8.2. We may terminate or suspend your access to all or any part of the Services, with or without notice, for any conduct that we, in our sole discretion, believe is in violation of these Terms or is harmful to other users of the Services, us, or third parties, or for any other reason.</p>
        
        <p>8.3. Upon termination, your right to use the Services will immediately cease.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">9. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms at any time. We will provide notice of any material changes by posting the new Terms on the Services and updating the Last Updated date. Your continued use of the Services after such changes constitutes your acceptance of the new Terms.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact Information</h2>
        <p>If you have any questions about these Terms, please contact us at:</p>
        <p className="mt-2"><span className="font-semibold">Email:</span> support@scanpro.cc<br />
        <span className="font-semibold">Address:</span> Indonesia, Bangka Belitung</p>

        <hr className="my-8 border-t border-gray-200 dark:border-gray-700" />

        <p>By using ScanPro, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
      </div>

      <div className="mt-8 flex justify-center">
        <LanguageLink href="/privacy">
          <Button>View Privacy Policy</Button>
        </LanguageLink>
      </div>
    </div>
  );
}