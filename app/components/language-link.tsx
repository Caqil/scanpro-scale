// components/language-link.tsx
"use client"
import Link from "next/link";
import { useParams } from "next/navigation";

interface LanguageLinkProps extends React.ComponentProps<typeof Link> {
  href: string;
  children: React.ReactNode;
}

export function LanguageLink({ href, children, ...props }: LanguageLinkProps) {
  const params = useParams();
  const lang = params?.lang || 'en';
  
  // Check if href already includes language prefix
  const hasLangPrefix = /^\/(en|id|es|fr|zh|ar|hi|ru|pt|de|ja|ko|it|tr)/.test(href);
  const langPrefixedHref = hasLangPrefix ? href : `/${lang}${href.startsWith('/') ? href : `/${href}`}`;
  
  return (
    <Link href={langPrefixedHref} {...props}>
      {children}
    </Link>
  );
}