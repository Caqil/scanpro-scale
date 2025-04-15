"use client";
import { PdfChat } from "@/components/pdf-chat";
import { useLanguageStore } from "@/src/store/store";

export function AskPdfContent() {
  const { t } = useLanguageStore();

  return (
    <div className="container max-w-5xl py-12 mx-auto">
      <div className="mx-auto flex flex-col items-center text-center mb-8">
        <div className="mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
          <MessageSquareIcon className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("pdfChat.title")}
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
          {t("pdfChat.description")}
        </p>
      </div>

      <div className="mb-12">
        <PdfChat />
      </div>

      <div className="mb-12 bg-muted/30 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t("pdfChat.howItWorks.title")}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="font-bold">1</span>
            </div>
            <h3 className="text-lg font-medium mb-2">
              {t("pdfChat.howItWorks.step1.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("pdfChat.howItWorks.step1.description")}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="font-bold">2</span>
            </div>
            <h3 className="text-lg font-medium mb-2">
              {t("pdfChat.howItWorks.step2.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("pdfChat.howItWorks.step2.description")}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="font-bold">3</span>
            </div>
            <h3 className="text-lg font-medium mb-2">
              {t("pdfChat.howItWorks.step3.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("pdfChat.howItWorks.step3.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-12 bg-muted/30 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t("pdfChat.whatYouCanAsk.title")}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <div className="bg-background rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
              <SummaryIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">
                {t("pdfChat.whatYouCanAsk.summary.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("pdfChat.whatYouCanAsk.summary.description")}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-background rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
              <SearchIcon className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">
                {t("pdfChat.whatYouCanAsk.find.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("pdfChat.whatYouCanAsk.find.description")}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-background rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
              <ListIcon className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">
                {t("pdfChat.whatYouCanAsk.extract.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("pdfChat.whatYouCanAsk.extract.description")}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-background rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
              <ExplainIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">
                {t("pdfChat.whatYouCanAsk.explain.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("pdfChat.whatYouCanAsk.explain.description")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t("pdfChat.faq.title")}
        </h2>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              {t("pdfChat.faq.q1.question")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("pdfChat.faq.q1.answer")}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              {t("pdfChat.faq.q2.question")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("pdfChat.faq.q2.answer")}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              {t("pdfChat.faq.q3.question")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("pdfChat.faq.q3.answer")}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              {t("pdfChat.faq.q4.question")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("pdfChat.faq.q4.answer")}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-muted-foreground">
        <h2 className="text-2xl font-bold mb-4">
          {t("pdfChat.seoContent.title")}
        </h2>
        <p>{t("pdfChat.seoContent.p1")}</p>
        <p className="mt-4">{t("pdfChat.seoContent.p2")}</p>
        <p className="mt-4">{t("pdfChat.seoContent.p3")}</p>
        <p className="mt-4">{t("pdfChat.seoContent.p4")}</p>
      </div>
    </div>
  );
}

// Icons
function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SummaryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <line x1="8" x2="16" y1="8" y2="8" />
      <line x1="8" x2="16" y1="12" y2="12" />
      <line x1="8" x2="12" y1="16" y2="16" />
    </svg>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  );
}

function ExplainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
