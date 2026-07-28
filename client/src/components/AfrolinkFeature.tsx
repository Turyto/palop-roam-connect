import { Newspaper, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/language";

const ARTICLE_URL =
  "https://www.afrolink.pt/historias/palop-connect-a-proposta-que-liga-a-europa-e-os-palop";

const copy = {
  pt: {
    eyebrow: "Na imprensa",
    featuredBy: "Em destaque no Afrolink",
    headline: "\u201CPALOP Connect: a proposta que liga a Europa e os PALOP\u201D",
    body:
      "O Afrolink, plataforma de refer\u00EAncia das comunidades africanas em Portugal, destacou o nosso projeto e a forma como ligamos a di\u00E1spora aos PALOP.",
    cta: "Ler o artigo no Afrolink",
    compact: "Em destaque no Afrolink \u2014 ler o artigo",
  },
  en: {
    eyebrow: "In the press",
    featuredBy: "Featured on Afrolink",
    headline: "\u201CPALOP Connect: the project connecting Europe and the PALOP\u201D",
    body:
      "Afrolink, the reference platform for African communities in Portugal, featured our project and how we connect the diaspora to the PALOP countries.",
    cta: "Read the article on Afrolink",
    compact: "Featured on Afrolink \u2014 read the article",
  },
};

interface AfrolinkFeatureProps {
  variant?: "full" | "compact";
}

const AfrolinkFeature = ({ variant = "full" }: AfrolinkFeatureProps) => {
  const { lang } = useLanguage();
  const c = copy[lang === "en" ? "en" : "pt"];

  if (variant === "compact") {
    return (
      <div className="container mx-auto px-4 pb-8" data-testid="afrolink-feature-compact">
        <a
          href={ARTICLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group mx-auto flex w-full max-w-2xl items-center justify-center gap-2.5 rounded-full border border-palop-green/20 bg-palop-green/5 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-palop-green/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-palop-green"
          data-testid="afrolink-link-compact"
        >
          <Newspaper className="h-4 w-4 flex-shrink-0 text-palop-green" aria-hidden="true" />
          <span className="min-w-0 truncate font-medium">{c.compact}</span>
          <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-palop-green transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </a>
      </div>
    );
  }

  return (
    <section className="py-10 md:py-14" data-testid="afrolink-feature-full">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-palop-green/15 bg-gradient-to-br from-white via-white to-palop-green/5 p-6 shadow-sm md:p-8">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-palop-green/10">
              <Newspaper className="h-6 w-6 text-palop-green" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-grow">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-palop-green">
                {c.eyebrow} &middot; {c.featuredBy}
              </p>
              <p className="font-display text-lg font-bold leading-snug text-gray-900 md:text-xl">
                {c.headline}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{c.body}</p>
            </div>
            <a
              href={ARTICLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-palop-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-palop-green/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-palop-green"
              data-testid="afrolink-link-full"
            >
              {c.cta}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AfrolinkFeature;
