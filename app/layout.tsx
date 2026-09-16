import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'کتاب‌خوان هوشمند HTML',
  description: 'مطالعه روان کتاب‌ها در قالب HTML تعاملی با ترجمه فوری لغات و جملات انگلیسی، هایلایت، یادداشت‌برداری، تبدیل هوشمند PDF به فصل‌ها و رنگ‌آمیزی کدهای برنامه‌نویسی',
  openGraph: {
    title: 'کتاب‌خوان هوشمند HTML',
    description: 'مطالعه روان کتاب‌ها در قالب HTML تعاملی با ترجمه فوری لغات و جملات انگلیسی، هایلایت، یادداشت‌برداری، تبدیل هوشمند PDF به فصل‌ها و رنگ‌آمیزی کدهای برنامه‌نویسی',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'کتاب‌خوان هوشمند HTML',
    description: 'مطالعه روان کتاب‌ها در قالب HTML تعاملی با ترجمه فوری لغات و جملات انگلیسی، هایلایت، یادداشت‌برداری، تبدیل هوشمند PDF به فصل‌ها و رنگ‌آمیزی کدهای برنامه‌نویسی',
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
