import "./globals.css";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "InfoRx - Revolutionary Healthcare for Nigeria",
  metadataBase: new URL("http://localhost:3000"),
  description:
    "Transform your healthcare experience with AI-powered diagnostics, telemedicine, and 24/7 medical support designed specifically for Nigerian communities.",
  keywords:
    "healthcare, Nigeria, telemedicine, AI diagnostics, medical care, health platform",
  authors: [{ name: "InfoRx Team" }],
  creator: "InfoRx",
  publisher: "InfoRx",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://inforx.ng",
    title: "InfoRx - Revolutionary Healthcare for Nigeria",
    description:
      "Transform your healthcare experience with AI-powered diagnostics, telemedicine, and 24/7 medical support designed specifically for Nigerian communities.",
    siteName: "InfoRx",
  },
  twitter: {
    card: "summary_large_image",
    title: "InfoRx - Revolutionary Healthcare for Nigeria",
    description:
      "Transform your healthcare experience with AI-powered diagnostics, telemedicine, and 24/7 medical support designed specifically for Nigerian communities.",
    creator: "@inforx_ng",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0A9396",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={` antialiased`}>
        {children}
      </body>
    </html>
  );
}
