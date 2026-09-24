import type {Metadata, Viewport} from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#f8fafc',
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  title: 'گروه امنیتی رهام | Roham Security - آنتی‌استیلر هوشمند و مرکز پژوهش سایبری',
  description: 'رهام (Roham.org / RohamSec)؛ ارائه‌دهنده آنتی‌استیلر نسل جدید، خدمات مشاوره و هاردنینگ سازمانی، آموزش‌های تخصصی Zero-Day و کتابخانه تعاملی پژوهش‌های امنیتی.',
  openGraph: {
    title: 'گروه امنیتی رهام | Roham Security',
    description: 'سپر نسل نوین دفاع سایبری؛ خنثی‌سازی سرقت هویت و بدافزارهای استیلر، هاردنینگ و کتابخانه تخصصی آسیب‌پذیری',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'گروه امنیتی رهام | Roham Security',
    description: 'سپر نسل نوین دفاع سایبری؛ خنثی‌سازی سرقت هویت و بدافزارهای استیلر، هاردنینگ و کتابخانه تخصصی آسیب‌پذیری',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fa" dir="rtl" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Vazirmatn:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="h-full font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
