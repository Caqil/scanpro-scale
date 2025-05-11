// app/[lang]/cookies/cookies-content.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguageStore } from "@/src/store/store";

export function CookiesContent() {
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState("what");

  return (
    <div className="container max-w-4xl py-12 mx-auto px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("cookies.lastUpdated")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("cookies.overview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t("cookies.intro")}
            </p>

            <Tabs
              defaultValue="what"
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                <TabsTrigger value="what">{t("cookies.tabs.what")}</TabsTrigger>
                <TabsTrigger value="types">
                  {t("cookies.tabs.types")}
                </TabsTrigger>
                <TabsTrigger value="how">{t("cookies.tabs.how")}</TabsTrigger>
                <TabsTrigger value="third-party">
                  {t("cookies.tabs.thirdParty")}
                </TabsTrigger>
                <TabsTrigger value="manage">
                  {t("cookies.tabs.manage")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="what" className="space-y-4">
                <h3 className="text-lg font-medium">
                  {t("cookies.whatAre.title")}
                </h3>
                <p>{t("cookies.whatAre.description")}</p>
                <p>{t("cookies.whatAre.purpose")}</p>
              </TabsContent>

              <TabsContent value="types" className="space-y-4">
                <h3 className="text-lg font-medium">
                  {t("cookies.types.title")}
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">
                      {t("cookies.types.essential.title")}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("cookies.types.essential.description")}
                    </p>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      <li>{t("cookies.types.essential.examples.session")}</li>
                      <li>{t("cookies.types.essential.examples.csrf")}</li>
                      <li>{t("cookies.types.essential.examples.load")}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">
                      {t("cookies.types.functional.title")}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("cookies.types.functional.description")}
                    </p>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      <li>{t("cookies.types.functional.examples.language")}</li>
                      <li>{t("cookies.types.functional.examples.theme")}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">
                      {t("cookies.types.analytics.title")}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("cookies.types.analytics.description")}
                    </p>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      <li>{t("cookies.types.analytics.examples.ga")}</li>
                      <li>{t("cookies.types.analytics.examples.heatmap")}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">
                      {t("cookies.types.advertising.title")}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("cookies.types.advertising.description")}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="how" className="space-y-4">
                <h3 className="text-lg font-medium">
                  {t("cookies.howWeUse.title")}
                </h3>
                <p>{t("cookies.howWeUse.description")}</p>

                <ul className="list-disc list-inside space-y-2">
                  <li>{t("cookies.howWeUse.purposes.authentication")}</li>
                  <li>{t("cookies.howWeUse.purposes.security")}</li>
                  <li>{t("cookies.howWeUse.purposes.preferences")}</li>
                  <li>{t("cookies.howWeUse.purposes.analytics")}</li>
                  <li>{t("cookies.howWeUse.purposes.features")}</li>
                </ul>
              </TabsContent>

              <TabsContent value="third-party" className="space-y-4">
                <h3 className="text-lg font-medium">
                  {t("cookies.thirdParty.title")}
                </h3>
                <p>{t("cookies.thirdParty.description")}</p>

                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="font-medium">Google Analytics</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("cookies.thirdParty.providers.analytics")}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">PayPal</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("cookies.thirdParty.providers.payment")}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Hotjar</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("cookies.thirdParty.providers.heatmap")}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="manage" className="space-y-4">
                <h3 className="text-lg font-medium">
                  {t("cookies.manage.title")}
                </h3>
                <p>{t("cookies.manage.description")}</p>

                <div className="space-y-3 mt-4">
                  <h4 className="font-medium">
                    {t("cookies.manage.browser.title")}
                  </h4>
                  <p className="text-sm">
                    {t("cookies.manage.browser.description")}
                  </p>

                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>
                      <span className="font-medium">Chrome: </span>
                      {t("cookies.manage.browser.chrome")}
                    </li>
                    <li>
                      <span className="font-medium">Firefox: </span>
                      {t("cookies.manage.browser.firefox")}
                    </li>
                    <li>
                      <span className="font-medium">Safari: </span>
                      {t("cookies.manage.browser.safari")}
                    </li>
                    <li>
                      <span className="font-medium">Edge: </span>
                      {t("cookies.manage.browser.edge")}
                    </li>
                  </ul>
                </div>

                <p className="text-sm mt-4">{t("manage.warning")}</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("cookies.contactUs.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {t("cookies.contactUs.description")}{" "}
              <a
                href="mailto:privacy@mega-pdf.com"
                className="text-primary hover:underline"
              >
                privacy@mega-pdf.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
