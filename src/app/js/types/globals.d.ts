import type { appTranslations } from '@datenanfragen/components';

declare global {
    interface Window {
        /** The current language version's base URL, including the trailing slash. */
        readonly BASE_URL: string;
        /** The site version as specified in `package.json`. */
        readonly CODE_VERSION: string;

        /** Two-letter ISO code of the site's language. */
        readonly LOCALE: string;

        readonly I18N_DEFINITION_APP: typeof appTranslations['en'];
    }
}
