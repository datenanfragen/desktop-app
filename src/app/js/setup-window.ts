import { setupWindow } from '@datenanfragen/components';

(window as typeof window & { LOCALE: string }).LOCALE = 'en';

setupWindow();
