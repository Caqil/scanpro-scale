"use client";

import { Button } from "@/components/ui/button";
import { Code, ExternalLink, Key } from "lucide-react";

export default function Hero() {
  return (
    <div className="mx-auto flex flex-col items-center text-center mb-12">
      <div className="mb-4 p-3 rounded-full bg-primary/10">
        <Code className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
        MegaPDF API Documentation
      </h1>
      <p className="mt-2 text-xl text-muted-foreground max-w-[700px]">
        Powerful PDF processing capabilities for your applications
      </p>
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        <Button size="lg">
          Get API Key <Key className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" size="lg" asChild>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
