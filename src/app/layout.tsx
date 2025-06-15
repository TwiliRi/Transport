import "~/styles/globals.css";
import Footer from "./_components/Footer";
import Nav from "./_components/Nav";
import { auth } from "~/server/auth";
import { SessionProvider } from "next-auth/react";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: {
    default: "Транспорт - Платформа для грузоперевозок и логистики",
    template: "%s | Транспорт"
  },
  description: "Революционная платформа для логистики и грузоперевозок. Быстрая и надежная доставка грузов по всей стране. Более 10,000 довольных клиентов и 50,000+ успешных доставок.",
  keywords: [
    "грузоперевозки",
    "логистика",
    "доставка грузов",
    "транспорт",
    "перевозка",
    "грузовики",
    "доставка",
    "логистические услуги",
    "транспортная компания",
    "грузовые перевозки"
  ],
  authors: [{ name: "Транспорт" }],
  creator: "Транспорт",
  publisher: "Транспорт",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3001'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    title: "Транспорт - Платформа для грузоперевозок и логистики",
    description: "Революционная платформа для логистики и грузоперевозок. Быстрая и надежная доставка грузов по всей стране.",
    siteName: "Транспорт",
    images: [
      {
        url: "/car.png",
        width: 1200,
        height: 630,
        alt: "Транспорт - Платформа для грузоперевозок",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Транспорт - Платформа для грузоперевозок и логистики",
    description: "Революционная платформа для логистики и грузоперевозок. Быстрая и надежная доставка грузов по всей стране.",
    images: ["/car.png"],
    creator: "@transport",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  category: "transportation",
  
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html lang="ru" className={`${geist.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="grid grid-rows-[auto_1fr_auto] min-h-[100vh]">
        <Nav session={session}/>
        <SessionProvider session={session}>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </SessionProvider>
        <Footer />
      </body>
    </html>
  );
}
