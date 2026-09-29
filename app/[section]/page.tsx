import Home from "../page";

export function generateStaticParams() {
  return [
    { section: "reader" },
    { section: "book" },
    { section: "anti-stealer" },
    { section: "courses" },
    { section: "blog" },
    { section: "radar" },
    { section: "services" },
  ];
}

export default function SectionPage() {
  return <Home />;
}
