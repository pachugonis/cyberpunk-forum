import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const SUPPORTED_LOCALES = ['en', 'ru'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requested = cookieStore.get('NEXT_LOCALE')?.value;
  // Only known locales may reach the dynamic import below
  const locale: Locale = SUPPORTED_LOCALES.includes(requested as Locale)
    ? (requested as Locale)
    : 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
