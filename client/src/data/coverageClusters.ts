
export interface CoverageCluster {
  id: string;
  title: string;
  tagline: string;
  countries: Array<{
    name: string;
    flag: string;
    code: string;
  }>;
  ctaText: string;
  ctaLink: string;
  color: string;
}

export const coverageClusters: CoverageCluster[] = [
  {
    id: 'palop-core',
    title: 'PALOP Core Coverage',
    tagline: 'Stay connected in your home PALOP countries with affordable and reliable plans.',
    countries: [
      { name: 'Angola', flag: '🇦🇴', code: 'AO' },
      { name: 'Mozambique', flag: '🇲🇿', code: 'MZ' },
      { name: 'Cape Verde', flag: '🇨🇻', code: 'CV' },
      { name: 'Guinea-Bissau', flag: '🇬🇼', code: 'GW' },
      { name: 'São Tomé and Príncipe', flag: '🇸🇹', code: 'ST' }
    ],
    ctaText: 'View PALOP Core Plans',
    ctaLink: '/plans?filter=palop-core',
    color: 'bg-palop-green'
  },
  {
    id: 'palop-regional',
    title: 'PALOP Regional Coverage',
    tagline: 'Travel across Southern and Central Africa with a single plan covering PALOP + neighboring countries.',
    countries: [
      { name: 'Angola', flag: '🇦🇴', code: 'AO' },
      { name: 'Mozambique', flag: '🇲🇿', code: 'MZ' },
      { name: 'Cape Verde', flag: '🇨🇻', code: 'CV' },
      { name: 'Guinea-Bissau', flag: '🇬🇼', code: 'GW' },
      { name: 'São Tomé and Príncipe', flag: '🇸🇹', code: 'ST' },
      { name: 'Namibia', flag: '🇳🇦', code: 'NA' },
      { name: 'South Africa', flag: '🇿🇦', code: 'ZA' },
      { name: 'Botswana', flag: '🇧🇼', code: 'BW' },
      { name: 'Congo', flag: '🇨🇬', code: 'CG' },
      { name: 'DRC', flag: '🇨🇩', code: 'CD' },
      { name: 'Zambia', flag: '🇿🇲', code: 'ZM' },
      { name: 'Zimbabwe', flag: '🇿🇼', code: 'ZW' },
      { name: 'Senegal', flag: '🇸🇳', code: 'SN' },
      { name: 'Guinea', flag: '🇬🇳', code: 'GN' },
      { name: 'Tanzania', flag: '🇹🇿', code: 'TZ' }
    ],
    ctaText: 'View Regional Plans',
    ctaLink: '/plans?filter=palop-regional',
    color: 'bg-palop-blue'
  },
  {
    id: 'palop-diaspora',
    title: 'PALOP Diaspora Europe Coverage',
    tagline: 'Designed for the PALOP diaspora in Europe and the Americas — stay in touch with home anywhere.',
    countries: [
      { name: 'Angola', flag: '🇦🇴', code: 'AO' },
      { name: 'Mozambique', flag: '🇲🇿', code: 'MZ' },
      { name: 'Cape Verde', flag: '🇨🇻', code: 'CV' },
      { name: 'Guinea-Bissau', flag: '🇬🇼', code: 'GW' },
      { name: 'São Tomé and Príncipe', flag: '🇸🇹', code: 'ST' },
      { name: 'Portugal', flag: '🇵🇹', code: 'PT' },
      { name: 'France', flag: '🇫🇷', code: 'FR' },
      { name: 'Spain', flag: '🇪🇸', code: 'ES' },
      { name: 'United Kingdom', flag: '🇬🇧', code: 'GB' },
      { name: 'Luxembourg', flag: '🇱🇺', code: 'LU' },
      { name: 'Netherlands', flag: '🇳🇱', code: 'NL' },
      { name: 'Switzerland', flag: '🇨🇭', code: 'CH' },
      { name: 'Brazil', flag: '🇧🇷', code: 'BR' },
      { name: 'USA', flag: '🇺🇸', code: 'US' }
    ],
    ctaText: 'View Diaspora Plans',
    ctaLink: '/plans?filter=palop-diaspora',
    color: 'bg-palop-yellow'
  },
  {
    id: 'cplp-global',
    title: 'CPLP Global Coverage',
    tagline: 'Connect across all Portuguese-speaking countries with a single CPLP plan.',
    countries: [
      { name: 'Angola', flag: '🇦🇴', code: 'AO' },
      { name: 'Mozambique', flag: '🇲🇿', code: 'MZ' },
      { name: 'Cape Verde', flag: '🇨🇻', code: 'CV' },
      { name: 'Guinea-Bissau', flag: '🇬🇼', code: 'GW' },
      { name: 'São Tomé and Príncipe', flag: '🇸🇹', code: 'ST' },
      { name: 'Brazil', flag: '🇧🇷', code: 'BR' },
      { name: 'Portugal', flag: '🇵🇹', code: 'PT' },
      { name: 'Timor-Leste', flag: '🇹🇱', code: 'TL' },
      { name: 'Macau', flag: '🇲🇴', code: 'MO' },
      { name: 'Equatorial Guinea', flag: '🇬🇶', code: 'GQ' }
    ],
    ctaText: 'View CPLP Plans',
    ctaLink: '/plans?filter=cplp-global',
    color: 'bg-palop-red'
  }
];

export const coverageMetrics = {
  totalCountries: 26,
  averageCoverage: 94,
  keySellingPoint: 'Plans tailored for PALOP travelers and diaspora'
};
