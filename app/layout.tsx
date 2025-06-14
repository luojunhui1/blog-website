/* eslint-disable react/no-unknown-property */
import "../styles/globals.css";
import "../styles/prism/prism-dark.css";
import "../styles/katex/katex.css";
import "../styles/adobe/zsu0zxb.css";
import Header from "@/components/UI/Website/Header";
import Footer from "@/components/UI/Website/Footer";
import React from "react";
import Analytics from "@/components/Scripts/Analytics";
import { AuthProvider } from '@/components/Auth/Context';

// 使用本地字体
const lato = {
  className: 'font-lato',
  style: {
    fontFamily: 'Lato, sans-serif',
  },
};

const noto_sans_sc = {
  className: 'font-notosans',
  style: {
    fontFamily: 'Noto Sans SC, sans-serif',
  },
};

const fira = {
  className: 'font-fira',
  style: {
    fontFamily: 'Fira Sans, sans-serif',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`${lato.className} ${noto_sans_sc.className} ${fira.className}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <Analytics />
          <Header />
          <main className="bg-gray-100 text-black-readable">
            <div className="">{children}</div>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

export const metadata = {
  title: "Junhui Luo",
  description: "Software Engineer at JD Cloud.",
  icons: {
    icon: "/img/favicon-32x32.png",
    apple: "/img/apple-touch-icon.png",
    other: [{ rel: "mask-icon", url: "/img/safari-pinned-tab.svg" }],
  },
  alternates: {
    types: {
      "application/rss+xml": "https://www.whexy.com/feed.xml",
    },
  },
};

export const viewpoint = {
  themeColor: "#171717",
};
