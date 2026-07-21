import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/language';
import type { Lang } from '@/lib/translations';
import { trackEvent } from '@/analytics';

const SHOW_START = new Date('2026-06-07T00:00:00');
const SHOW_END = new Date('2026-07-20T00:00:00');

type MatchRow = [string, string, string];
type PlanRow = { name: string; gb: string; days: string; price: string; badge: 'popular' | 'tournament' | 'groups' | 'knockouts' | null; highlight: boolean };

const ptMatches: Record<Lang, MatchRow[]> = {
  pt: [
    ['15 Jun', 'Espanha vs Cabo Verde', 'Atlanta'],
    ['17 Jun', 'Portugal vs DR Congo', 'Houston'],
    ['21 Jun', 'Uruguai vs Cabo Verde', 'Miami'],
    ['23 Jun', 'Portugal vs Uzbequistão', 'Houston'],
    ['26–27 Jun', 'Última jornada dos grupos', ''],
  ],
  en: [
    ['Jun 15', 'Spain vs Cape Verde', 'Atlanta'],
    ['Jun 17', 'Portugal vs DR Congo', 'Houston'],
    ['Jun 21', 'Uruguay vs Cape Verde', 'Miami'],
    ['Jun 23', 'Portugal vs Uzbekistan', 'Houston'],
    ['Jun 26–27', 'Final group stage matchday', ''],
  ],
};

const naMatches: Record<Lang, MatchRow[]> = {
  pt: [
    ['15 Jun', 'CV vs Espanha', 'Atlanta'],
    ['21 Jun', 'CV vs Uruguai', 'Miami  (+ Portugal 27 Jun)'],
    ['26 Jun', 'CV vs Arábia Saudita', 'Houston  (+ Portugal 17 e 23 Jun)'],
  ],
  en: [
    ['Jun 15', 'CV vs Spain', 'Atlanta'],
    ['Jun 21', 'CV vs Uruguay', 'Miami  (+ Portugal Jun 27)'],
    ['Jun 26', 'CV vs Saudi Arabia', 'Houston  (+ Portugal Jun 17 & 23)'],
  ],
};

const ptPlans: Record<Lang, PlanRow[]> = {
  pt: [
    { name: 'Chegada PT', gb: '3GB', days: '15 dias', price: '€4,90', badge: null, highlight: false },
    { name: 'Essencial PT', gb: '5GB', days: '30 dias', price: '€9,90', badge: 'popular', highlight: false },
    { name: 'Conforto PT', gb: '10GB', days: '30 dias', price: '€14,90', badge: null, highlight: false },
  ],
  en: [
    { name: 'Arrival PT', gb: '3GB', days: '15 days', price: '€4.90', badge: null, highlight: false },
    { name: 'Essential PT', gb: '5GB', days: '30 days', price: '€9.90', badge: 'popular', highlight: false },
    { name: 'Comfort PT', gb: '10GB', days: '30 days', price: '€14.90', badge: null, highlight: false },
  ],
};

const naPlans: Record<Lang, PlanRow[]> = {
  pt: [
    { name: 'Chegada', gb: '1GB', days: '7 dias', price: '€4,50', badge: 'groups', highlight: false },
    { name: 'Grupos', gb: '3GB', days: '15 dias', price: '€11,50', badge: 'knockouts', highlight: false },
    { name: 'Eliminatórias', gb: '5GB', days: '30 dias', price: '€17,40', badge: null, highlight: false },
    { name: 'Mundial Completo', gb: '20GB', days: '90 dias', price: '€53,40', badge: 'tournament', highlight: true },
  ],
  en: [
    { name: 'Arrival', gb: '1GB', days: '7 days', price: '€4.50', badge: 'groups', highlight: false },
    { name: 'Group Stage', gb: '3GB', days: '15 days', price: '€11.50', badge: 'knockouts', highlight: false },
    { name: 'Knockouts', gb: '5GB', days: '30 days', price: '€17.40', badge: null, highlight: false },
    { name: 'Full Tournament', gb: '20GB', days: '90 days', price: '€53.40', badge: 'tournament', highlight: true },
  ],
};

function MatchSchedule({ matches }: { matches: MatchRow[] }) {
  return (
    <ul className="space-y-1 mt-3">
      {matches.map(([date, fixture, venue], i) => (
        <li key={i} className="text-xs flex flex-wrap gap-x-1.5" style={{ color: '#888888' }}>
          <span className="font-semibold" style={{ color: '#2DB84B' }}>{date}</span>
          <span>{fixture}</span>
          {venue && <span>· {venue}</span>}
        </li>
      ))}
    </ul>
  );
}

function PlanBadge({ badge, wc }: { badge: PlanRow['badge']; wc: ReturnType<typeof useLanguage>['t']['worldCup'] }) {
  if (!badge) return null;
  const labels = {
    popular: wc.popularBadge,
    tournament: wc.fullTournamentBadge,
    groups: wc.groupsBadge,
    knockouts: wc.knockoutsBadge,
  };
  return (
    <span
      className="ml-1.5 text-[10px] font-semibold rounded px-1.5 py-0.5 whitespace-nowrap"
      style={{ backgroundColor: 'rgba(45,184,75,0.15)', color: '#2DB84B' }}
    >
      {badge === 'tournament' ? '⭐ ' : ''}{labels[badge]}
    </span>
  );
}

export default function WorldCupSection() {
  const { lang, t } = useLanguage();
  const wc = t.worldCup;

  const now = new Date();
  if (now < SHOW_START || now >= SHOW_END) return null;

  const l = lang as Lang;

  const cardStyle = {
    backgroundColor: '#242424',
    border: '0.5px solid #333333',
    borderRadius: '10px',
  };

  return (
    <section
      id="worldcup-2026"
      style={{ backgroundColor: '#1A1A1A' }}
      className="px-4 md:px-6 py-8 md:py-12"
      data-testid="section-worldcup"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-white text-xl md:text-2xl font-bold mb-2">{wc.heading}</h2>
          <p className="text-sm" style={{ color: '#888888' }}>{wc.subheading}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PT Corridor Card */}
          <div style={cardStyle} className="p-5 flex flex-col gap-3" data-testid="card-wc-pt-corridor">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#2DB84B' }}>
              {wc.ptLabel}
            </p>
            <div>
              <h3 className="text-white font-semibold text-base">{wc.ptTitle}</h3>
              <p className="text-xs mt-0.5" style={{ color: '#888888' }}>{wc.ptSubtitle}</p>
            </div>

            <MatchSchedule matches={ptMatches[l]} />

            <div className="mt-1 space-y-2">
              {ptPlans[l].map((plan, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 border-b"
                  style={{ borderColor: '#333333' }}
                  data-testid={`row-wc-pt-plan-${i}`}
                >
                  <div className="flex items-center flex-wrap gap-y-0.5">
                    <span className="text-sm text-white font-medium">{plan.name}</span>
                    <PlanBadge badge={plan.badge} wc={wc} />
                    <span className="text-xs block w-full mt-0.5" style={{ color: '#666666' }}>
                      {plan.gb} · {plan.days}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white ml-3 shrink-0">{plan.price}</span>
                </div>
              ))}
            </div>

            <Link
              to="/plans"
              className="mt-auto block text-center py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#2DB84B' }}
              data-testid="button-wc-pt-cta"
            >
              {wc.findMyPlan}
            </Link>
          </div>

          {/* NA Corridor Card */}
          <div style={cardStyle} className="p-5 flex flex-col gap-3" data-testid="card-wc-na-corridor">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#2DB84B' }}>
              {wc.naLabel}
            </p>
            <div>
              <h3 className="text-white font-semibold text-base">{wc.naTitle}</h3>
              <p className="text-xs mt-0.5" style={{ color: '#888888' }}>{wc.naSubtitle}</p>
            </div>

            <span
              className="self-start text-xs font-semibold rounded-full px-3 py-1"
              style={{ backgroundColor: 'rgba(45,184,75,0.12)', color: '#2DB84B' }}
            >
              {wc.naEsimBadge}
            </span>

            <MatchSchedule matches={naMatches[l]} />

            <div className="mt-1 space-y-2">
              {naPlans[l].map((plan, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 border-b rounded"
                  style={{
                    borderColor: '#333333',
                    ...(plan.highlight ? { borderLeft: '3px solid #2DB84B', paddingLeft: '8px', backgroundColor: 'rgba(45,184,75,0.06)' } : {}),
                  }}
                  data-testid={`row-wc-na-plan-${i}`}
                >
                  <div className="flex items-center flex-wrap gap-y-0.5">
                    <span className="text-sm text-white font-medium">{plan.name}</span>
                    <PlanBadge badge={plan.badge} wc={wc} />
                    <span className="text-xs block w-full mt-0.5" style={{ color: '#666666' }}>
                      {plan.gb} · {plan.days}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white ml-3 shrink-0">{plan.price}</span>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/351911186695"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_click', { location: 'world_cup_section' })}
              className="mt-auto block text-center py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 border"
              style={{ borderColor: '#2DB84B', color: '#2DB84B' }}
              data-testid="button-wc-na-cta"
            >
              {wc.getUsaPlan}
            </a>
            <p className="text-xs text-center" style={{ color: '#666666' }}>
              {wc.lisboaNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
