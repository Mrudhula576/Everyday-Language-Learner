// The English accents the app teaches, keyed by the codes used in
// backend/voices.py (and returned by GET /api/voices).
// Used on the landing page now, and later by Settings.

export const ACCENTS = {
  'en-US': { flag: '🇺🇸', en: 'US', te: 'అమెరికా' },
  'en-GB': { flag: '🇬🇧', en: 'UK', te: 'బ్రిటన్' },
  'en-AU': { flag: '🇦🇺', en: 'Australia', te: 'ఆస్ట్రేలియా' },
  'en-IN': { flag: '🇮🇳', en: 'India', te: 'భారతదేశం' },
  'en-IE': { flag: '🇮🇪', en: 'Ireland', te: 'ఐర్లాండ్' },
  'en-ZA': { flag: '🇿🇦', en: 'South Africa', te: 'దక్షిణ ఆఫ్రికా' },
  'en-NG': { flag: '🇳🇬', en: 'Nigeria', te: 'నైజీరియా' },
};

/** Short sample for each accent, made by backend/make_accent_samples.py. */
export function sampleUrl(code) {
  return `audio/accents/${code}.mp3`;
}
