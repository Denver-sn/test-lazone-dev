"use client"

import { useLanguage } from "@lib/context/language-context"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export default function Footer() {
  const { currentLanguage } = useLanguage()

  const navigation = {
    shop: [
      {
        name: currentLanguage.code === "fr" ? "Catalogue" : "Catalog",
        href: "/products",
      },
      {
        name: currentLanguage.code === "fr" ? "Location" : "Rental",
        href: "/store",
      },
      {
        name: currentLanguage.code === "fr" ? "Nouveautés" : "New Arrivals",
        href: "/products/#",
      },
    ],
    account: [
      {
        name: currentLanguage.code === "fr" ? "Mon compte" : "My Account",
        href: "/account",
      },
      {
        name: currentLanguage.code === "fr" ? "Mes commandes" : "My Orders",
        href: "#",
      },
      {
        name: currentLanguage.code === "fr" ? "Mes locations" : "My Rentals",
        href: "/account/#",
      },
    ],
    company: [
      {
        name: currentLanguage.code === "fr" ? "À propos" : "About",
        href: "/about",
      },
      {
        name: currentLanguage.code === "fr" ? "Contact" : "Contact",
        href: "/contact",
      },
    ],
  }

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "YouTube", icon: Youtube, href: "#" },
  ]

  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          {/* Logo and description */}
          <div className="mb-10 md:mb-12">
            <h2 className="text-2xl font-bold mb-4">Le Drone Hub</h2>
            <p className="text-gray-600 max-w-md">
              {currentLanguage.code === "fr"
                ? "Votre destination de référence pour l'achat et la location de drones de haute qualité."
                : "Your reference destination for buying and renting high-quality drones."}
            </p>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {currentLanguage.code === "fr" ? "Boutique" : "Shop"}
              </h3>
              <ul className="space-y-3">
                {navigation.shop.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {currentLanguage.code === "fr" ? "Compte" : "Account"}
              </h3>
              <ul className="space-y-3">
                {navigation.account.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {currentLanguage.code === "fr" ? "Entreprise" : "Company"}
              </h3>
              <ul className="space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {currentLanguage.code === "fr" ? "Suivez-nous" : "Follow Us"}
              </h3>
              <div className="flex space-x-4">
                {socialLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="sr-only">{item.name}</span>
                      <Icon className="h-6 w-6" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 py-8">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} Le Drone Hub.{" "}
            {currentLanguage.code === "fr"
              ? "Tous droits réservés."
              : "All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  )
}
