
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
    tagline: 'Fique conectado nos seus países PALOP de origem com planos acessíveis e confiáveis.',
    countries: [
      { name: 'Angola', flag: '🇦🇴', code: 'AO' },
      { name: 'Moçambique', flag: '🇲🇿', code: 'MZ' },
      { name: 'Cabo Verde', flag: '🇨🇻', code: 'CV' },
      { name: 'Guiné-Bissau', flag: '🇬🇼', code: 'GW' },
      { name: 'São Tomé e Príncipe', flag: '🇸🇹', code: 'ST' }
    ],
    ctaText: 'Ver Planos PALOP Core',
    ctaLink: '/plans?filter=palop-core',
    color: 'bg-palop-green'
  },
  {
    id: 'palop-regional',
    title: 'PALOP Regional Coverage',
    tagline: 'Viaje pela África Austral e Central com um único plano que cobre PALOP + países vizinhos.',
    countries: [
      { name: 'Angola', flag: '🇦🇴', code: 'AO' },
      { name: 'Moçambique', flag: '🇲🇿', code: 'MZ' },
      { name: 'Cabo Verde', flag: '🇨🇻', code: 'CV' },
      { name: 'Guiné-Bissau', flag: '🇬🇼', code: 'GW' },
      { name: 'São Tomé e Príncipe', flag: '🇸🇹', code: 'ST' },
      { name: 'Namíbia', flag: '🇳🇦', code: 'NA' },
      { name: 'África do Sul', flag: '🇿🇦', code: 'ZA' },
      { name: 'Botswana', flag: '🇧🇼', code: 'BW' },
      { name: 'Congo', flag: '🇨🇬', code: 'CG' },
      { name: 'RDC', flag: '🇨🇩', code: 'CD' },
      { name: 'Zâmbia', flag: '🇿🇲', code: 'ZM' },
      { name: 'Zimbábue', flag: '🇿🇼', code: 'ZW' },
      { name: 'Senegal', flag: '🇸🇳', code: 'SN' },
      { name: 'Guiné', flag: '🇬🇳', code: 'GN' },
      { name: 'Tanzânia', flag: '🇹🇿', code: 'TZ' }
    ],
    ctaText: 'Ver Planos Regionais',
    ctaLink: '/plans?filter=palop-regional',
    color: 'bg-palop-blue'
  },
  {
    id: 'palop-diaspora',
    title: 'PALOP Diaspora Europe Coverage',
    tagline: 'Projetado para a diáspora PALOP na Europa e nas Américas — mantenha contato com casa em qualquer lugar.',
    countries: [
      { name: 'Angola', flag: '🇦🇴', code: 'AO' },
      { name: 'Moçambique', flag: '🇲🇿', code: 'MZ' },
      { name: 'Cabo Verde', flag: '🇨🇻', code: 'CV' },
      { name: 'Guiné-Bissau', flag: '🇬🇼', code: 'GW' },
      { name: 'São Tomé e Príncipe', flag: '🇸🇹', code: 'ST' },
      { name: 'Portugal', flag: '🇵🇹', code: 'PT' },
      { name: 'França', flag: '🇫🇷', code: 'FR' },
      { name: 'Espanha', flag: '🇪🇸', code: 'ES' },
      { name: 'Reino Unido', flag: '🇬🇧', code: 'GB' },
      { name: 'Luxemburgo', flag: '🇱🇺', code: 'LU' },
      { name: 'Holanda', flag: '🇳🇱', code: 'NL' },
      { name: 'Suíça', flag: '🇨🇭', code: 'CH' },
      { name: 'Brasil', flag: '🇧🇷', code: 'BR' },
      { name: 'EUA', flag: '🇺🇸', code: 'US' }
    ],
    ctaText: 'Ver Planos Diaspora',
    ctaLink: '/plans?filter=palop-diaspora',
    color: 'bg-palop-yellow'
  },
  {
    id: 'cplp-global',
    title: 'CPLP Global Coverage',
    tagline: 'Conecte-se em todos os países de língua portuguesa com um único plano CPLP.',
    countries: [
      { name: 'Angola', flag: '🇦🇴', code: 'AO' },
      { name: 'Moçambique', flag: '🇲🇿', code: 'MZ' },
      { name: 'Cabo Verde', flag: '🇨🇻', code: 'CV' },
      { name: 'Guiné-Bissau', flag: '🇬🇼', code: 'GW' },
      { name: 'São Tomé e Príncipe', flag: '🇸🇹', code: 'ST' },
      { name: 'Brasil', flag: '🇧🇷', code: 'BR' },
      { name: 'Portugal', flag: '🇵🇹', code: 'PT' },
      { name: 'Timor-Leste', flag: '🇹🇱', code: 'TL' },
      { name: 'Macau', flag: '🇲🇴', code: 'MO' },
      { name: 'Guiné Equatorial', flag: '🇬🇶', code: 'GQ' }
    ],
    ctaText: 'Ver Planos CPLP',
    ctaLink: '/plans?filter=cplp-global',
    color: 'bg-palop-red'
  }
];

export const coverageMetrics = {
  totalCountries: 26,
  averageCoverage: 94,
  keySellingPoint: 'Plans tailored for PALOP travelers and diaspora'
};
