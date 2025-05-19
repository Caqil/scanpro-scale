// app/[lang]/admin/settings/settings-content.tsx
"use client";

import { useState } from "react";
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SettingsContent() {
  const [saving, setSaving] = useState({
    general: false,
    api: false,
    email: false,
    security: false,
  });

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

  const handleSaveGeneral = async () => {
    try {
      // Set loading state
      setSaving({ ...saving, general: true });

      // Implement save logic here
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("General settings saved successfully");
    } catch (error) {
      toast.error("Failed to save general settings");
    } finally {
      setSaving({ ...saving, general: false });
    }
  };

  const handleSaveApi = async () => {
    try {
      // Set loading state
      setSaving({ ...saving, api: true });

      // Implement save logic here
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("API settings saved successfully");
    } catch (error) {
      toast.error("Failed to save API settings");
    } finally {
      setSaving({ ...saving, api: false });
    }
  };

  const handleSaveEmail = async () => {
    try {
      // Set loading state
      setSaving({ ...saving, email: true });

      // Implement save logic here
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Email settings saved successfully");
    } catch (error) {
      toast.error("Failed to save email settings");
    } finally {
      setSaving({ ...saving, email: false });
    }
  };

  const handleSaveSecurity = async () => {
    try {
      // Set loading state
      setSaving({ ...saving, security: true });

      // Implement save logic here
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Security settings saved successfully");
    } catch (error) {
      toast.error("Failed to save security settings");
    } finally {
      setSaving({ ...saving, security: false });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage system configuration and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
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

              {/* API Security (Just the main settings) */}
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
