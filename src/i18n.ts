import { init, register, getLocaleFromNavigator } from 'svelte-i18n';

register('en', () => import('./locales/en/common.json'));
register('ja', () => import('./locales/ja/common.json'));

const savedLocale = localStorage.getItem('language');

init({
  fallbackLocale: 'en',
  initialLocale: savedLocale || getLocaleFromNavigator(),
});
