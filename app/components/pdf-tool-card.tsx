"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageLink } from "./language-link";
import { useLanguageStore } from "@/src/store/store";
import { useTheme } from "next-themes";
import { MagicCard } from "@/src/components/magicui/magic-card";


interface PdfToolCardProps {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  href: string;
  isNew?: boolean;
}

export function PdfToolCard({
  name,
  description,
  icon,
  iconBg,
  href,
  isNew
}: PdfToolCardProps) {
  const { t } = useLanguageStore();
  const { theme } = useTheme();
  
  return (
    <LanguageLink href={href} className="block h-full group">
       <MagicCard 
          gradientColor={theme === "dark" ? "#26262680" : "#D9D9D920"}
          className="h-full transform transition-all duration-300 group-hover:scale-[1.02]"
          spotlight
          spotlightColor={theme === "dark" ? "rgba(120, 120, 150, 0.25)" : "rgba(150, 150, 200, 0.15)"}
          borderColor={theme === "dark" ? "rgba(200, 200, 255, 0.12)" : "rgba(200, 200, 255, 0.15)"}
        >
          <div className="p-4 flex flex-col h-full relative z-10">
            {/* Highlight overlay that appears on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Mobile layout (stacked) */}
            <div className="sm:hidden space-y-2 relative">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-300", 
                  iconBg,
                  "group-hover:scale-110 group-hover:shadow-sm relative"
                )}>
                  {icon}
                  <div className="absolute inset-0 bg-white dark:bg-black opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                </div>
                
                {isNew && (
                  <Badge 
                    variant="outline" 
                    className="bg-primary/10 border-primary/20 text-primary-foreground text-xs px-1.5 py-0 h-4"
                  >
                    {t('ui.new')}
                  </Badge>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-base truncate group-hover:text-primary transition-colors duration-300">{name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{description}</p>
              </div>
            </div>
            
            {/* Desktop layout (side by side) */}
            <div className="hidden sm:flex items-start gap-3 relative">
              <div className={cn(
                "p-2 rounded-lg transition-all duration-300", 
                iconBg,
                "group-hover:scale-110 group-hover:shadow-sm relative"
              )}>
                {icon}
                <div className="absolute inset-0 bg-white dark:bg-black opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-base truncate group-hover:text-primary transition-colors duration-300">{name}</h3>
                  {isNew && (
                    <Badge 
                      variant="outline" 
                      className="bg-primary/10 border-primary/20 text-primary-white text-xs px-1.5 py-0 ml-1.5 h-4"
                    >
                      {t('ui.new')}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{description}</p>
              </div>
            </div>
            
           
          </div>
        </MagicCard>
    </LanguageLink>
  );
}