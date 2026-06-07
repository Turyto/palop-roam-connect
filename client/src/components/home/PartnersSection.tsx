import { useLanguage } from '@/contexts/language';

export default function PartnersSection() {
  const { t } = useLanguage();
  const p = t.partners;

  return (
    <section
      className="px-4 md:px-6 py-8 md:py-12 bg-gray-50"
      data-testid="section-partners"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{p.heading}</h2>
          <p className="text-sm text-gray-500">{p.subheading}</p>
        </div>

        {/* Praiatur Card */}
        <div
          className="bg-white rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8"
          style={{ border: '0.5px solid #e5e7eb' }}
          data-testid="card-partner-praiatur"
        >
          {/* Left — Logo + credentials */}
          <div className="flex flex-col items-center md:items-start gap-3 md:w-48 shrink-0">
            <div className="flex items-center justify-center rounded-lg bg-gray-100 w-32 h-16 md:w-36 md:h-20">
              <span className="text-xl font-black tracking-wider text-gray-800">PRAIATUR</span>
            </div>

            <span
              className="text-xs font-semibold rounded-full px-3 py-1 text-center"
              style={{ backgroundColor: 'rgba(45,184,75,0.1)', color: '#2DB84B' }}
              data-testid="badge-partner-praiatur"
            >
              {p.partnerBadge}
            </span>

            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
              {[p.iataCredential, p.yearsCredential, p.airSenegalCredential].map((cred) => (
                <span
                  key={cred}
                  className="text-[11px] bg-gray-100 text-gray-600 rounded px-2 py-0.5 font-medium"
                >
                  {cred}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Quote + attribution + link */}
          <div className="flex flex-col justify-between gap-4 flex-1">
            <blockquote
              className="text-gray-700 text-base md:text-lg leading-relaxed italic"
              data-testid="text-partner-praiatur-quote"
            >
              {p.quote}
            </blockquote>
            <div>
              <p className="text-sm text-gray-500 mb-3" data-testid="text-partner-praiatur-attribution">
                {p.attribution}
              </p>
              <a
                href="https://www.praiaturcaboverde.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold hover:underline"
                style={{ color: '#2DB84B' }}
                data-testid="link-partner-praiatur"
              >
                {p.planLink}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
