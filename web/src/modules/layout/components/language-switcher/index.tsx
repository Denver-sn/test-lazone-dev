import { useLanguage } from "@lib/context/language-context"
import { SUPPORTED_LANGUAGES } from "@lib/constants/languages"
import ReactCountryFlag from "react-country-flag"
import { Button } from "@medusajs/ui"
import { ChevronDown } from "lucide-react"
import * as Popover from "@radix-ui/react-popover"

export default function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage()

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="transparent" className="flex items-center gap-2">
          <ReactCountryFlag
            countryCode={currentLanguage.flag}
            svg
            className="w-5 h-5"
          />
          <span className="text-sm">{currentLanguage.name}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="bg-white rounded-lg shadow-lg p-2 min-w-[150px] z-50"
          sideOffset={5}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded"
              onClick={() => setLanguage(lang)}
            >
              <ReactCountryFlag countryCode={lang.flag} svg />
              <span className="text-sm">{lang.name}</span>
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
