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

export const planCards: PlanCard[] = [
  {
    id: 'portugal-starter',
    coverage: 'portugal',
    name: { pt: 'Portugal Chegada', en: 'Portugal Arrival' },
    subtitle: { pt: 'Ideal para chegada, mensagens e mapas', en: 'Best for arrival, messages and maps' },
    data: '1 GB',
    validityDays: '7',
    validity: { pt: '7 dias', en: '7 days' },
    price: '€4.99',
    coverageLabel: { pt: 'Portugal', en: 'Portugal' },
    popular: false,
    href: '/purchase?plan=portugal-starter',
  },
  {
    id: 'portugal-weekly',
    coverage: 'portugal',
    name: { pt: 'Portugal 5GB', en: 'Portugal 5GB' },
    subtitle: { pt: 'Ideal para estadias curtas e uso diário', en: 'Best for short stays and daily use' },
    data: '5 GB',
    validityDays: '30',
    validity: { pt: '30 dias', en: '30 days' },
    price: '€8.99',
    coverageLabel: { pt: 'Portugal', en: 'Portugal' },
    popular: true,
    href: '/purchase?plan=portugal-weekly',
  },
  {
    id: 'portugal-monthly',
    coverage: 'portugal',
    name: { pt: 'Portugal 10GB', en: 'Portugal 10GB' },
    subtitle: { pt: 'Ideal para estadias mais longas', en: 'Best for longer stays' },
    data: '10 GB',
    validityDays: '30',
    validity: { pt: '30 dias', en: '30 days' },
    price: '€16.99',
    coverageLabel: { pt: 'Portugal', en: 'Portugal' },
    popular: false,
    href: '/purchase?plan=portugal-monthly',
  },
  {
    id: 'europe-weekly',
    coverage: 'europe',
    name: { pt: 'Europa 5GB', en: 'Europe 5GB' },
    subtitle: { pt: 'Ideal para viagens, uso diário e manter contacto', en: 'Best for travel, daily use and staying connected' },
    data: '5 GB',
    validityDays: '30',
    validity: { pt: '30 dias', en: '30 days' },
    price: '€9.99',
    coverageLabel: { pt: 'Portugal + Europa', en: 'Portugal + Europe' },
    popular: true,
    href: '/purchase?plan=europe-weekly',
  },
  {
    id: 'europe-monthly',
    coverage: 'europe',
    name: { pt: 'Europa 10GB', en: 'Europe 10GB' },
    subtitle: { pt: 'Ideal para estadias mais longas e uso regular', en: 'Best for longer stays and regular use' },
    data: '10 GB',
    validityDays: '30',
    validity: { pt: '30 dias', en: '30 days' },
    price: '€19.99',
    coverageLabel: { pt: 'Portugal + Europa', en: 'Portugal + Europe' },
    popular: false,
    href: '/purchase?plan=europe-monthly',
  },
  {
    id: 'europe-plus',
    coverage: 'europe',
    name: { pt: 'Europa 20GB', en: 'Europe 20GB' },
    subtitle: { pt: 'Ideal para uso intensivo em toda a Europa', en: 'Best for heavier usage across Europe' },
    data: '20 GB',
    validityDays: '30',
    validity: { pt: '30 dias', en: '30 days' },
    price: '€29.99',
    coverageLabel: { pt: 'Portugal + Europa', en: 'Portugal + Europe' },
    popular: false,
    href: '/purchase?plan=europe-plus',
  },
];

export const comparisonRows = [
  {
    id: 'portugal-starter',
    name: { pt: 'Portugal Chegada', en: 'Portugal Arrival' },
    data: '1 GB',
    duration: { pt: '7 dias', en: '7 days' },
    coverage: { pt: 'Portugal', en: 'Portugal' },
    price: '€4.99',
  },
  {
    id: 'europe-weekly',
    name: { pt: 'Europa 5GB', en: 'Europe 5GB' },
    data: '5 GB',
    duration: { pt: '30 dias', en: '30 days' },
    coverage: { pt: 'Portugal + Europa', en: 'Portugal + Europe' },
    price: '€9.99',
  },
  {
    id: 'europe-monthly',
    name: { pt: 'Europa 10GB', en: 'Europe 10GB' },
    data: '10 GB',
    duration: { pt: '30 dias', en: '30 days' },
    coverage: { pt: 'Portugal + Europa', en: 'Portugal + Europe' },
    price: '€19.99',
  },
];
