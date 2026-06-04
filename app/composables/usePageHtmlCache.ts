export const usePageHtmlCache = () =>
  useState<Record<string, string>>('pageHtmlCache', () => ({}))
