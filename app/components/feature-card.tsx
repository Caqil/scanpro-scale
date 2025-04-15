import { MagicCard } from "@/src/components/magicui/magic-card";
import { useTheme } from "next-themes";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
    const { theme } = useTheme();
  return (
     <MagicCard 
              gradientColor={theme === "dark" ? "#26262680" : "#D9D9D920"}
              className="h-full transform transition-all duration-300 group-hover:scale-[1.02]"
              spotlight
              spotlightColor={theme === "dark" ? "rgba(120, 120, 150, 0.25)" : "rgba(150, 150, 200, 0.15)"}
              borderColor={theme === "dark" ? "rgba(200, 200, 255, 0.12)" : "rgba(200, 200, 255, 0.15)"}
            >
    <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full border p-3 group-hover:border-primary group-hover:text-primary transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div></MagicCard>
  );
}