import type { appTranslations, Proceeding, ProceedingStatus } from '@datenanfragen/components';
import type { SetDesktopAppPageFunction } from '../index';

declare global {
    interface Window {
        /** The current language version's base URL, including the trailing slash. */
        readonly BASE_URL: string;
        /** The site version as specified in `package.json`. */
        readonly CODE_VERSION: string;

        /** Two-letter ISO code of the site's language. */
        readonly LOCALE: string;

        /** List of parameters specified in the URL, including both hash fragment and GET parameters. */
        readonly PARAMETERS: Record<string, string>;

        readonly I18N_DEFINITION_APP: typeof appTranslations['en'];

        ON_PROCEEDING_STATUS_CHANGE?: (proceeding: Proceeding, oldStatus: ProceedingStatus) => void;
        setPage?: SetDesktopAppPageFunction;
    }
}
