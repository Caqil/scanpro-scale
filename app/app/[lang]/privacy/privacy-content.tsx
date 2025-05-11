// app/[lang]/privacy/privacy-content.tsx
"use client";

import { LanguageLink } from "@/components/language-link";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/src/store/store";

export function PrivacyContent() {
  const { t } = useLanguageStore();

  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <div className="mb-8 flex items-center">
        <h1 className="text-3xl font-bold">{t("privacy.title")}</h1>
      </div>

      <div className="space-y-6 text-base">
        <p className="text-muted-foreground">{t("privacy.lastUpdated")}</p>

        <p>{t("privacy.introduction")}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          {t("privacy.sections.informationWeCollect.title")}
        </h2>
        <p>{t("privacy.sections.informationWeCollect.description")}</p>

        <h3 className="text-xl font-bold mt-6 mb-2">
          {t("privacy.sections.informationYouProvide.title")}
        </h3>
        <p>
          <span className="font-semibold">
            {t("privacy.sections.informationYouProvide.account.label")}
          </span>{" "}
          {t("privacy.sections.informationYouProvide.account.description")}
        </p>
        <p>
          <span className="font-semibold">
            {t("privacy.sections.informationYouProvide.payment.label")}
          </span>{" "}
          {t("privacy.sections.informationYouProvide.payment.description")}
        </p>
        <p>
          <span className="font-semibold">
            {t("privacy.sections.informationYouProvide.files.label")}
          </span>{" "}
          {t("privacy.sections.informationYouProvide.files.description")}
        </p>
        <p>
          <span className="font-semibold">
            {t("privacy.sections.informationYouProvide.communications.label")}
          </span>{" "}
          {t(
            "privacy.sections.informationYouProvide.communications.description"
          )}
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2">
          {t("privacy.sections.automaticInformation.title")}
        </h3>
        <p>
          <span className="font-semibold">
            {t("privacy.sections.automaticInformation.usage.label")}
          </span>{" "}
          {t("privacy.sections.automaticInformation.usage.description")}
        </p>
        <p>
          <span className="font-semibold">
            {t("privacy.sections.automaticInformation.device.label")}
          </span>{" "}
          {t("privacy.sections.automaticInformation.device.description")}
        </p>
        <p>
          <span className="font-semibold">
            {t("privacy.sections.automaticInformation.cookies.label")}
          </span>{" "}
          {t("privacy.sections.automaticInformation.cookies.description")}
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          {t("privacy.sections.howWeUse.title")}
        </h2>
        <p>{t("privacy.sections.howWeUse.description")}</p>
        <ul className="list-disc pl-8 space-y-2">
          <li>{t("privacy.sections.howWeUse.purposes.purpose1")}</li>
          <li>{t("privacy.sections.howWeUse.purposes.purpose2")}</li>
          <li>{t("privacy.sections.howWeUse.purposes.purpose3")}</li>
          <li>{t("privacy.sections.howWeUse.purposes.purpose4")}</li>
          <li>{t("privacy.sections.howWeUse.purposes.purpose5")}</li>
          <li>{t("privacy.sections.howWeUse.purposes.purpose6")}</li>
          <li>{t("privacy.sections.howWeUse.purposes.purpose7")}</li>
          <li>{t("privacy.sections.howWeUse.purposes.purpose8")}</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          {t("privacy.sections.fileHandling.title")}
        </h2>

        <h3 className="text-xl font-bold mt-6 mb-2">
          {t("privacy.sections.fileHandling.processing.title")}
        </h3>
        <p>{t("privacy.sections.fileHandling.processing.description")}</p>

        <h3 className="text-xl font-bold mt-6 mb-2">
          {t("privacy.sections.fileHandling.storage.title")}
        </h3>
        <p>
          <span className="font-semibold">
            {t("privacy.sections.fileHandling.storage.temporary.label")}
          </span>{" "}
          {t("privacy.sections.fileHandling.storage.temporary.description")}
        </p>
        <p>
          <span className="font-semibold">
            {t("privacy.sections.fileHandling.storage.converted.label")}
          </span>{" "}
          {t("privacy.sections.fileHandling.storage.converted.description")}
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2">
          {t("privacy.sections.fileHandling.security.title")}
        </h3>
        <p>{t("privacy.sections.fileHandling.security.description")}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          {t("privacy.sections.sharing.title")}
        </h2>
        <p>{t("privacy.sections.sharing.description")}</p>

        <h3 className="text-xl font-bold mt-6 mb-2">
          {t("privacy.sections.sharing.serviceProviders.title")}
        </h3>
        <p>{t("privacy.sections.sharing.serviceProviders.description")}</p>

        <h3 className="text-xl font-bold mt-6 mb-2">
          {t("privacy.sections.sharing.businessTransfers.title")}
        </h3>
        <p>{t("privacy.sections.sharing.businessTransfers.description")}</p>

        <h3 className="text-xl font-bold mt-6 mb-2">
          {t("privacy.sections.sharing.legal.title")}
        </h3>
        <p>{t("privacy.sections.sharing.legal.description")}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          {t("privacy.sections.cookies.title")}
        </h2>

        <h3 className="text-xl font-bold mt-6 mb-2">
          {t("privacy.sections.cookies.types.title")}
        </h3>
        <p>
          <span className="font-semibold">
            {t("privacy.sections.cookies.types.essential.label")}
          </span>{" "}
          {t("privacy.sections.cookies.types.essential.description")}
        </p>
        <p>
          <span className="font-semibold">
            {t("privacy.sections.cookies.types.analytics.label")}
          </span>{" "}
          {t("privacy.sections.cookies.types.analytics.description")}
        </p>
        <p>
          <span className="font-semibold">
            {t("privacy.sections.cookies.types.preference.label")}
          </span>{" "}
          {t("privacy.sections.cookies.types.preference.description")}
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          {t("privacy.sections.rights.title")}
        </h2>
        <p>{t("privacy.sections.rights.description")}</p>
        <ul className="list-disc pl-8 space-y-2">
          <li>{t("privacy.sections.rights.options.option1")}</li>
          <li>{t("privacy.sections.rights.options.option2")}</li>
          <li>{t("privacy.sections.rights.options.option3")}</li>
          <li>{t("privacy.sections.rights.options.option4")}</li>
          <li>{t("privacy.sections.rights.options.option5")}</li>
          <li>{t("privacy.sections.rights.options.option6")}</li>
          <li>{t("privacy.sections.rights.options.option7")}</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          {t("privacy.sections.contact.title")}
        </h2>
        <p>{t("privacy.sections.contact.description")}</p>
        <p className="mt-2">
          <span className="font-semibold">
            {t("privacy.sections.contact.email.label")}
          </span>{" "}
          {t("privacy.sections.contact.email.value")}
          <br />
          <span className="font-semibold">
            {t("privacy.sections.contact.address.label")}
          </span>{" "}
          {t("privacy.sections.contact.address.value")}
        </p>

        <hr className="my-8 border-t border-gray-200 dark:border-gray-700" />

        <p>{t("privacy.acknowledgment")}</p>
      </div>

      <div className="mt-8 flex justify-center">
        <LanguageLink href="/terms">
          <Button>{t("privacy.viewTerms")}</Button>
        </LanguageLink>
      </div>
    </div>
  );
}
