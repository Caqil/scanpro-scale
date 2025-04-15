"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/src/store/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export function LanguageSwitcher({ variant = "default", size = "default" }: { 
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon"; 
}) {
  const { language, setLanguage } = useLanguageStore();
  // Add client-side rendering protection
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const languages: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: 'Chinese', nativeName: '中文 (Zhōngwén)', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية (al-ʿArabiyyah)', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी (Hindī)', flag: '🇮🇳' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский (Russkiy)', flag: '🇷🇺' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語 (Nihongo)', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어 (Hangugeo)', flag: '🇰🇷' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  // Don't render language content until after client-side hydration is complete
  if (!mounted) {
    return (
      <Button variant="ghost" size="sm">
        <Globe className="h-4 w-4" />
        <span>Language</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Globe className="h-4 w-4" />
          <span>{languages.find(lang => lang.code === language)?.name || 'Language'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="grid grid-cols-2 gap-2 p-2">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className="flex items-center space-x-2"
          >
            <span>{lang.flag}</span>
            <span>{lang.nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}