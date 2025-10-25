"use client"

import { useLanguage } from "@lib/context/language-context"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@medusajs/ui"
import { ArrowRight, Package, Shield, Clock } from "lucide-react"

export default function HomePage() {
  const { currentLanguage } = useLanguage()

  const features = [
    {
      icon: <Package className="w-6 h-6" />,
      title:
        currentLanguage.code === "fr" ? "Livraison rapide" : "Fast Delivery",
      description:
        currentLanguage.code === "fr"
          ? "Livraison en 24/48h partout en France"
          : "24/48h delivery across the country",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title:
        currentLanguage.code === "fr"
          ? "Garantie qualité"
          : "Quality Guarantee",
      description:
        currentLanguage.code === "fr"
          ? "Drones testés et certifiés"
          : "Tested and certified drones",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: currentLanguage.code === "fr" ? "Support 24/7" : "24/7 Support",
      description:
        currentLanguage.code === "fr"
          ? "Une équipe à votre écoute"
          : "A team at your service",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80"
            alt="Drone flying in the sky"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            {currentLanguage.code === "fr"
              ? "Explorez le monde d'en haut"
              : "Explore the world from above"}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            {currentLanguage.code === "fr"
              ? "Découvrez notre sélection de drones haute performance pour la photo, la vidéo et les loisirs"
              : "Discover our selection of high-performance drones for photography, video and leisure"}
          </p>
          <div className="flex gap-4">
            <Link href="/products">
              <Button
                variant="primary"
                className="text-lg px-8 py-4 rounded-full hover:scale-105 transition-transform"
              >
                {currentLanguage.code === "fr"
                  ? "Voir le catalogue"
                  : "View catalog"}
              </Button>
            </Link>
            <Link href="/store">
              <Button
                variant="secondary"
                className="text-lg px-8 py-4 rounded-full hover:scale-105 transition-transform"
              >
                {currentLanguage.code === "fr"
                  ? "Louer un drone"
                  : "Rent a drone"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {currentLanguage.code === "fr"
                  ? "Prêt à prendre de la hauteur ?"
                  : "Ready to take off?"}
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                {currentLanguage.code === "fr"
                  ? "Rejoignez notre communauté de passionnés de drones"
                  : "Join our community of drone enthusiasts"}
              </p>
              <Link href="/products">
                <Button
                  variant="primary"
                  className="group text-lg px-8 py-4 rounded-full hover:scale-105 transition-transform"
                >
                  {currentLanguage.code === "fr" ? "Découvrir" : "Discover"}
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="flex-1 relative h-[400px] w-full rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
                alt="Drone pilot"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
