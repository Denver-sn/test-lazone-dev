export type Language = {
  code: string
  name: string
  flag: string
  currency: string
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: "fr",
    name: "Français",
    flag: "FR",
    currency: "EUR",
  },
  {
    code: "en",
    name: "English",
    flag: "GB",
    currency: "USD",
  },
]

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0]
