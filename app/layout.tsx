import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MultiplayerPresence from "./components/utils/MultiplayerPresence";
import ServiceWorkerRegistration from "./components/utils/ServiceWorkerRegistration";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Freetown Life",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Freetown Life",
    statusBarStyle: "default",
  },
  title: {
    default: "Freetown Life",
    template: "%s | Freetown Life",
  },
  description: "Create a character, find work, manage everyday needs, and build your story in a shared 3D Freetown.",
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    shortcut: ["/icon-192.png"],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "Freetown Life",
    title: "Freetown Life",
    description: "Create a character, find work, manage everyday needs, and build your story in a shared 3D Freetown.",
    images: [{
      url: "/Glowing%20Green%20Crystal%20Plumbob.png",
      width: 1280,
      height: 1280,
      alt: "Glowing green crystal from Freetown Life",
    }],
  },
  twitter: {
    card: "summary",
    title: "Freetown Life",
    description: "Create a character, find work, manage everyday needs, and build your story in a shared 3D Freetown.",
    images: ["/Glowing%20Green%20Crystal%20Plumbob.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#05704f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegistration />
        <MultiplayerPresence />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
