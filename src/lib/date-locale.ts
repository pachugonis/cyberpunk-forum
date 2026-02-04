import { ru, enUS } from 'date-fns/locale';

export function getDateFnsLocale(locale: string) {
  switch (locale) {
    case 'ru':
      return ru;
    case 'en':
    default:
      return enUS;
  }
}
