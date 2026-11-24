/**
 * Country name → ISO 3166-1 alpha-2 code (lower case), used to draw a flag next to a country's name.
 * Cricket-playing nations first, then the other countries the sports desks write about.
 */
const codes: Record<string, string> = {
  afghanistan: "af",
  argentina: "ar",
  australia: "au",
  austria: "at",
  bahrain: "bh",
  bangladesh: "bd",
  belgium: "be",
  bermuda: "bm",
  bhutan: "bt",
  botswana: "bw",
  brazil: "br",
  canada: "ca",
  chile: "cl",
  china: "cn",
  colombia: "co",
  croatia: "hr",
  cyprus: "cy",
  "czech republic": "cz",
  czechia: "cz",
  denmark: "dk",
  egypt: "eg",
  england: "gb-eng",
  estonia: "ee",
  fiji: "fj",
  finland: "fi",
  france: "fr",
  germany: "de",
  ghana: "gh",
  greece: "gr",
  guernsey: "gg",
  "hong kong": "hk",
  hungary: "hu",
  india: "in",
  indonesia: "id",
  iran: "ir",
  iraq: "iq",
  ireland: "ie",
  israel: "il",
  italy: "it",
  jamaica: "jm",
  japan: "jp",
  jersey: "je",
  jordan: "jo",
  kenya: "ke",
  kuwait: "kw",
  malawi: "mw",
  malaysia: "my",
  maldives: "mv",
  mexico: "mx",
  mozambique: "mz",
  myanmar: "mm",
  namibia: "na",
  nepal: "np",
  netherlands: "nl",
  "new zealand": "nz",
  nigeria: "ng",
  norway: "no",
  oman: "om",
  pakistan: "pk",
  "papua new guinea": "pg",
  peru: "pe",
  philippines: "ph",
  poland: "pl",
  portugal: "pt",
  qatar: "qa",
  romania: "ro",
  russia: "ru",
  rwanda: "rw",
  samoa: "ws",
  "saudi arabia": "sa",
  scotland: "gb-sct",
  singapore: "sg",
  "south africa": "za",
  "south korea": "kr",
  spain: "es",
  "sri lanka": "lk",
  sweden: "se",
  switzerland: "ch",
  tanzania: "tz",
  thailand: "th",
  turkey: "tr",
  uganda: "ug",
  "united arab emirates": "ae",
  uae: "ae",
  "united kingdom": "gb",
  uk: "gb",
  "united states": "us",
  "united states of america": "us",
  usa: "us",
  us: "us",
  vanuatu: "vu",
  wales: "gb-wls",
  "west indies": "",
  zambia: "zm",
  zimbabwe: "zw",
};

/** The flag code for a country name, or null when the name is not a country we know (e.g. "West Indies"). */
export function countryCode(name: string | null | undefined): string | null {
  const key = (name ?? "").trim().toLowerCase();

  return codes[key] || null;
}

/**
 * The flag code of a national cricket team. Women's, A and age-group sides carry their country's flag too
 * ("India W", "Australia Women", "England A", "Pakistan U19"); clubs and franchises have none.
 */
export function teamCountryCode(name: string | null | undefined): string | null {
  const full = countryCode(name);

  if (full) {
    return full;
  }

  const country = (name ?? "").replace(/\s+(w|women|women's|a|xi|u-?\d{2}|under[- ]?\d{2})$/i, "");

  return country === name ? null : countryCode(country);
}

/** Flag picture address (flagcdn.com) for a country code, at the given pixel width. */
export function flagUrl(code: string, width: 20 | 40 | 80 | 160): string {
  return `https://flagcdn.com/w${width}/${code}.png`;
}
