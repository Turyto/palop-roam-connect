export type CoverageTab = 'europe' | 'portugal';

export interface PlanCard {
  id: string;
  coverage: CoverageTab;
  name: { pt: string; en: string };
  subtitle: { pt: string; en: string };
  data: string;
  validityDays: string;
  validity: { pt: string; en: string };
  price: string;
  coverageLabel: { pt: string; en: string };
  popular?: boolean;
  href: string;
}

// ---------------------------------------------------------------------------
// Single source of truth for PALOP Connect plan prices.
// String prices (display) use European comma format: €3,99
// Numeric prices (Stripe / calculations) use dot: 3.99
// ---------------------------------------------------------------------------

export const PLAN_PRICES: Record<string, number> = {
  'arrival':    3.99,
  'essential':  9.99,
  'comfort':   14.99,
  'freedom':   19.99,
};

export const PLAN_PRICES_DISPLAY: Record<string, string> = {
  'arrival':   '€3,99',
  'essential': '€9,99',
  'comfort':  '€14,99',
  'freedom':  '€19,99',
};

export const planCards: PlanCard[] = [
  {
    id: 'arrival',
    coverage: 'europe',
    name: { pt: 'Chegada', en: 'Arrival' },
    subtitle: { pt: 'Ideal para chegada, mensagens e mapas', en: 'Great for arrival, messages and maps' },
    data: '2 GB',
    validityDays: '7',
    validity: { pt: '7 dias', en: '7 days' },
    price: PLAN_PRICES_DISPLAY['arrival'],
    coverageLabel: { pt: 'Portugal + Europa', en: 'Portugal + Europe' },
    popular: false,
    href: '/purchase?plan=arrival',
  },
  {
    id: 'essential',
    coverage: 'europe',
    name: { pt: 'Essencial', en: 'Essential' },
    subtitle: { pt: 'Ideal para uso diário e contacto com família', en: 'Ideal for daily use and keeping in touch' },
    data: '5 GB',
    validityDays: '30',
    validity: { pt: '30 dias', en: '30 days' },
    price: PLAN_PRICES_DISPLAY['essential'],
    coverageLabel: { pt: 'Portugal + Europa', en: 'Portugal + Europe' },
    popular: true,
    href: '/purchase?plan=essential',
  },
  {
    id: 'comfort',
    coverage: 'europe',
    name: { pt: 'Conforto', en: 'Comfort' },
    subtitle: { pt: 'Ideal para estadias mais longas e uso regular', en: 'Best for longer stays and regular use' },
    data: '10 GB',
    validityDays: '30',
    validity: { pt: '30 dias', en: '30 days' },
    price: PLAN_PRICES_DISPLAY['comfort'],
    coverageLabel: { pt: 'Portugal + Europa', en: 'Portugal + Europe' },
    popular: false,
    href: '/purchase?plan=comfort',
  },
  {
    id: 'freedom',
    coverage: 'europe',
    name: { pt: 'Liberdade', en: 'Freedom' },
    subtitle: { pt: 'Ideal para uso intensivo e estadias longas', en: 'Best for heavy usage and long stays' },
    data: '20 GB',
    validityDays: '30',
    validity: { pt: '30 dias', en: '30 days' },
    price: PLAN_PRICES_DISPLAY['freedom'],
    coverageLabel: { pt: 'Portugal + Europa', en: 'Portugal + Europe' },
    popular: false,
    href: '/purchase?plan=freedom',
  },
];

export const comparisonRows = [
  {
    id: 'arrival',
    name: { pt: 'Chegada', en: 'Arrival' },
    data: '2 GB',
    duration: { pt: '7 dias', en: '7 days' },
    coverage: { pt: 'Portugal + Europa', en: 'Portugal + Europe' },
    price: PLAN_PRICES_DISPLAY['arrival'],
  },
  {
    id: 'essential',
    name: { pt: 'Essencial', en: 'Essential' },
    data: '5 GB',
    duration: { pt: '30 dias', en: '30 days' },
    coverage: { pt: 'Portugal + Europa', en: 'Portugal + Europe' },
    price: PLAN_PRICES_DISPLAY['essential'],
  },
  {
    id: 'comfort',
    name: { pt: 'Conforto', en: 'Comfort' },
    data: '10 GB',
    duration: { pt: '30 dias', en: '30 days' },
    coverage: { pt: 'Portugal + Europa', en: 'Portugal + Europe' },
    price: PLAN_PRICES_DISPLAY['comfort'],
  },
  {
    id: 'freedom',
    name: { pt: 'Liberdade', en: 'Freedom' },
    data: '20 GB',
    duration: { pt: '30 dias', en: '30 days' },
    coverage: { pt: 'Portugal + Europa', en: 'Portugal + Europe' },
    price: PLAN_PRICES_DISPLAY['freedom'],
  },
];
