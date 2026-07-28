export type CoverageTab = 'europe' | 'south-africa' | 'brazil' | 'palop';

export interface PlanCard {
  id: string;
  coverage: CoverageTab;
  /** PALOP tab groups cards per country */
  countryKey?: 'mozambique' | 'cabo-verde' | 'guinea-bissau' | 'angola';
  name: { pt: string; en: string };
  subtitle: { pt: string; en: string };
  data: string;
  validityDays: string;
  validity: { pt: string; en: string };
  price: string;
  coverageLabel: { pt: string; en: string };
  popular?: boolean;
  /** false = visible but not purchasable yet (supplier not live) */
  available: boolean;
  href: string;
}

// ---------------------------------------------------------------------------
// Single source of truth for PALOP Connect plan prices.
// String prices (display) use European comma format: €3,99
// Numeric prices (Stripe / calculations) use dot: 3.99
// ---------------------------------------------------------------------------

export const PLAN_PRICES: Record<string, number> = {
  // Europe (existing plans, July 2026 prices)
  'arrival':    3.90,
  'essential':  6.90,
  'comfort':   12.90,
  'freedom':   19.90,
  // South Africa
  'sa-3gb':     6.90,
  'sa-5gb':     8.90,
  'sa-10gb':   17.90,
  // Brazil (eSIM Access, July 2026)
  'br-3gb':     7.90,
  'br-5gb':    12.90,
  'br-10gb':   22.90,
  'br-20gb':   47.90,
  // PALOP — Mozambique (eSIMCard supplier, not yet live)
  'mz-3gb':     9.90,
  'mz-5gb':    16.90,
  // PALOP — Cabo Verde (eSIMCard supplier, not yet live)
  'cv-3gb':    24.90,
  'cv-5gb':    34.90,
  // PALOP — Guinea-Bissau
  'gw-3gb':    16.90,
  'gw-5gb':    24.90,
  // PALOP — Angola
  'ao-3gb':    34.90,
  'ao-5gb':    54.90,
};

const fmt = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;

export const PLAN_PRICES_DISPLAY: Record<string, string> = Object.fromEntries(
  Object.entries(PLAN_PRICES).map(([id, n]) => [id, fmt(n)])
);

// ---------------------------------------------------------------------------
// Region metadata (tabs + coverage lines)
// ---------------------------------------------------------------------------

export interface RegionMeta {
  id: CoverageTab;
  tabLabel: { pt: string; en: string };
  title: { pt: string; en: string };
  coverageLine: { pt: string; en: string };
}

export const regions: RegionMeta[] = [
  {
    id: 'europe',
    tabLabel: { pt: 'Europa', en: 'Europe' },
    title: { pt: 'eSIM Europa', en: 'Europe eSIM' },
    coverageLine: {
      pt: 'Cobertura: Portugal, Espanha, França, Alemanha, Itália, Áustria, Bélgica, Bulgária, Croácia, Chipre, Chéquia, Dinamarca, Estónia, Finlândia, Grécia, Hungria, Irlanda, Letónia, Lituânia, Luxemburgo, Malta, Países Baixos, Polónia, Roménia, Eslováquia, Eslovénia, Suécia, Noruega, Suíça, Reino Unido, Islândia, Liechtenstein, Turquia, Ucrânia e Cidade do Vaticano.',
      en: 'Coverage: Portugal, Spain, France, Germany, Italy, Austria, Belgium, Bulgaria, Croatia, Cyprus, Czechia, Denmark, Estonia, Finland, Greece, Hungary, Ireland, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Romania, Slovakia, Slovenia, Sweden, Norway, Switzerland, United Kingdom, Iceland, Liechtenstein, Türkiye, Ukraine and Vatican City.',
    },
  },
  {
    id: 'south-africa',
    tabLabel: { pt: 'África do Sul', en: 'South Africa' },
    title: { pt: 'eSIM África do Sul', en: 'South Africa eSIM' },
    coverageLine: {
      pt: 'Cobertura: África do Sul.',
      en: 'Coverage: South Africa.',
    },
  },
  {
    id: 'brazil',
    tabLabel: { pt: 'Brasil', en: 'Brazil' },
    title: { pt: 'eSIM Brasil', en: 'Brazil eSIM' },
    coverageLine: {
      pt: 'Cobertura: Brasil.',
      en: 'Coverage: Brazil.',
    },
  },
  {
    id: 'palop',
    tabLabel: { pt: 'PALOP', en: 'PALOP' },
    title: { pt: 'eSIM PALOP', en: 'PALOP eSIM' },
    coverageLine: {
      pt: 'Cobertura: Angola, Cabo Verde, Guiné-Bissau e Moçambique — planos por país.',
      en: 'Coverage: Angola, Cabo Verde, Guinea-Bissau and Mozambique — per-country plans.',
    },
  },
];

export interface PalopCountryMeta {
  key: NonNullable<PlanCard['countryKey']>;
  flag: string;
  name: { pt: string; en: string };
}

export const palopCountries: PalopCountryMeta[] = [
  { key: 'mozambique', flag: '🇲🇿', name: { pt: 'Moçambique', en: 'Mozambique' } },
  { key: 'cabo-verde', flag: '🇨🇻', name: { pt: 'Cabo Verde', en: 'Cabo Verde' } },
  { key: 'guinea-bissau', flag: '🇬🇼', name: { pt: 'Guiné-Bissau', en: 'Guinea-Bissau' } },
  { key: 'angola', flag: '🇦🇴', name: { pt: 'Angola', en: 'Angola' } },
];

// ---------------------------------------------------------------------------
// Plan cards
// ---------------------------------------------------------------------------

const card = (
  id: string,
  coverage: CoverageTab,
  name: PlanCard['name'],
  subtitle: PlanCard['subtitle'],
  dataGb: number,
  days: number,
  coverageLabel: PlanCard['coverageLabel'],
  opts: { popular?: boolean; available?: boolean; countryKey?: PlanCard['countryKey'] } = {}
): PlanCard => ({
  id,
  coverage,
  countryKey: opts.countryKey,
  name,
  subtitle,
  data: `${dataGb} GB`,
  validityDays: String(days),
  validity: { pt: `${days} dias`, en: `${days} days` },
  price: PLAN_PRICES_DISPLAY[id],
  coverageLabel,
  popular: opts.popular ?? false,
  available: opts.available ?? true,
  href: `/purchase?plan=${id}`,
});

const EU = { pt: 'Portugal + Europa', en: 'Portugal + Europe' };
const SA = { pt: 'África do Sul', en: 'South Africa' };
const BR = { pt: 'Brasil', en: 'Brazil' };

export const planCards: PlanCard[] = [
  // Europe — existing validated plans, new prices
  card('arrival', 'europe',
    { pt: 'Chegada', en: 'Arrival' },
    { pt: 'Ideal para chegada, mensagens e mapas', en: 'Great for arrival, messages and maps' },
    3, 15, EU),
  card('essential', 'europe',
    { pt: 'Essencial', en: 'Essential' },
    { pt: 'Ideal para uso diário e videochamadas', en: 'Ideal for daily use and video calls' },
    5, 30, EU, { popular: true }),
  card('comfort', 'europe',
    { pt: 'Conforto', en: 'Comfort' },
    { pt: 'Ideal para estadias mais longas', en: 'Best for longer stays' },
    10, 30, EU),
  card('freedom', 'europe',
    { pt: 'Liberdade', en: 'Freedom' },
    { pt: 'Tranquilidade total', en: 'Total peace of mind' },
    20, 30, EU),

  // South Africa
  card('sa-3gb', 'south-africa',
    { pt: 'África do Sul 3 GB', en: 'South Africa 3 GB' },
    { pt: 'Ideal para chegada, mensagens e mapas', en: 'Great for arrival, messages and maps' },
    3, 30, SA),
  card('sa-5gb', 'south-africa',
    { pt: 'África do Sul 5 GB', en: 'South Africa 5 GB' },
    { pt: 'Ideal para uso diário e videochamadas', en: 'Ideal for daily use and video calls' },
    5, 30, SA, { popular: true }),
  card('sa-10gb', 'south-africa',
    { pt: 'África do Sul 10 GB', en: 'South Africa 10 GB' },
    { pt: 'Ideal para estadias mais longas', en: 'Best for longer stays' },
    10, 30, SA),

  // Brazil
  card('br-3gb', 'brazil',
    { pt: 'Brasil 3 GB', en: 'Brazil 3 GB' },
    { pt: 'Ideal para chegada, mensagens e mapas', en: 'Great for arrival, messages and maps' },
    3, 30, BR),
  card('br-5gb', 'brazil',
    { pt: 'Brasil 5 GB', en: 'Brazil 5 GB' },
    { pt: 'Ideal para uso diário e videochamadas', en: 'Ideal for daily use and video calls' },
    5, 30, BR, { popular: true }),
  card('br-10gb', 'brazil',
    { pt: 'Brasil 10 GB', en: 'Brazil 10 GB' },
    { pt: 'Ideal para estadias mais longas', en: 'Best for longer stays' },
    10, 30, BR),
  card('br-20gb', 'brazil',
    { pt: 'Brasil 20 GB', en: 'Brazil 20 GB' },
    { pt: 'Tranquilidade total', en: 'Total peace of mind' },
    20, 30, BR),

  // PALOP — Mozambique (eSIMCard supplier)
  card('mz-3gb', 'palop',
    { pt: 'Moçambique 3 GB', en: 'Mozambique 3 GB' },
    { pt: 'Ideal para visitas curtas', en: 'Great for short visits' },
    3, 30, { pt: 'Moçambique', en: 'Mozambique' },
    { countryKey: 'mozambique' }),
  card('mz-5gb', 'palop',
    { pt: 'Moçambique 5 GB', en: 'Mozambique 5 GB' },
    { pt: 'Ideal para estadias mais longas', en: 'Best for longer stays' },
    5, 30, { pt: 'Moçambique', en: 'Mozambique' },
    { countryKey: 'mozambique' }),

  // PALOP — Cabo Verde (eSIMCard supplier)
  card('cv-3gb', 'palop',
    { pt: 'Cabo Verde 3 GB', en: 'Cabo Verde 3 GB' },
    { pt: 'Ideal para visitas curtas', en: 'Great for short visits' },
    3, 30, { pt: 'Cabo Verde', en: 'Cabo Verde' },
    { countryKey: 'cabo-verde' }),
  card('cv-5gb', 'palop',
    { pt: 'Cabo Verde 5 GB', en: 'Cabo Verde 5 GB' },
    { pt: 'Ideal para estadias mais longas', en: 'Best for longer stays' },
    5, 30, { pt: 'Cabo Verde', en: 'Cabo Verde' },
    { countryKey: 'cabo-verde' }),

  // PALOP — Guinea-Bissau
  card('gw-3gb', 'palop',
    { pt: 'Guiné-Bissau 3 GB', en: 'Guinea-Bissau 3 GB' },
    { pt: 'Ideal para visitas curtas', en: 'Great for short visits' },
    3, 15, { pt: 'Guiné-Bissau', en: 'Guinea-Bissau' },
    { countryKey: 'guinea-bissau' }),
  card('gw-5gb', 'palop',
    { pt: 'Guiné-Bissau 5 GB', en: 'Guinea-Bissau 5 GB' },
    { pt: 'Ideal para estadias mais longas', en: 'Best for longer stays' },
    5, 30, { pt: 'Guiné-Bissau', en: 'Guinea-Bissau' },
    { countryKey: 'guinea-bissau' }),

  // PALOP — Angola
  card('ao-3gb', 'palop',
    { pt: 'Angola 3 GB', en: 'Angola 3 GB' },
    { pt: 'Ideal para visitas curtas', en: 'Great for short visits' },
    3, 15, { pt: 'Angola', en: 'Angola' },
    { countryKey: 'angola' }),
  card('ao-5gb', 'palop',
    { pt: 'Angola 5 GB', en: 'Angola 5 GB' },
    { pt: 'Ideal para estadias mais longas', en: 'Best for longer stays' },
    5, 30, { pt: 'Angola', en: 'Angola' },
    { countryKey: 'angola' }),
];

export const comparisonRows = planCards
  .filter((p) => p.coverage === 'europe')
  .map((p) => ({
    id: p.id,
    name: p.name,
    data: p.data,
    duration: p.validity,
    coverage: p.coverageLabel,
    price: p.price,
  }));
