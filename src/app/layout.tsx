import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Cavalcante BarberShop",
    template: "%s | Cavalcante BarberShop",
  },
  description:
    "Agende seu horário na Cavalcante BarberShop: cortes, degradê navalhado e nevou global. Terça a sábado das 08:30 às 19h, domingo das 09h às 14h.",
  applicationName: "Cavalcante BarberShop",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cavalcante BarberShop",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1128",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
