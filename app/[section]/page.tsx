import Home from "../page";

export function generateStaticParams() {
  return [
    { section: "reader" },
    { section: "library" },
    { section: "from-day-zero-to-zero-day" },
    { section: "from-day-zero-to-zero-day-fa" },
    { section: "from-day-zero-to-zero-day-fa-gemini" },
    { section: "book" },
    { section: "admin" },
    { section: "anti-stealer" },
    { section: "courses" },
    { section: "blog" },
    { section: "radar" },
    { section: "services" },
    { section: "portal" },
    { section: "home" },
  ];
}

export default function SectionPage() {
  return <Home />;
}
