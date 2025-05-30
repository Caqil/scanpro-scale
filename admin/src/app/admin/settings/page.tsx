"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/auth";
import {
  Settings as SettingsIcon,
  Save,
  DollarSign,
  Mail,
  Globe,
  Shield,
  CreditCard,
  Database,
  Server,
  Key,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";

interface SettingsState {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    requireEmailVerification: boolean;
    appUrl: string;
    apiUrl: string;
    debug: boolean;
    port: number;
  };
  security: {
    jwtSecret: string;
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSymbols: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    corsAllowedOrigins: string;
  };
  email: {
    emailProvider: string;
    fromEmail: string;
    fromName: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean;
  };
  payment: {
    paypalClientId: string;
    paypalClientSecret: string;
    paypalApiBase: string;
  };
  api: {
    defaultRateLimit: number;
    maxFileSize: number;
    apiTimeout: number;
    loggingEnabled: boolean;
    logLevel: string;
  };
  database: {
    dbHost: string;
    dbPort: number;
    dbName: string;
    dbUser: string;
    dbPassword: string;
    dbCharset: string;
    dbCollation: string;
    dbTimezone: string;
    dbMaxIdleConns: number;
    dbMaxOpenConns: number;
    dbConnMaxLifetime: string;
  };
  oauth: {
    googleClientId: string;
    googleClientSecret: string;
    oauthRedirectUrl: string;
  };
  storage: {
    tempDir: string;
    uploadDir: string;
    publicDir: string;
    storagePath: string;
  };
  pricing: {
    operationCost: number;
    freeOperationsMonthly: number;
    customPrices: Record<string, number>;
  };
}

const defaultSettings: SettingsState = {
  general: {
    siteName: "MegaPDF",
    siteDescription: "Professional PDF tools and API services",
    maintenanceMode: false,
    registrationEnabled: true,
    requireEmailVerification: true,
    appUrl: "http://localhost:3000",
    apiUrl: "http://localhost:8080",
    debug: false,
    port: 8080,
  },
  security: {
    jwtSecret: "",
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    corsAllowedOrigins: "*",
  },
  email: {
    emailProvider: "smtp",
    fromEmail: "noreply@mega-pdf.com",
    fromName: "MegaPDF",
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    smtpSecure: false,
  },
  payment: {
    paypalClientId: "",
    paypalClientSecret: "",
    paypalApiBase: "https://api-m.sandbox.paypal.com",
  },
  api: {
    defaultRateLimit: 100,
    maxFileSize: 50,
    apiTimeout: 30,
    loggingEnabled: true,
    logLevel: "info",
  },
  database: {
    dbHost: "localhost",
    dbPort: 3306,
    dbName: "megapdf",
    dbUser: "root",
    dbPassword: "",
    dbCharset: "utf8mb4",
    dbCollation: "utf8mb4_unicode_ci",
    dbTimezone: "UTC",
    dbMaxIdleConns: 10,
    dbMaxOpenConns: 100,
    dbConnMaxLifetime: "1h",
  },
  oauth: {
    googleClientId: "",
    googleClientSecret: "",
    oauthRedirectUrl: "http://localhost:8080/api/auth/google/callback",
  },
  storage: {
    tempDir: "temp",
    uploadDir: "uploads",
    publicDir: "public",
    storagePath: "./storage",
  },
  pricing: {
    operationCost: 0.005,
    freeOperationsMonthly: 500,
    customPrices: {},
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [saveStatus, setSaveStatus] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      setLoading(true);

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.settings) {
          // Create a new settings object using defaults and overriding with fetched settings
          const newSettings = { ...defaultSettings };

          // For each category, merge defaults with fetched settings
          Object.keys(newSettings).forEach((category) => {
            if (data.settings[category]) {
              newSettings[category as keyof SettingsState] = {
                ...newSettings[category as keyof SettingsState],
                ...data.settings[category],
              };
            }
          });

          setSettings(newSettings);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (category: string) => {
    try {
      setSaving(true);
      setSaveStatus({ message: "", type: null });

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/${category}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            settings: settings[category as keyof SettingsState],
            description: `Updated ${category} settings`,
          }),
        }
      );

      if (response.ok) {
        setSaveStatus({
          message: `${
            category.charAt(0).toUpperCase() + category.slice(1)
          } settings saved successfully!`,
          type: "success",
        });

        // Refresh settings
        fetchAllSettings();
      } else {
        setSaveStatus({
          message: `Failed to save ${category} settings`,
          type: "error",
        });
      }
    } catch (error) {
      console.error(`Error saving ${category} settings:`, error);
      setSaveStatus({
        message: `Error saving ${category} settings: ${error}`,
        type: "error",
      });
    } finally {
      setSaving(false);

      // Clear status after 3 seconds
      setTimeout(() => {
        setSaveStatus({ message: "", type: null });
      }, 3000);
    }
  };

  const applySettings = async () => {
    try {
      setSaving(true);
      setSaveStatus({ message: "", type: null });

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/apply`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setSaveStatus({
          message:
            "Settings applied successfully! Some changes may require a server restart to take effect.",
          type: "success",
        });
      } else {
        setSaveStatus({
          message: "Failed to apply settings",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error applying settings:", error);
      setSaveStatus({
        message: `Error applying settings: ${error}`,
        type: "error",
      });
    } finally {
      setSaving(false);

      // Clear status after 5 seconds
      setTimeout(() => {
        setSaveStatus({ message: "", type: null });
      }, 5000);
    }
  };

  const exportSettings = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/export`
      );

      if (response.ok) {
        const data = await response.json();

        // Create and download the settings file
        const blob = new Blob([JSON.stringify(data.settings, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `megapdf-settings-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSaveStatus({
          message: "Settings exported successfully!",
          type: "success",
        });
      } else {
        setSaveStatus({
          message: "Failed to export settings",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error exporting settings:", error);
      setSaveStatus({
        message: `Error exporting settings: ${error}`,
        type: "error",
      });
    }

    // Clear status after 3 seconds
    setTimeout(() => {
      setSaveStatus({ message: "", type: null });
    }, 3000);
  };

  const importSettings = () => {
    // Create a file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      if (!e.target) return;

      const fileInput = e.target as HTMLInputElement;
      if (!fileInput.files || fileInput.files.length === 0) return;

      const file = fileInput.files[0];

      try {
        // Read the file
        const text = await file.text();
        const importedSettings = JSON.parse(text);

        // Import the settings
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/import`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              settings: importedSettings,
            }),
          }
        );

        if (response.ok) {
          setSaveStatus({
            message: "Settings imported successfully!",
            type: "success",
          });

          // Refresh settings
          fetchAllSettings();
        } else {
          setSaveStatus({
            message: "Failed to import settings",
            type: "error",
          });
        }
      } catch (error) {
        console.error("Error importing settings:", error);
        setSaveStatus({
          message: `Error importing settings: ${error}`,
          type: "error",
        });
      }

      // Clear status after 3 seconds
      setTimeout(() => {
        setSaveStatus({ message: "", type: null });
      }, 3000);
    };

    // Click the input to open the file dialog
    input.click();
  };

  const updateSettings = (
    category: keyof SettingsState,
    field: string,
    value: any
  ) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure all aspects of your MegaPDF installation
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportSettings}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={importSettings}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </button>
          <button
            onClick={fetchAllSettings}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={applySettings}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Apply All Settings
          </button>
        </div>
      </div>

      {/* Save Status Message */}
      {saveStatus.type && (
        <div
          className={`p-4 rounded-md ${
            saveStatus.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      {/* Settings Tabs */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
                activeTab === "general"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Globe className="h-4 w-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
                activeTab === "security"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Shield className="h-4 w-4" />
              Security
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
                activeTab === "email"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
                activeTab === "payment"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Payment
            </button>
            <button
              onClick={() => setActiveTab("api")}
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
                activeTab === "api"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Key className="h-4 w-4" />
              API
            </button>
            <button
              onClick={() => setActiveTab("database")}
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
                activeTab === "database"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Database className="h-4 w-4" />
              Database
            </button>
            <button
              onClick={() => setActiveTab("oauth")}
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
                activeTab === "oauth"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Key className="h-4 w-4" />
              OAuth
            </button>
            <button
              onClick={() => setActiveTab("storage")}
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
                activeTab === "storage"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Server className="h-4 w-4" />
              Storage
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
                activeTab === "pricing"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Pricing
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Site Name</label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) =>
                      updateSettings("general", "siteName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Site Description
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteDescription}
                    onChange={(e) =>
                      updateSettings(
                        "general",
                        "siteDescription",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">App URL</label>
                  <input
                    type="text"
                    value={settings.general.appUrl}
                    onChange={(e) =>
                      updateSettings("general", "appUrl", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Frontend application URL (e.g., https://mega-pdf.com)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">API URL</label>
                  <input
                    type="text"
                    value={settings.general.apiUrl}
                    onChange={(e) =>
                      updateSettings("general", "apiUrl", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Backend API URL (e.g., https://api.mega-pdf.com)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Port</label>
                  <input
                    type="number"
                    value={settings.general.port}
                    onChange={(e) =>
                      updateSettings(
                        "general",
                        "port",
                        parseInt(e.target.value) || 8080
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Server port (default: 8080)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Debug Mode</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.debug}
                      onChange={(e) =>
                        updateSettings("general", "debug", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Enable debug mode (more verbose logging)
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Maintenance Mode
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.maintenanceMode}
                      onChange={(e) =>
                        updateSettings(
                          "general",
                          "maintenanceMode",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Enable maintenance mode (site will be unavailable to
                      users)
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Registration</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.registrationEnabled}
                      onChange={(e) =>
                        updateSettings(
                          "general",
                          "registrationEnabled",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Enable user registration
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Email Verification
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.requireEmailVerification}
                      onChange={(e) =>
                        updateSettings(
                          "general",
                          "requireEmailVerification",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Require email verification for new accounts
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => saveSettings("general")}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save General Settings"}
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">JWT Secret</label>
                  <input
                    type="password"
                    value={settings.security.jwtSecret}
                    onChange={(e) =>
                      updateSettings("security", "jwtSecret", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Secret key for signing JWT tokens
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Password Minimum Length
                  </label>
                  <input
                    type="number"
                    min="6"
                    value={settings.security.passwordMinLength}
                    onChange={(e) =>
                      updateSettings(
                        "security",
                        "passwordMinLength",
                        parseInt(e.target.value) || 8
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Session Timeout (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      updateSettings(
                        "security",
                        "sessionTimeout",
                        parseInt(e.target.value) || 24
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) =>
                      updateSettings(
                        "security",
                        "maxLoginAttempts",
                        parseInt(e.target.value) || 5
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    CORS Allowed Origins
                  </label>
                  <input
                    type="text"
                    value={settings.security.corsAllowedOrigins}
                    onChange={(e) =>
                      updateSettings(
                        "security",
                        "corsAllowedOrigins",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of allowed origins, or * for all
                  </p>
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">
                    Password Requirements
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.passwordRequireUppercase}
                        onChange={(e) =>
                          updateSettings(
                            "security",
                            "passwordRequireUppercase",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Require uppercase
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.passwordRequireNumbers}
                        onChange={(e) =>
                          updateSettings(
                            "security",
                            "passwordRequireNumbers",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Require numbers
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.passwordRequireSymbols}
                        onChange={(e) =>
                          updateSettings(
                            "security",
                            "passwordRequireSymbols",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Require symbols
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => saveSettings("security")}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Security Settings"}
                </button>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === "email" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Provider</label>
                  <select
                    value={settings.email.emailProvider}
                    onChange={(e) =>
                      updateSettings("email", "emailProvider", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="smtp">SMTP</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailgun">Mailgun</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">From Email</label>
                  <input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) =>
                      updateSettings("email", "fromEmail", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">From Name</label>
                  <input
                    type="text"
                    value={settings.email.fromName}
                    onChange={(e) =>
                      updateSettings("email", "fromName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.email.smtpHost}
                    onChange={(e) =>
                      updateSettings("email", "smtpHost", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">SMTP Port</label>
                  <input
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) =>
                      updateSettings(
                        "email",
                        "smtpPort",
                        parseInt(e.target.value) || 587
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">SMTP Username</label>
                  <input
                    type="text"
                    value={settings.email.smtpUser}
                    onChange={(e) =>
                      updateSettings("email", "smtpUser", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">SMTP Password</label>
                  <input
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={(e) =>
                      updateSettings("email", "smtpPassword", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">SMTP Secure</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.email.smtpSecure}
                      onChange={(e) =>
                        updateSettings("email", "smtpSecure", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Use secure connection (TLS/SSL)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => saveSettings("email")}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Email Settings"}
                </button>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === "payment" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    PayPal Client ID
                  </label>
                  <input
                    type="text"
                    value={settings.payment.paypalClientId}
                    onChange={(e) =>
                      updateSettings(
                        "payment",
                        "paypalClientId",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    PayPal Client Secret
                  </label>
                  <input
                    type="password"
                    value={settings.payment.paypalClientSecret}
                    onChange={(e) =>
                      updateSettings(
                        "payment",
                        "paypalClientSecret",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    PayPal API Base URL
                  </label>
                  <input
                    type="text"
                    value={settings.payment.paypalApiBase}
                    onChange={(e) =>
                      updateSettings("payment", "paypalApiBase", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use https://api-m.sandbox.paypal.com for testing or
                    https://api-m.paypal.com for production
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => saveSettings("payment")}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Payment Settings"}
                </button>
              </div>
            </div>
          )}

          {/* API Settings */}
          {activeTab === "api" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Default Rate Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.api.defaultRateLimit}
                    onChange={(e) =>
                      updateSettings(
                        "api",
                        "defaultRateLimit",
                        parseInt(e.target.value) || 100
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum requests per minute per IP
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.api.maxFileSize}
                    onChange={(e) =>
                      updateSettings(
                        "api",
                        "maxFileSize",
                        parseInt(e.target.value) || 50
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    API Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={settings.api.apiTimeout}
                    onChange={(e) =>
                      updateSettings(
                        "api",
                        "apiTimeout",
                        parseInt(e.target.value) || 30
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Log Level</label>
                  <select
                    value={settings.api.logLevel}
                    onChange={(e) =>
                      updateSettings("api", "logLevel", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">API Logging</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.api.loggingEnabled}
                      onChange={(e) =>
                        updateSettings(
                          "api",
                          "loggingEnabled",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Enable detailed API request logging
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => saveSettings("api")}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save API Settings"}
                </button>
              </div>
            </div>
          )}

          {/* Database Settings */}
          {activeTab === "database" && (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md mb-4">
                <p className="font-medium">⚠️ Warning</p>
                <p className="text-sm">
                  Changing database settings requires restarting the application
                  server. Incorrect settings may cause the application to fail.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Database Host</label>
                  <input
                    type="text"
                    value={settings.database.dbHost}
                    onChange={(e) =>
                      updateSettings("database", "dbHost", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Database Port</label>
                  <input
                    type="number"
                    min="1"
                    max="65535"
                    value={settings.database.dbPort}
                    onChange={(e) =>
                      updateSettings(
                        "database",
                        "dbPort",
                        parseInt(e.target.value) || 3306
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Database Name</label>
                  <input
                    type="text"
                    value={settings.database.dbName}
                    onChange={(e) =>
                      updateSettings("database", "dbName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Database User</label>
                  <input
                    type="text"
                    value={settings.database.dbUser}
                    onChange={(e) =>
                      updateSettings("database", "dbUser", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Database Password
                  </label>
                  <input
                    type="password"
                    value={settings.database.dbPassword}
                    onChange={(e) =>
                      updateSettings("database", "dbPassword", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Database Charset
                  </label>
                  <input
                    type="text"
                    value={settings.database.dbCharset}
                    onChange={(e) =>
                      updateSettings("database", "dbCharset", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Database Collation
                  </label>
                  <input
                    type="text"
                    value={settings.database.dbCollation}
                    onChange={(e) =>
                      updateSettings("database", "dbCollation", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Database Timezone
                  </label>
                  <input
                    type="text"
                    value={settings.database.dbTimezone}
                    onChange={(e) =>
                      updateSettings("database", "dbTimezone", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Max Idle Connections
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.database.dbMaxIdleConns}
                    onChange={(e) =>
                      updateSettings(
                        "database",
                        "dbMaxIdleConns",
                        parseInt(e.target.value) || 10
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Max Open Connections
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.database.dbMaxOpenConns}
                    onChange={(e) =>
                      updateSettings(
                        "database",
                        "dbMaxOpenConns",
                        parseInt(e.target.value) || 100
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Connection Max Lifetime
                  </label>
                  <input
                    type="text"
                    value={settings.database.dbConnMaxLifetime}
                    onChange={(e) =>
                      updateSettings(
                        "database",
                        "dbConnMaxLifetime",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Duration format (e.g., 1h, 30m, 60s)
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => saveSettings("database")}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Database Settings"}
                </button>
              </div>
            </div>
          )}

          {/* OAuth Settings */}
          {activeTab === "oauth" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Google Client ID
                  </label>
                  <input
                    type="text"
                    value={settings.oauth.googleClientId}
                    onChange={(e) =>
                      updateSettings("oauth", "googleClientId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Google Client Secret
                  </label>
                  <input
                    type="password"
                    value={settings.oauth.googleClientSecret}
                    onChange={(e) =>
                      updateSettings(
                        "oauth",
                        "googleClientSecret",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">
                    OAuth Redirect URL
                  </label>
                  <input
                    type="text"
                    value={settings.oauth.oauthRedirectUrl}
                    onChange={(e) =>
                      updateSettings(
                        "oauth",
                        "oauthRedirectUrl",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Callback URL for OAuth providers (e.g.,
                    http://localhost:8080/api/auth/google/callback)
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => saveSettings("oauth")}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save OAuth Settings"}
                </button>
              </div>
            </div>
          )}

          {/* Storage Settings */}
          {activeTab === "storage" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Temp Directory</label>
                  <input
                    type="text"
                    value={settings.storage.tempDir}
                    onChange={(e) =>
                      updateSettings("storage", "tempDir", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Directory for temporary files
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Upload Directory
                  </label>
                  <input
                    type="text"
                    value={settings.storage.uploadDir}
                    onChange={(e) =>
                      updateSettings("storage", "uploadDir", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Directory for uploaded files
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Public Directory
                  </label>
                  <input
                    type="text"
                    value={settings.storage.publicDir}
                    onChange={(e) =>
                      updateSettings("storage", "publicDir", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Directory for publicly accessible files
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Storage Path</label>
                  <input
                    type="text"
                    value={settings.storage.storagePath}
                    onChange={(e) =>
                      updateSettings("storage", "storagePath", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Base path for all storage directories
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => saveSettings("storage")}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Storage Settings"}
                </button>
              </div>
            </div>
          )}

          {/* Pricing Settings */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Default Operation Cost (USD)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={settings.pricing.operationCost}
                    onChange={(e) =>
                      updateSettings(
                        "pricing",
                        "operationCost",
                        parseFloat(e.target.value) || 0.005
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Cost charged per API operation
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Free Operations Monthly Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.pricing.freeOperationsMonthly}
                    onChange={(e) =>
                      updateSettings(
                        "pricing",
                        "freeOperationsMonthly",
                        parseInt(e.target.value) || 500
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">
                  Custom Operation Pricing
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Set custom prices for specific operations. Leave empty to use
                  the default price.
                </p>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Compress</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={settings.pricing.customPrices?.compress || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newCustomPrices = {
                            ...settings.pricing.customPrices,
                          };
                          if (value === "") {
                            delete newCustomPrices.compress;
                          } else {
                            newCustomPrices.compress = parseFloat(value);
                          }
                          updateSettings(
                            "pricing",
                            "customPrices",
                            newCustomPrices
                          );
                        }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        placeholder={settings.pricing.operationCost.toString()}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">OCR</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={settings.pricing.customPrices?.ocr || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newCustomPrices = {
                            ...settings.pricing.customPrices,
                          };
                          if (value === "") {
                            delete newCustomPrices.ocr;
                          } else {
                            newCustomPrices.ocr = parseFloat(value);
                          }
                          updateSettings(
                            "pricing",
                            "customPrices",
                            newCustomPrices
                          );
                        }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        placeholder={settings.pricing.operationCost.toString()}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Protect</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={settings.pricing.customPrices?.protect || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newCustomPrices = {
                            ...settings.pricing.customPrices,
                          };
                          if (value === "") {
                            delete newCustomPrices.protect;
                          } else {
                            newCustomPrices.protect = parseFloat(value);
                          }
                          updateSettings(
                            "pricing",
                            "customPrices",
                            newCustomPrices
                          );
                        }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        placeholder={settings.pricing.operationCost.toString()}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Merge</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={settings.pricing.customPrices?.merge || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newCustomPrices = {
                            ...settings.pricing.customPrices,
                          };
                          if (value === "") {
                            delete newCustomPrices.merge;
                          } else {
                            newCustomPrices.merge = parseFloat(value);
                          }
                          updateSettings(
                            "pricing",
                            "customPrices",
                            newCustomPrices
                          );
                        }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        placeholder={settings.pricing.operationCost.toString()}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Split</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={settings.pricing.customPrices?.split || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newCustomPrices = {
                            ...settings.pricing.customPrices,
                          };
                          if (value === "") {
                            delete newCustomPrices.split;
                          } else {
                            newCustomPrices.split = parseFloat(value);
                          }
                          updateSettings(
                            "pricing",
                            "customPrices",
                            newCustomPrices
                          );
                        }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        placeholder={settings.pricing.operationCost.toString()}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Convert</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={settings.pricing.customPrices?.convert || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newCustomPrices = {
                            ...settings.pricing.customPrices,
                          };
                          if (value === "") {
                            delete newCustomPrices.convert;
                          } else {
                            newCustomPrices.convert = parseFloat(value);
                          }
                          updateSettings(
                            "pricing",
                            "customPrices",
                            newCustomPrices
                          );
                        }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        placeholder={settings.pricing.operationCost.toString()}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => saveSettings("pricing")}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Pricing Settings"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
