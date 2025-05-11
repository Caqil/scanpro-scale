// app/[lang]/terms/terms-content.tsx
"use client";

import { LanguageLink } from "@/components/language-link";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/src/store/store";

export function TermsContent() {
  const { t } = useLanguageStore();

  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <div className="mb-8 flex items-center">
        <h1 className="text-3xl font-bold">{t('terms.title')}</h1>
      </div>

      <div className="space-y-6 text-base">
        <p className="text-muted-foreground">{t('terms.lastUpdated')}</p>

        <p>{t('terms.welcome')}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">{t('terms.sections.acceptance.title')}</h2>
        <p>{t('terms.sections.acceptance.content')}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">{t('terms.sections.services.title')}</h2>
        <p>{t('terms.sections.services.description')}</p>
        <ul className="list-disc pl-8 space-y-2">
          <li>{t('terms.sections.services.features.feature1')}</li>
          <li>{t('terms.sections.services.features.feature2')}</li>
          <li>{t('terms.sections.services.features.feature3')}</li>
          <li>{t('terms.sections.services.features.feature4')}</li>
          <li>{t('terms.sections.services.features.feature5')}</li>
          <li>{t('terms.sections.services.features.feature6')}</li>
          <li>{t('terms.sections.services.features.feature7')}</li>
          <li>{t('terms.sections.services.features.feature8')}</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">{t('terms.sections.account.title')}</h2>
        <p>{t('terms.sections.account.registration')}</p>
        <p>{t('terms.sections.account.responsibility')}</p>
        <p>{t('terms.sections.account.security')}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">{t('terms.sections.obligations.title')}</h2>
        <p><span className="font-semibold">{t('terms.sections.obligations.lawfulUse.title')}</span> {t('terms.sections.obligations.lawfulUse.description')}</p>
        <ul className="list-disc pl-8 space-y-2">
          <li>{t('terms.sections.obligations.lawfulUse.restrictions.restriction1')}</li>
          <li>{t('terms.sections.obligations.lawfulUse.restrictions.restriction2')}</li>
          <li>{t('terms.sections.obligations.lawfulUse.restrictions.restriction3')}</li>
        </ul>

        <p><span className="font-semibold">{t('terms.sections.obligations.content.title')}</span> {t('terms.sections.obligations.content.description')}</p>
        
        <p><span className="font-semibold">{t('terms.sections.obligations.sensitiveInfo.title')}</span> {t('terms.sections.obligations.sensitiveInfo.description')}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">{t('terms.sections.privacy.title')}</h2>
        <p>
          {t('terms.sections.privacy.description.before')} 
          <LanguageLink href="/privacy" className="text-primary hover:underline">
            {t('terms.sections.privacy.description.link')}
          </LanguageLink>
          {t('terms.sections.privacy.description.after')}
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">{t('terms.sections.intellectual.title')}</h2>
        <p><span className="font-semibold">{t('terms.sections.intellectual.ownership.title')}</span> {t('terms.sections.intellectual.ownership.description')}</p>
        
        <p><span className="font-semibold">{t('terms.sections.intellectual.license.title')}</span> {t('terms.sections.intellectual.license.description')}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">{t('terms.sections.disclaimers.title')}</h2>
        <p><span className="font-semibold">{t('terms.sections.disclaimers.asis.title')}</span> {t('terms.sections.disclaimers.asis.description')}</p>
        
        <p><span className="font-semibold">{t('terms.sections.disclaimers.liability.title')}</span> {t('terms.sections.disclaimers.liability.description')}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">{t('terms.sections.termination.title')}</h2>
        <p>{t('terms.sections.termination.duration')}</p>
        <p>{t('terms.sections.termination.rights')}</p>
        <p>{t('terms.sections.termination.effect')}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">{t('terms.sections.changes.title')}</h2>
        <p>{t('terms.sections.changes.description')}</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">{t('terms.sections.contact.title')}</h2>
        <p>{t('terms.sections.contact.description')}</p>
        <p className="mt-2">
          <span className="font-semibold">{t('terms.sections.contact.email.label')}</span> {t('terms.sections.contact.email.value')}<br />
          <span className="font-semibold">{t('terms.sections.contact.address.label')}</span> {t('terms.sections.contact.address.value')}
        </p>

        <hr className="my-8 border-t border-gray-200 dark:border-gray-700" />

        <p>{t('terms.agreement')}</p>
      </div>

      <div className="mt-8 flex justify-center">
        <LanguageLink href="/privacy">
          <Button>{t('terms.viewPrivacyPolicy')}</Button>
        </LanguageLink>
      </div>
    </div>
  );
}