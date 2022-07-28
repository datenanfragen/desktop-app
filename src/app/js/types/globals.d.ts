import type i18n_definition_type from '../../i18n/en.json';

declare global {
    interface Window {
        /** The current language version's base URL, including the trailing slash. */
        readonly BASE_URL: string;
        /** The site version as specified in `package.json`. */
        readonly CODE_VERSION: string;

        /** Two-letter ISO code of the site's language. */
        readonly LOCALE: string;

        readonly I18N_DEFINITIONS_ELECTRON: typeof i18n_definition_type;
    }
}
