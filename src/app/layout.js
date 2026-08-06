import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./assets/bluebird.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Seip Base Template",
  description: "Seip Nextjs Base Template",
  keywords: "Nextjs, Javascript, React",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <Script src="/assets/bluebird.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
