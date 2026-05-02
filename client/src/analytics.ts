import ReactGA from 'react-ga4';

const GA4_ID = import.meta.env.VITE_GA4_ID;

if (GA4_ID) {
  ReactGA.initialize(GA4_ID, {
    gaOptions: { anonymizeIp: true },
  });
}
