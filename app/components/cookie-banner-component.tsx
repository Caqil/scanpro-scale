"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CookieIcon, X } from "lucide-react";

// Cookie preferences state
interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
}

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false
  });

  // Check if consent has been given on first render
  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    
    if (!consent) {
      setShowBanner(true);
    } else {
      try {
        const storedPreferences = JSON.parse(consent);
        setPreferences(storedPreferences);
      } catch (e) {
        localStorage.removeItem("cookie-consent");
        setShowBanner(true);
      }
    }
  }, []);

  // Save preferences and close banner
  const savePreferences = () => {
    localStorage.setItem("cookie-consent", JSON.stringify(preferences));
    setShowBanner(false);
    setShowPreferences(false);
    applyPreferences(preferences);
  };

  // Accept all cookies
  const acceptAll = () => {
    const allEnabled = {
      necessary: true,
      functional: true,
      analytics: true
    };
    
    setPreferences(allEnabled);
    localStorage.setItem("cookie-consent", JSON.stringify(allEnabled));
    setShowBanner(false);
    applyPreferences(allEnabled);
  };

  // Apply preferences by enabling/disabling appropriate scripts
  const applyPreferences = (prefs: CookiePreferences) => {
    if (prefs.functional) {
      // Load functional cookies
      console.log("Loading functional cookies");
    }
    
    if (prefs.analytics) {
      // Load analytics cookies
      console.log("Loading analytics cookies");
    }
  };

  // Toggle a specific preference
  const togglePreference = (type: keyof CookiePreferences) => {
    if (type === "necessary") return;
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // If no banner, show a small settings button
  if (!showBanner) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="icon"
          className="rounded-full h-10 w-10 shadow-md"
          onClick={() => setShowPreferences(true)}
          aria-label="Cookie Settings"
        >
          <CookieIcon className="h-5 w-5" />
        </Button>
        
        <CookiePreferencesDialog 
          open={showPreferences}
          onOpenChange={setShowPreferences}
          preferences={preferences}
          togglePreference={togglePreference}
          savePreferences={savePreferences}
        />
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-md mx-auto bg-background border rounded-lg shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CookieIcon className="h-6 w-6 text-primary" />
          <p className="text-sm">
            We use cookies to improve your experience.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowPreferences(true)}
          >
            Manage
          </Button>
          <Button 
            size="sm" 
            onClick={acceptAll}
          >
            Accept
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
            onClick={() => setShowBanner(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CookiePreferencesDialog 
        open={showPreferences}
        onOpenChange={setShowPreferences}
        preferences={preferences}
        togglePreference={togglePreference}
        savePreferences={savePreferences}
      />
    </div>
  );
}

// Separate dialog component for cookie preferences
function CookiePreferencesDialog({
  open,
  onOpenChange,
  preferences,
  togglePreference,
  savePreferences
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: CookiePreferences;
  togglePreference: (type: keyof CookiePreferences) => void;
  savePreferences: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Manage your cookie settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Necessary Cookies */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Necessary Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Essential cookies for site functionality
              </p>
            </div>
            <Switch 
              checked={preferences.necessary} 
              disabled 
            />
          </div>

          {/* Functional Cookies */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Functional Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Cookies to improve user experience
              </p>
            </div>
            <Switch 
              checked={preferences.functional} 
              onCheckedChange={() => togglePreference('functional')}
            />
          </div>

          {/* Analytics Cookies */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Analytics Cookies</Label>
              <p className="text-xs text-muted-foreground">
                Cookies for site performance tracking
              </p>
            </div>
            <Switch 
              checked={preferences.analytics} 
              onCheckedChange={() => togglePreference('analytics')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={savePreferences}>
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}