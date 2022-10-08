export const legalBaseUrls = [
    'https://www.datenanfragen.de/',
    'https://www.datarequests.org/',
    'https://www.demandetesdonnees.fr/',
    'https://www.pedidodedados.org/',
    'https://www.solicituddedatos.es/',
    'https://www.osobnipodaci.org/',
    'https://www.gegevensaanvragen.nl/',
] as const;
export type LegalBaseUrl = typeof legalBaseUrls[number];

export const legalBaseUrlHostnames = legalBaseUrls.map((u) => new URL(u).hostname);
