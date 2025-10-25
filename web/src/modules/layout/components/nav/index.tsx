"use client"

import Link from "next/link"
import { Button } from "@medusajs/ui"
import LanguageSwitcher from "../language-switcher"
import { useLanguage } from "@lib/context/language-context"
import { Menu, ShoppingCart, User, X } from "lucide-react"
import { useState } from "react"
import CartCount from "../cart-count"

export default function Nav() {
  const { currentLanguage } = useLanguage()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    {
      name: currentLanguage.code === "fr" ? "Catalogue" : "Catalog",
      href: "/products",
    },
    {
      name: currentLanguage.code === "fr" ? "Location" : "Rental",
      href: "/store",
    },
    {
      name: currentLanguage.code === "fr" ? "À propos" : "About",
      href: "/about",
    },
    {
      name: currentLanguage.code === "fr" ? "Contact" : "Contact",
      href: "/contact",
    },
  ]

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b z-40">
      <nav className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text">
            Le Drone Hub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          <div className="hidden md:flex items-center gap-4">
            <CartCount />
            <Link href="/account">
              <Button variant="primary" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>
                  {currentLanguage.code === "fr" ? "Mon compte" : "My Account"}
                </span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="p-4 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t space-y-4">
              <div onClick={() => setIsMobileMenuOpen(false)}>
                <CartCount />
              </div>
              <Link
                href="/account"
                className="flex items-center gap-2 text-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>
                  {currentLanguage.code === "fr" ? "Mon compte" : "My Account"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
