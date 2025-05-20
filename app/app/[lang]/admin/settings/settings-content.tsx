// app/[lang]/admin/settings/settings-content.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/src/context/auth-context";

export function SettingsContent() {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({
    general: false,
    api: false,
    email: false,
    security: false,
  });
  const [activeTab, setActiveTab] = useState("general");

  const [generalSettings, setGeneralSettings] = useState({
    siteName: "MegaPDF",
    siteDescription: "Professional PDF tools and API services",
    maintenanceMode: false,
    registrationEnabled: true,
    requireEmailVerification: true,
  });

  const [apiSettings, setApiSettings] = useState({
    defaultRateLimit: "100",
    maxFileSize: "50",
    apiTimeout: "30",
    enableLogging: true,
    logLevel: "info",
  });

  const [emailSettings, setEmailSettings] = useState({
    provider: "sendgrid",
    fromEmail: "noreply@megapdf.com",
    fromName: "MegaPDF",
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuthRequired: false,
    passwordMinLength: "8",
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: false,
    sessionTimeout: "24", // hours
    maxLoginAttempts: "5",
    blockTimeAfterFailures: "30", // minutes
    allowedIPs: "",
    jwtSecret: "", // This would typically be masked or not displayed
    corsAllowedOrigins: "*",
  });

  // Fetch settings from API
  useEffect(() => {
    async function fetchSettings() {
      if (!isAuthenticated || user?.role !== "admin") {
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.settings) {
          // Update state based on retrieved settings
          if (data.settings.general) {
            setGeneralSettings({
              siteName: data.settings.general.site_name || "MegaPDF", // Renamed field
              siteDescription:
                data.settings.general.site_description ||
                "Professional PDF tools and API services", // Renamed field
              maintenanceMode: data.settings.general.maintenance_mode === true, // Renamed field
              registrationEnabled:
                data.settings.general.registration_enabled !== false, // Renamed field
              requireEmailVerification:
                data.settings.general.require_email_verification !== false, // Renamed field
            });
          }

          if (data.settings.api) {
            setApiSettings({
              defaultRateLimit:
                data.settings.api.defaultRateLimit?.toString() || "100",
              maxFileSize: data.settings.api.maxFileSize?.toString() || "50",
              apiTimeout: data.settings.api.apiTimeout?.toString() || "30",
              enableLogging: data.settings.api.logging_enabled !== false, // Use the renamed field
              logLevel: data.settings.api.log_level || "info", // Use the renamed field
            });
          }

          if (data.settings.email) {
            setEmailSettings({
              provider: data.settings.email.email_provider || "sendgrid", // Renamed field
              fromEmail:
                data.settings.email.from_email || "noreply@megapdf.com", // Renamed field
              fromName: data.settings.email.from_name || "MegaPDF", // Renamed field
              smtpHost: data.settings.email.smtp_host || "", // Renamed field
              smtpPort: data.settings.email.smtp_port?.toString() || "587", // Renamed field
              smtpUser: data.settings.email.smtp_user || "", // Renamed field
              smtpPassword: data.settings.email.smtp_password || "", // Renamed field
            });
          }

          if (data.settings.security) {
            setSecuritySettings({
              twoFactorAuthRequired:
                data.settings.security.two_factor_required === true, // Renamed field
              passwordMinLength:
                data.settings.security.password_min_length?.toString() || "8", // Renamed field
              passwordRequireUppercase:
                data.settings.security.password_require_uppercase !== false, // Renamed field
              passwordRequireNumbers:
                data.settings.security.password_require_numbers !== false, // Renamed field
              passwordRequireSymbols:
                data.settings.security.password_require_symbols === true, // Renamed field
              sessionTimeout:
                data.settings.security.session_timeout?.toString() || "24", // Renamed field
              maxLoginAttempts:
                data.settings.security.max_login_attempts?.toString() || "5", // Renamed field
              blockTimeAfterFailures:
                data.settings.security.block_time_after_failures?.toString() ||
                "30", // Renamed field
              allowedIPs: data.settings.security.allowed_ips || "", // Renamed field
              jwtSecret: data.settings.security.jwt_secret || "", // Renamed field
              corsAllowedOrigins:
                data.settings.security.cors_allowed_origins || "*", // Renamed field
            });
          }
        } else {
          // Use defaults if no settings were found
          console.log(
            "No settings found or invalid response format. Using defaults."
          );
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load settings. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [isAuthenticated, user]);

  const handleSaveGeneral = async () => {
    try {
      setSaving({ ...saving, general: true });

      // Transform the settings object to avoid potential SQL keyword issues
      const transformedSettings = {
        site_name: generalSettings.siteName, // Renamed from 'siteName'
        site_description: generalSettings.siteDescription, // Renamed from 'siteDescription'
        maintenance_mode: generalSettings.maintenanceMode, // Renamed from 'maintenanceMode'
        registration_enabled: generalSettings.registrationEnabled, // Renamed from 'registrationEnabled'
        require_email_verification: generalSettings.requireEmailVerification, // Renamed from 'requireEmailVerification'
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/general`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            settings: transformedSettings,
            description: "General application settings",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save general settings: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("General settings saved successfully");
      } else {
        toast.error(data.error || "Failed to save general settings");
      }
    } catch (error) {
      console.error("Error saving general settings:", error);
      toast.error("Failed to save general settings");
    } finally {
      setSaving({ ...saving, general: false });
    }
  };

  const handleSaveApi = async () => {
    try {
      setSaving({ ...saving, api: true });

      // Transform the settings object to avoid using reserved SQL keywords in property names
      const transformedSettings = {
        defaultRateLimit: parseInt(apiSettings.defaultRateLimit),
        maxFileSize: parseInt(apiSettings.maxFileSize),
        apiTimeout: parseInt(apiSettings.apiTimeout),
        logging_enabled: apiSettings.enableLogging, // Renamed from 'enableLogging' to avoid SQL keyword issues
        log_level: apiSettings.logLevel, // Renamed from 'logLevel'
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/api`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            settings: transformedSettings,
            description: "API configuration settings",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save API settings: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("API settings saved successfully");
      } else {
        toast.error(data.error || "Failed to save API settings");
      }
    } catch (error) {
      console.error("Error saving API settings:", error);
      toast.error("Failed to save API settings");
    } finally {
      setSaving({ ...saving, api: false });
    }
  };

  const handleSaveEmail = async () => {
    try {
      setSaving({ ...saving, email: true });

      // Transform the settings object to avoid potential SQL keyword issues
      const transformedSettings = {
        email_provider: emailSettings.provider, // Renamed from 'provider'
        from_email: emailSettings.fromEmail, // Renamed from 'fromEmail'
        from_name: emailSettings.fromName, // Renamed from 'fromName'
        smtp_host: emailSettings.smtpHost, // Renamed from 'smtpHost'
        smtp_port: parseInt(emailSettings.smtpPort), // Renamed from 'smtpPort'
        smtp_user: emailSettings.smtpUser, // Renamed from 'smtpUser'
        smtp_password: emailSettings.smtpPassword, // Renamed from 'smtpPassword'
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            settings: transformedSettings,
            description: "Email configuration settings",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save email settings: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Email settings saved successfully");
      } else {
        toast.error(data.error || "Failed to save email settings");
      }
    } catch (error) {
      console.error("Error saving email settings:", error);
      toast.error("Failed to save email settings");
    } finally {
      setSaving({ ...saving, email: false });
    }
  };

  const handleSaveSecurity = async () => {
    try {
      setSaving({ ...saving, security: true });

      // Transform the settings object to avoid potential SQL keyword issues
      const transformedSettings = {
        two_factor_required: securitySettings.twoFactorAuthRequired, // Renamed
        password_min_length: parseInt(securitySettings.passwordMinLength), // Renamed
        password_require_uppercase: securitySettings.passwordRequireUppercase, // Renamed
        password_require_numbers: securitySettings.passwordRequireNumbers, // Renamed
        password_require_symbols: securitySettings.passwordRequireSymbols, // Renamed
        session_timeout: parseInt(securitySettings.sessionTimeout), // Renamed
        max_login_attempts: parseInt(securitySettings.maxLoginAttempts), // Renamed
        block_time_after_failures: parseInt(
          securitySettings.blockTimeAfterFailures
        ), // Renamed
        allowed_ips: securitySettings.allowedIPs, // Renamed
        jwt_secret: securitySettings.jwtSecret, // Renamed
        cors_allowed_origins: securitySettings.corsAllowedOrigins, // Renamed
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/security`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            settings: transformedSettings,
            description: "Security configuration settings",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save security settings: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Security settings saved successfully");
      } else {
        toast.error(data.error || "Failed to save security settings");
      }
    } catch (error) {
      console.error("Error saving security settings:", error);
      toast.error("Failed to save security settings");
    } finally {
      setSaving({ ...saving, security: false });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Authentication required to access settings.</p>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center p-8">
        <p>You need admin permissions to access settings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage system configuration and preferences
        </p>
      </div>

      <Tabs
        defaultValue="general"
        className="space-y-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger
            value="pricing"
            onClick={() =>
              (window.location.href = "/en/admin/settings/pricing")
            }
          >
            Pricing
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={generalSettings.siteName}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      siteName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      siteDescription: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable the site for maintenance
                  </p>
                </div>
                <Switch
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setGeneralSettings({
                      ...generalSettings,
                      maintenanceMode: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Registration Enabled</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register
                  </p>
                </div>
                <Switch
                  checked={generalSettings.registrationEnabled}
                  onCheckedChange={(checked) =>
                    setGeneralSettings({
                      ...generalSettings,
                      registrationEnabled: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require users to verify their email address
                  </p>
                </div>
                <Switch
                  checked={generalSettings.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    setGeneralSettings({
                      ...generalSettings,
                      requireEmailVerification: checked,
                    })
                  }
                />
              </div>
              <Button onClick={handleSaveGeneral} disabled={saving.general}>
                {saving.general ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Configure API behavior and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultRateLimit">
                  Default Rate Limit (requests/hour)
                </Label>
                <Input
                  id="defaultRateLimit"
                  type="number"
                  value={apiSettings.defaultRateLimit}
                  onChange={(e) =>
                    setApiSettings({
                      ...apiSettings,
                      defaultRateLimit: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={apiSettings.maxFileSize}
                  onChange={(e) =>
                    setApiSettings({
                      ...apiSettings,
                      maxFileSize: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiTimeout">API Timeout (seconds)</Label>
                <Input
                  id="apiTimeout"
                  type="number"
                  value={apiSettings.apiTimeout}
                  onChange={(e) =>
                    setApiSettings({
                      ...apiSettings,
                      apiTimeout: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable API Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all API requests and responses
                  </p>
                </div>
                <Switch
                  checked={apiSettings.enableLogging}
                  onCheckedChange={(checked) =>
                    setApiSettings({ ...apiSettings, enableLogging: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logLevel">Log Level</Label>
                <Select
                  value={apiSettings.logLevel}
                  onValueChange={(value) =>
                    setApiSettings({ ...apiSettings, logLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveApi} disabled={saving.api}>
                {saving.api ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure email service provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Email Provider</Label>
                <Select
                  value={emailSettings.provider}
                  onValueChange={(value) =>
                    setEmailSettings({ ...emailSettings, provider: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                    <SelectItem value="smtp">SMTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) =>
                    setEmailSettings({
                      ...emailSettings,
                      fromEmail: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={emailSettings.fromName}
                  onChange={(e) =>
                    setEmailSettings({
                      ...emailSettings,
                      fromName: e.target.value,
                    })
                  }
                />
              </div>
              {emailSettings.provider === "smtp" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={emailSettings.smtpHost}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          smtpHost: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={emailSettings.smtpPort}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          smtpPort: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={emailSettings.smtpUser}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          smtpUser: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          smtpPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Alert
                    variant="default"
                    className="mt-4 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle>Test Connection</AlertTitle>
                    <AlertDescription>
                      After saving your SMTP settings, consider sending a test
                      email to verify the configuration.
                    </AlertDescription>
                  </Alert>
                </>
              )}
              <Button onClick={handleSaveEmail} disabled={saving.email}>
                {saving.email ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Policy */}
              <div>
                <h3 className="text-lg font-medium mb-4">Password Policy</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">
                      Minimum Password Length
                    </Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      min="6"
                      max="32"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          passwordMinLength: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="passwordRequireUppercase">
                        Require Uppercase Letters
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Passwords must contain at least one uppercase letter
                      </p>
                    </div>
                    <Switch
                      id="passwordRequireUppercase"
                      checked={securitySettings.passwordRequireUppercase}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          passwordRequireUppercase: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="passwordRequireNumbers">
                        Require Numbers
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Passwords must contain at least one number
                      </p>
                    </div>
                    <Switch
                      id="passwordRequireNumbers"
                      checked={securitySettings.passwordRequireNumbers}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          passwordRequireNumbers: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="passwordRequireSymbols">
                        Require Special Characters
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Passwords must contain at least one special character
                      </p>
                    </div>
                    <Switch
                      id="passwordRequireSymbols"
                      checked={securitySettings.passwordRequireSymbols}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          passwordRequireSymbols: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Authentication Settings */}
              <div>
                <h3 className="text-lg font-medium mb-4">Authentication</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="twoFactorAuthRequired">
                        Require Two-Factor Authentication
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Force all users to set up 2FA for their accounts
                      </p>
                    </div>
                    <Switch
                      id="twoFactorAuthRequired"
                      checked={securitySettings.twoFactorAuthRequired}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          twoFactorAuthRequired: checked,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">
                      Session Timeout (hours)
                    </Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="1"
                      max="168"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          sessionTimeout: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* API Security */}
              <div>
                <h3 className="text-lg font-medium mb-4">API Security</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="corsAllowedOrigins">
                      CORS Allowed Origins
                    </Label>
                    <Input
                      id="corsAllowedOrigins"
                      value={securitySettings.corsAllowedOrigins}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          corsAllowedOrigins: e.target.value,
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Comma-separated list of origins allowed to access the API
                    </p>
                  </div>
                </div>
              </div>

              <Alert variant="default" className="bg-muted">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>More Security Options</AlertTitle>
                <AlertDescription>
                  Additional security settings like brute force protection and
                  IP restrictions are available in the dedicated Security
                  Settings page.
                </AlertDescription>
              </Alert>

              <Button onClick={handleSaveSecurity} disabled={saving.security}>
                {saving.security ? "Saving..." : "Save Basic Security Settings"}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  (window.location.href = "/en/admin/settings/security")
                }
              >
                Advanced Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
