"use client";

import { useState } from "react";
import { useLanguageStore } from "@/src/store/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageLink } from "@/components/language-link";
import { ApiKeyDisplay } from "./api-key-display";
import { EndpointsList } from "./endpoints-list";
import { CodeExamples } from "./code-examples";
import { ApiPricing } from "./api-pricing";
import { 
  PuzzleIcon, 
  CodeIcon, 
  KeyIcon, 
  ZapIcon, 
  FileText, 
  Server, 
  BookOpen,
  LightbulbIcon
} from "lucide-react";

export function DeveloperPageClient() {
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container max-w-6xl py-12 mx-auto">
      {/* Hero Section */}
      <div className="mx-auto flex flex-col items-center text-center mb-12">
        <div className="mb-4 p-3 rounded-full bg-primary/10">
          <CodeIcon className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t('developer.title') || "Developer API Documentation"}
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
          {t('developer.description') || "Integrate ScanPro's powerful PDF tools into your applications with our RESTful API"}
        </p>
      </div>
      {/* Main Content Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-5 md:grid-cols-5 mb-4">
          <TabsTrigger value="overview">
            <BookOpen className="h-4 w-4 mr-2 hidden md:inline-block" />
            {t('developer.tabs.overview') || "Overview"}
          </TabsTrigger>
          <TabsTrigger value="authentication">
            <KeyIcon className="h-4 w-4 mr-2 hidden md:inline-block" />
            {t('developer.tabs.authentication') || "Authentication"}
          </TabsTrigger>
          <TabsTrigger value="endpoints">
            <Server className="h-4 w-4 mr-2 hidden md:inline-block" />
            {t('developer.tabs.endpoints') || "Endpoints"}
          </TabsTrigger>
          <TabsTrigger value="examples">
            <CodeIcon className="h-4 w-4 mr-2 hidden md:inline-block" />
            {t('developer.tabs.examples') || "Examples"}
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <ZapIcon className="h-4 w-4 mr-2 hidden md:inline-block" />
            {t('developer.tabs.pricing') || "Pricing"}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('developer.overview.title') || "API Overview"}</CardTitle>
              <CardDescription>{t('developer.overview.subtitle') || "Everything you need to know about our API"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none dark:prose-invert">
                <p>
                  {t('developer.overview.intro') || 
                    "The ScanPro API allows you to integrate our PDF processing capabilities directly into your applications. With a simple RESTful interface, you can convert, compress, merge, split, and perform other operations on PDFs programmatically."}
                </p>
                
                <h3>{t('developer.overview.features.title') || "Key Features"}</h3>
                <ul>
                  <li>{t('developer.overview.features.restful') || "RESTful API with JSON responses"}</li>
                  <li>{t('developer.overview.features.authentication') || "Simple authentication with API keys"}</li>
                  <li>{t('developer.overview.features.operations') || "Comprehensive PDF operations including conversion, compression, merging, and more"}</li>
                  <li>{t('developer.overview.features.scalable') || "Scalable pricing tiers to match your needs"}</li>
                  <li>{t('developer.overview.features.secure') || "Secure file handling with encrypted transfers and automatic file deletion"}</li>
                </ul>
                
                <h3>{t('developer.overview.gettingStarted') || "Getting Started"}</h3>
                <p>
                  {t('developer.overview.startSteps') || 
                    "To get started with the ScanPro API:"}
                </p>
                <ol>
                  <li>{t('developer.overview.step1') || "Sign up for an account"}</li>
                  <li>{t('developer.overview.step2') || "Generate an API key from your dashboard"}</li>
                  <li>{t('developer.overview.step3') || "Make your first API request using the examples provided"}</li>
                </ol>
              </div>
            </CardContent>
            <CardFooter>
              <LanguageLink href="/dashboard">
                <Button>{t('developer.overview.getStarted') || "Get Started"}</Button>
              </LanguageLink>
            </CardFooter>
          </Card>

          {/* Tools Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    {t('developer.tools.conversion.title') || "PDF Conversion"}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('developer.tools.conversion.description') || 
                    "Convert PDFs to various formats (DOCX, XLSX, JPG) and vice versa."}
                </p>
              </CardContent>
              <CardFooter>
                <LanguageLink href="#" onClick={() => { setActiveTab("endpoints"); }}>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('developer.tools.viewEndpoints') || "View Endpoints"}
                  </Button>
                </LanguageLink>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/30">
                      <ZapIcon className="h-5 w-5 text-green-500" />
                    </div>
                    {t('developer.tools.manipulation.title') || "PDF Manipulation"}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('developer.tools.manipulation.description') || 
                    "Merge multiple PDFs, split PDFs into separate files, or compress PDFs to reduce file size."}
                </p>
              </CardContent>
              <CardFooter>
                <LanguageLink href="#" onClick={() => { setActiveTab("endpoints"); }}>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('developer.tools.viewEndpoints') || "View Endpoints"}
                  </Button>
                </LanguageLink>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/30">
                      <KeyIcon className="h-5 w-5 text-purple-500" />
                    </div>
                    {t('developer.tools.security.title') || "PDF Security"}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('developer.tools.security.description') || 
                    "Add password protection, unlock protected PDFs, and add watermarks for document security."}
                </p>
              </CardContent>
              <CardFooter>
                <LanguageLink href="#" onClick={() => { setActiveTab("endpoints"); }}>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('developer.tools.viewEndpoints') || "View Endpoints"}
                  </Button>
                </LanguageLink>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('developer.authentication.title') || "API Authentication"}</CardTitle>
              <CardDescription>
                {t('developer.authentication.subtitle') || "Secure your API requests with API keys"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none dark:prose-invert">
                <h3>{t('developer.authentication.apiKeys.title') || "API Keys"}</h3>
                <p>
                  {t('developer.authentication.apiKeys.description') || 
                    "All requests to the ScanPro API require authentication using an API key. Your API key carries many privileges, so be sure to keep it secure!"}
                </p>
                
                <h4>{t('developer.authentication.howTo.title') || "How to Authenticate"}</h4>
                <p>
                  {t('developer.authentication.howTo.description') || 
                    "You can authenticate your API requests in one of two ways:"}
                </p>
                
                <h5>{t('developer.authentication.header.title') || "1. Using the HTTP Header (Recommended)"}</h5>
                <p>
                  {t('developer.authentication.header.description') || 
                    "Include your API key in the x-api-key header of your HTTP request:"}
                </p>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  <code>curl -X POST \<br />  -H "x-api-key: YOUR_API_KEY" \<br />  -F "file=@document.pdf" \<br />  https://scanpro.cc/api/convert</code>
                </pre>
                
                <h5>{t('developer.authentication.query.title') || "2. Using a Query Parameter"}</h5>
                <p>
                  {t('developer.authentication.query.description') || 
                    "Alternatively, you can include your API key as a query parameter:"}
                </p>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  <code>curl -X POST \<br />  -F "file=@document.pdf" \<br />  https://scanpro.cc/api/convert?api_key=YOUR_API_KEY</code>
                </pre>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-md my-4">
                  <h5 className="flex items-center text-amber-800 dark:text-amber-400 font-medium mb-2">
                    <LightbulbIcon className="h-5 w-5 mr-2" />
                    {t('developer.authentication.security.title') || "Security Best Practices"}
                  </h5>
                  <ul className="text-amber-700 dark:text-amber-300 text-sm space-y-1 ml-7">
                    <li>{t('developer.authentication.security.item1') || "Never share your API key publicly"}</li>
                    <li>{t('developer.authentication.security.item2') || "Don't store API keys in client-side code"}</li>
                    <li>{t('developer.authentication.security.item3') || "Set appropriate permissions for your API keys"}</li>
                    <li>{t('developer.authentication.security.item4') || "Rotate your API keys periodically"}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <ApiKeyDisplay />
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('developer.authentication.limits.title') || "Rate Limits & Quotas"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                <p>
                  {t('developer.authentication.limits.description') || 
                    "API requests are subject to rate limits based on your subscription tier:"}
                </p>
                
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th>{t('developer.authentication.limits.plan') || "Plan"}</th>
                        <th>{t('developer.authentication.limits.operations') || "Operations"}</th>
                        <th>{t('developer.authentication.limits.rate') || "Rate Limit"}</th>
                        <th>{t('developer.authentication.limits.keys') || "API Keys"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Free</td>
                        <td>100 / month</td>
                        <td>10 / hour</td>
                        <td>1</td>
                      </tr>
                      <tr>
                        <td>Basic</td>
                        <td>1,000 / month</td>
                        <td>100 / hour</td>
                        <td>3</td>
                      </tr>
                      <tr>
                        <td>Pro</td>
                        <td>10,000 / month</td>
                        <td>1,000 / hour</td>
                        <td>10</td>
                      </tr>
                      <tr>
                        <td>Enterprise</td>
                        <td>100,000+ / month</td>
                        <td>5,000+ / hour</td>
                        <td>50+</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <h4>{t('developer.authentication.errors.title') || "Rate Limit Errors"}</h4>
                <p>
                  {t('developer.authentication.errors.description') || 
                    "When you exceed your rate limit, the API will return a 429 Too Many Requests response with the following headers:"}
                </p>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  <code>{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2023-12-31T23:59:59Z`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints">
          <EndpointsList />
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples">
          <CodeExamples />
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <ApiPricing />
        </TabsContent>
      </Tabs>
    </div>
  );
}