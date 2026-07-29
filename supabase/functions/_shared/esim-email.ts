// ---------------------------------------------------------------------------
// SHARED PROVISIONING EMAIL — the single customer-facing "your eSIM is ready"
// delivery, styled after the Palopianos travel-pack design.
//
// Used by: _shared/esim-provision.ts (stripe-webhook), esim-access,
// esimcard-provision (via esim-provision re-export) and resend-esim-email.
//
// Guarantees:
//   • QR ALWAYS present when we have an LPA code — if the supplier returned no
//     QR image (eSIMCard does this), we render one server-side from the LPA
//     string and inline it as a CID attachment (survives Gmail image proxying;
//     data: URIs would be stripped).
//   • A personalized PDF travel pack is attached (best-effort — the email is
//     still sent if PDF generation fails).
//   • GDPR: no customer email or tokens in logs.
// ---------------------------------------------------------------------------

import QRCodeLib from 'npm:qrcode@1.5.3';
import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';

// ---------------------------------------------------------------------------
// LPA parsing — LPA:1$<smdp-address>$<matching-id>
// ---------------------------------------------------------------------------
export function parseLpa(lpa: string | null): { smdp: string | null; matchingId: string | null } {
  if (!lpa) return { smdp: null, matchingId: null };
  const parts = lpa.replace(/^LPA:/i, '').split('$');
  // parts: ["1", smdp, matchingId]
  return { smdp: parts[1] ?? null, matchingId: parts[2] ?? null };
}

// ---------------------------------------------------------------------------
// Per-country "útil no destino" content (PT). Inferred from the plan name;
// unknown destinations get a neutral, region-free email (never claim coverage).
// ---------------------------------------------------------------------------
interface CountryInfo {
  name: string;
  /** Name with the PT article for "para X" sentences (e.g. "o Brasil"). Defaults to `name`. */
  titleName?: string;
  currency: string;
  emergency: string;
  networks: string;
}

const COUNTRY_INFO: Array<{ match: RegExp; info: CountryInfo }> = [
  { match: /mo[cç]ambique|mozambique/i, info: { name: 'Moçambique', currency: 'Metical (MZN) · 1 EUR ≈ 70 MZN', emergency: '112 · 119 (Polícia) · 198 (Ambulância)', networks: 'Vodacom · Movitel · Tmcel' } },
  { match: /cabo\s*verde|cape\s*verde/i, info: { name: 'Cabo Verde', currency: 'Escudo (CVE) · 1 EUR ≈ 110 CVE', emergency: '132 (Polícia) · 130 (Bombeiros) · 131 (Ambulância)', networks: 'CV Móvel · T+ (Unitel) · CVTelecom' } },
  { match: /angola/i, info: { name: 'Angola', currency: 'Kwanza (AOA)', emergency: '113 (Polícia) · 115 (Bombeiros) · 116 (Ambulância)', networks: 'Unitel · Africell · Movicel' } },
  { match: /guin[eé]/i, info: { name: 'Guiné-Bissau', currency: 'Franco CFA (XOF) · 1 EUR ≈ 656 XOF', emergency: '117 (Polícia) · 118 (Bombeiros)', networks: 'Orange · MTN' } },
  { match: /s[aã]o\s*tom[eé]/i, info: { name: 'São Tomé e Príncipe', currency: 'Dobra (STN) · 1 EUR ≈ 24,5 STN', emergency: '112', networks: 'CST · Unitel STP' } },
  { match: /[aá]frica\s*do\s*sul|south\s*africa/i, info: { name: 'África do Sul', titleName: 'a África do Sul', currency: 'Rand (ZAR) · 1 EUR ≈ 20 ZAR', emergency: '10111 (Polícia) · 10177 (Ambulância) · 112 (do telemóvel)', networks: 'Vodacom · MTN · Cell C · Telkom' } },
  { match: /brasil|brazil/i, info: { name: 'Brasil', titleName: 'o Brasil', currency: 'Real (BRL) · 1 EUR ≈ 6 BRL', emergency: '190 (Polícia) · 192 (SAMU/Ambulância) · 193 (Bombeiros)', networks: 'Vivo · Claro · TIM' } },
  { match: /\busa\b|\beua\b|united\s*states|estados\s*unidos/i, info: { name: 'Estados Unidos', titleName: 'os Estados Unidos', currency: 'Dólar (USD) · 1 EUR ≈ 1,1 USD', emergency: '911 (número único)', networks: 'T-Mobile · AT&T · Verizon' } },
  { match: /portugal|europ[ae]|\beu\b/i, info: { name: 'Portugal e Europa', currency: 'Euro (EUR)', emergency: '112 (número único europeu)', networks: 'MEO · NOS · Vodafone e redes parceiras na UE' } },
];

// Neutral fallback for plans we don't recognise — never claim a specific
// region. `name` is empty; render sites must degrade to generic wording.
const DEFAULT_COUNTRY: CountryInfo = {
  name: '',
  currency: '',
  emergency: '',
  networks: '',
};

export function getCountryInfo(planName: string | null): CountryInfo {
  if (planName) {
    for (const { match, info } of COUNTRY_INFO) {
      if (match.test(planName)) return info;
    }
  }
  return DEFAULT_COUNTRY;
}

/** "O seu eSIM para o Brasil está pronto" — or generic when the destination is unknown. */
export function esimReadyTitle(country: CountryInfo): string {
  const dest = country.titleName ?? country.name;
  return dest ? `O seu eSIM para ${dest} está pronto` : 'O seu eSIM está pronto';
}

// ---------------------------------------------------------------------------
// Server-side QR generation from the LPA string (base64 PNG, no data: prefix).
// ---------------------------------------------------------------------------
export async function generateQrPngBase64(lpa: string): Promise<string | null> {
  try {
    const dataUrl: string = await QRCodeLib.toDataURL(lpa, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 480,
      color: { dark: '#111111', light: '#ffffff' },
    });
    return dataUrl.replace(/^data:image\/png;base64,/, '');
  } catch (e: any) {
    console.error(`[esim-email/qr] generation failed — ${e?.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// PDF travel pack (2 pages, A4) — pdf-lib, standard fonts (WinAnsi handles PT
// accents). Returns base64 or null (never throws).
// ---------------------------------------------------------------------------
export async function buildEsimPackPdf(opts: {
  planName: string;
  dataAmount: string;
  iccid: string | null;
  lpaCode: string | null;
  webUrl: string | null;
  qrPngBase64: string | null;
  country: CountryInfo;
}): Promise<string | null> {
  try {
    // Standard fonts use WinAnsi encoding — strip/replace characters outside it
    // (e.g. '≈' U+2248) or drawText throws and the whole pack is lost.
    const sane = (s: string): string =>
      s
        .replace(/≈/g, '~')
        .replace(/→/g, '->')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        // deno-lint-ignore no-control-regex
        .replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2022\u00B7]/g, '');
    const planName = sane(opts.planName);
    const dataAmount = sane(opts.dataAmount);
    const iccid = opts.iccid ? sane(opts.iccid) : null;
    const lpaCode = opts.lpaCode ? sane(opts.lpaCode) : null;
    const webUrl = opts.webUrl ? sane(opts.webUrl) : null;
    const { qrPngBase64 } = opts;
    const country: CountryInfo = {
      name: sane(opts.country.name),
      titleName: opts.country.titleName ? sane(opts.country.titleName) : undefined,
      currency: sane(opts.country.currency),
      emergency: sane(opts.country.emergency),
      networks: sane(opts.country.networks),
    };
    const doc = await PDFDocument.create();
    const helv = await doc.embedFont(StandardFonts.Helvetica);
    const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const GREEN = rgb(0.086, 0.639, 0.29);
    const DARK = rgb(0.09, 0.09, 0.11);
    const GREY = rgb(0.42, 0.42, 0.47);
    const LIGHT = rgb(0.96, 0.96, 0.97);

    const W = 595.28, H = 841.89, M = 48;

    const wrap = (text: string, font: any, size: number, maxWidth: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let line = '';
      for (const w of words) {
        const trial = line ? `${line} ${w}` : w;
        if (font.widthOfTextAtSize(trial, size) > maxWidth && line) {
          lines.push(line);
          line = w;
        } else {
          line = trial;
        }
      }
      if (line) lines.push(line);
      return lines;
    };

    // ---- Page 1 — welcome / steps / sustainability ----
    const p1 = doc.addPage([W, H]);
    let y = H - 60;
    p1.drawText('PALOP CONNECT', { x: M, y, size: 14, font: helvBold, color: GREEN });
    p1.drawText('Documento de viagem · palopconnect.com', { x: W - M - 220, y, size: 8, font: helv, color: GREY });
    y -= 8;
    p1.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: GREEN });

    y -= 64;
    for (const line of wrap(`${esimReadyTitle(country)}.`, helvBold, 26, W - 2 * M)) {
      p1.drawText(line, { x: M, y, size: 26, font: helvBold, color: DARK });
      y -= 32;
    }
    y -= 4;
    p1.drawText('Internet imediata — sem chip físico, sem contrato, sem complicações.', { x: M, y, size: 12, font: helv, color: GREY });

    y -= 44;
    p1.drawText('Preparado para', { x: M, y, size: 9, font: helv, color: GREY });
    y -= 18;
    p1.drawText('Caro/a Viajante', { x: M, y, size: 14, font: helvBold, color: DARK });
    y -= 16;
    p1.drawText(`1 eSIM · ${dataAmount || planName}${country.name ? ` · ${country.name}` : ''} · PalopConnect`, { x: M, y, size: 11, font: helv, color: GREY });

    y -= 44;
    p1.drawText('Como activar o seu eSIM em 3 passos:', { x: M, y, size: 14, font: helvBold, color: DARK });
    y -= 26;
    const steps = [
      'Digitaliza o QR code na página seguinte com a câmara do telemóvel — ou toca em "Instalação Rápida" no email para instalar directamente pelo link.',
      'Segue os passos no ecrã — escolhe uma etiqueta para o novo eSIM, define a linha principal e selecciona o eSIM para os dados móveis. Demora menos de 2 minutos.',
      'O teu cartão continua activo em paralelo — podes ter os dois ligados ao mesmo tempo. As instruções detalhadas estão na página seguinte.',
    ];
    steps.forEach((s, i) => {
      p1.drawCircle({ x: M + 9, y: y + 4, size: 9, color: GREEN });
      p1.drawText(String(i + 1), { x: M + 6.5, y, size: 10, font: helvBold, color: rgb(1, 1, 1) });
      let sy = y;
      for (const line of wrap(s, helv, 10.5, W - 2 * M - 34)) {
        p1.drawText(line, { x: M + 28, y: sy, size: 10.5, font: helv, color: DARK });
        sy -= 14;
      }
      y = sy - 12;
    });

    y -= 12;
    p1.drawRectangle({ x: M, y: y - 96, width: W - 2 * M, height: 108, color: LIGHT });
    p1.drawText('BEM-VINDO À REDE PALOPCONNECT', { x: M + 16, y: y - 8, size: 10, font: helvBold, color: GREEN });
    const welcome = `Caro/a viajante, este ${country.titleName ?? country.name ? `eSIM é o seu para ${country.titleName ?? country.name}` : 'é o seu eSIM de viagem'} — digitaliza o QR code na página seguinte, instala em menos de dois minutos, e aterra já conectado/a. Sem filas, sem roaming surpresa, sem complicações. Se tiver alguma questão, estamos aqui para ajudar. Boa viagem!`;
    let wy = y - 26;
    for (const line of wrap(welcome, helv, 10, W - 2 * M - 32)) {
      p1.drawText(line, { x: M + 16, y: wy, size: 10, font: helv, color: DARK });
      wy -= 13.5;
    }

    y = wy - 34;
    p1.drawText('ESIM & SUSTENTABILIDADE', { x: M, y, size: 10, font: helvBold, color: GREEN });
    y -= 18;
    const sust = [
      '0 plástico utilizado — sem chip físico, sem embalagem, sem resíduos',
      'Reutilizável — o mesmo eSIM pode ser reprogramado para qualquer destino',
      'Menos CO2 — activado por email, sem logística de entrega física',
      'Um chip SIM plástico leva ~1000 anos a decompor-se num aterro sanitário',
    ];
    for (const s of sust) {
      p1.drawText(`•  ${s}`, { x: M, y, size: 9.5, font: helv, color: GREY });
      y -= 14;
    }

    p1.drawLine({ start: { x: M, y: 70 }, end: { x: W - M, y: 70 }, thickness: 0.5, color: GREY });
    p1.drawText('PALOP Connect · palopconnect.com · suporte@palopconnect.com', { x: M, y: 54, size: 8.5, font: helv, color: GREY });
    p1.drawText('Página 1 de 2', { x: W - M - 60, y: 54, size: 8.5, font: helv, color: GREY });

    // ---- Page 2 — QR + activation details + install steps + country tips ----
    const p2 = doc.addPage([W, H]);
    y = H - 60;
    p2.drawText(country.name || planName || 'O seu eSIM', { x: M, y, size: 20, font: helvBold, color: DARK });
    y -= 18;
    p2.drawText(`${dataAmount || ''}${dataAmount && planName ? ' · ' : ''}${planName}`, { x: M, y, size: 11, font: helv, color: GREY });
    y -= 10;
    p2.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: GREEN });

    // QR block (right) + details (left)
    const qrSize = 168;
    const qrX = W - M - qrSize;
    const qrY = y - qrSize - 28;
    if (qrPngBase64) {
      const png = await doc.embedPng(Uint8Array.from(atob(qrPngBase64), (c) => c.charCodeAt(0)));
      p2.drawRectangle({ x: qrX - 8, y: qrY - 8, width: qrSize + 16, height: qrSize + 16, borderColor: GREEN, borderWidth: 2 });
      p2.drawImage(png, { x: qrX, y: qrY, width: qrSize, height: qrSize });
      p2.drawText('Digitaliza com a câmara', { x: qrX + 14, y: qrY - 26, size: 9, font: helv, color: GREY });
      p2.drawText('para instalar o eSIM', { x: qrX + 22, y: qrY - 38, size: 9, font: helv, color: GREY });
    }

    const { smdp, matchingId } = parseLpa(opts.lpaCode);
    let dy = y - 40;
    const detail = (label: string, value: string | null) => {
      if (!value) return;
      p2.drawText(label, { x: M, y: dy, size: 8.5, font: helvBold, color: GREY });
      dy -= 12;
      for (const line of wrap(value, helv, 9, qrX - M - 32)) {
        p2.drawText(line, { x: M, y: dy, size: 9, font: helv, color: DARK });
        dy -= 12;
      }
      dy -= 8;
    };
    detail('SMDP+ ADDRESS', smdp);
    detail('ACTIVATION CODE', matchingId);
    detail('CÓDIGO LPA COMPLETO', lpaCode);
    detail('ICCID', iccid);
    detail('DATA ROAMING', 'Activado (necessário para o eSIM funcionar)');
    if (webUrl) detail('INSTALAÇÃO RÁPIDA (LINK)', webUrl);

    y = Math.min(dy, qrY - 52) - 16;

    // Install steps — two columns
    p2.drawText('Passo 1/2 — Instalação', { x: M, y, size: 11, font: helvBold, color: DARK });
    const colX = W / 2 + 8;
    p2.drawText('Passo 2/2 — Activação', { x: colX, y, size: 11, font: helvBold, color: DARK });
    y -= 18;
    const colW = W / 2 - M - 16;
    const install = [
      'Toca em "Instalar eSIM" no ecrã do telemóvel.',
      'Toca em "Permitir" na caixa de confirmação.',
      'Segue as instruções no ecrã para concluir a instalação.',
      'Escolhe uma etiqueta para o novo eSIM (ex: "PalopConnect").',
      'Selecciona "Primário" para a linha predefinida.',
      'Escolhe a linha para iMessage/FaceTime e continua.',
      'Selecciona o novo eSIM para os dados móveis.',
    ];
    const activate = [
      'Vai a Dados Móveis, selecciona o eSIM e activa "Ligar esta Linha".',
      'Se necessário, em "Selecção de Rede" escolhe manualmente uma rede suportada.',
      'Activa o "Roaming de Dados" para o novo eSIM.',
    ];
    let ly = y, ry = y;
    install.forEach((s, i) => {
      let first = true;
      for (const line of wrap(`${i + 1}. ${s}`, helv, 9, colW)) {
        p2.drawText(line, { x: M + (first ? 0 : 12), y: ly, size: 9, font: helv, color: DARK });
        ly -= 12;
        first = false;
      }
      ly -= 3;
    });
    activate.forEach((s, i) => {
      let first = true;
      for (const line of wrap(`${i + 1}. ${s}`, helv, 9, colW)) {
        p2.drawText(line, { x: colX + (first ? 0 : 12), y: ry, size: 9, font: helv, color: DARK });
        ry -= 12;
        first = false;
      }
      ry -= 3;
    });
    // Troubleshooting box under right column
    ry -= 10;
    p2.drawRectangle({ x: colX, y: ry - 44, width: colW, height: 52, color: LIGHT });
    p2.drawText('SE O ESIM NÃO FUNCIONAR, VERIFICA:', { x: colX + 10, y: ry - 6, size: 8.5, font: helvBold, color: DARK });
    p2.drawText('Roaming de Dados: Activado', { x: colX + 10, y: ry - 20, size: 9, font: helv, color: DARK });
    p2.drawText('APN: configurado automaticamente pelo perfil', { x: colX + 10, y: ry - 33, size: 9, font: helv, color: DARK });

    y = Math.min(ly, ry - 60) - 20;

    // Country tips — only when we actually know the destination
    if (country.name) {
      p2.drawText(`ÚTIL EM ${country.name.toUpperCase()}`, { x: M, y, size: 10, font: helvBold, color: GREEN });
      y -= 18;
      const tips = [
        `Moeda: ${country.currency}`,
        `Emergências: ${country.emergency}`,
        `Redes: ${country.networks}`,
      ];
      for (const t of tips) {
        p2.drawText(`•  ${t}`, { x: M, y, size: 9.5, font: helv, color: DARK });
        y -= 14;
      }
    }

    p2.drawLine({ start: { x: M, y: 70 }, end: { x: W - M, y: 70 }, thickness: 0.5, color: GREY });
    p2.drawText('PALOP Connect · palopconnect.com · suporte@palopconnect.com', { x: M, y: 54, size: 8.5, font: helv, color: GREY });
    p2.drawText('Página 2 de 2', { x: W - M - 60, y: 54, size: 8.5, font: helv, color: GREY });

    const bytes = await doc.saveAsBase64();
    return bytes;
  } catch (e: any) {
    console.error(`[esim-email/pdf] generation failed (non-fatal) — ${e?.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// PUBLIC — send the provisioning email (pack-styled HTML + inline QR + PDF).
// ---------------------------------------------------------------------------
export async function sendProvisioningEmail(opts: {
  customerEmail: string;
  planName: string;
  dataAmount: string;
  iccid: string | null;
  lpaCode: string | null;
  webUrl: string | null;
  qrImageUrl: string | null;
  supabaseUrl: string;
  serviceKey: string;
  resendApiKey: string;
  origin: string;
  /** Optional magic-link redirect override (defaults to `${origin}/orders`). */
  redirectTo?: string | null;
}): Promise<void> {
  const { customerEmail, planName, dataAmount, iccid, lpaCode, webUrl, qrImageUrl, supabaseUrl, serviceKey, resendApiKey, origin } = opts;
  const redirectTarget = opts.redirectTo || `${origin || 'https://palopconnect.com'}/orders`;

  const country = getCountryInfo(planName);
  const { smdp, matchingId } = parseLpa(lpaCode);

  // Magic link so the customer can view orders without a password
  let magicLink = redirectTarget;
  try {
    const mlRes = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'magiclink', email: customerEmail, options: { redirect_to: redirectTarget } }),
    });
    if (mlRes.ok) {
      const mlData = await mlRes.json();
      magicLink = mlData?.action_link ?? magicLink;
    }
  } catch (e: any) {
    console.warn('[esim-email] magic link exception (non-fatal):', e.message);
  }

  // --- QR resolution: supplier image if given, else generate from LPA ---
  // Generated QR goes inline as a CID attachment (Gmail strips data: URIs).
  let qrPngBase64: string | null = null;
  let qrImgTag = '';
  if (qrImageUrl) {
    qrImgTag = `<img src="${qrImageUrl}" alt="eSIM QR Code" width="200" height="200" style="border:3px solid #16a34a;border-radius:8px;padding:6px;display:block;margin:0 auto;" />`;
  } else if (lpaCode) {
    qrPngBase64 = await generateQrPngBase64(lpaCode);
    if (qrPngBase64) {
      qrImgTag = `<img src="cid:esim-qr" alt="eSIM QR Code" width="200" height="200" style="border:3px solid #16a34a;border-radius:8px;padding:6px;display:block;margin:0 auto;" />`;
    }
  }
  // Even without any QR (no LPA), still generate the pack PDF with what we have.
  if (!qrPngBase64 && lpaCode) {
    // reuse for PDF: if supplier gave a URL we still generate our own PNG for the PDF
    qrPngBase64 = await generateQrPngBase64(lpaCode);
  }

  // --- PDF pack (best-effort) ---
  const pdfBase64 = await buildEsimPackPdf({
    planName: planName || 'eSIM',
    dataAmount: dataAmount || '',
    iccid,
    lpaCode,
    webUrl,
    qrPngBase64,
    country,
  });

  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:7px 0;font-size:11px;color:#71717a;font-weight:700;text-transform:uppercase;letter-spacing:.04em;width:42%;vertical-align:top;">${label}</td>
      <td style="padding:7px 0;font-size:13px;color:#18181b;word-break:break-all;">${value}</td>
    </tr>`;

  const detailRows = [
    smdp ? row('SMDP+ Address', `<code>${smdp}</code>`) : '',
    matchingId ? row('Activation Code', `<code>${matchingId}</code>`) : '',
    lpaCode ? row('Código LPA', `<code>${lpaCode}</code>`) : '',
    iccid ? row('ICCID', `<code>${iccid}</code>`) : '',
    row('Data Roaming', 'Activado'),
  ].filter(Boolean).join('');

  const quickInstall = webUrl
    ? `<div style="text-align:center;margin:20px 0 4px;">
        <a href="${webUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">Instalação Rápida — toca aqui para instalar</a>
      </div>` : '';

  const qrBlock = qrImgTag
    ? `<div style="text-align:center;margin:24px 0 8px;">
        ${qrImgTag}
        <p style="font-size:12px;color:#71717a;margin:10px 0 0;">Digitaliza com a câmara para instalar o eSIM<br><span style="color:#a1a1aa;">Scan with your camera to install the eSIM</span></p>
      </div>` : '';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

        <tr><td style="background:linear-gradient(135deg,#14532d,#16a34a);padding:36px 40px;">
          <p style="margin:0 0 6px;color:#bbf7d0;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">PALOP Connect · Documento de viagem</p>
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;line-height:1.25;">${esimReadyTitle(country)}.</h1>
          <p style="margin:10px 0 0;color:rgba(255,255,255,.85);font-size:14px;">Internet imediata — sem chip físico, sem contrato, sem complicações.</p>
        </td></tr>

        <tr><td style="padding:28px 40px 8px;">
          <p style="margin:0;font-size:11px;color:#71717a;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Preparado para</p>
          <p style="margin:4px 0 0;font-size:16px;color:#18181b;font-weight:700;">Caro/a Viajante</p>
          <p style="margin:2px 0 0;font-size:13px;color:#52525b;">1 eSIM${dataAmount ? ` · ${dataAmount}` : ''} · ${planName || 'PalopConnect'}${country.name ? ` · ${country.name}` : ''}</p>
        </td></tr>

        <tr><td style="padding:20px 40px 0;">
          <h2 style="margin:0 0 14px;font-size:16px;color:#18181b;">Como activar o seu eSIM em 3 passos:</h2>
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr><td style="width:28px;vertical-align:top;"><span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#16a34a;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:22px;">1</span></td>
              <td style="padding:0 0 12px 8px;font-size:13.5px;color:#3f3f46;line-height:1.55;">Digitaliza o QR code abaixo com a câmara do telemóvel — ou toca em <strong>"Instalação Rápida"</strong> para instalar directamente pelo link.</td></tr>
            <tr><td style="width:28px;vertical-align:top;"><span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#16a34a;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:22px;">2</span></td>
              <td style="padding:0 0 12px 8px;font-size:13.5px;color:#3f3f46;line-height:1.55;">Segue os passos no ecrã — escolhe uma etiqueta para o novo eSIM, define a linha principal e selecciona o eSIM para os dados móveis. <strong>Demora menos de 2 minutos.</strong></td></tr>
            <tr><td style="width:28px;vertical-align:top;"><span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#16a34a;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:22px;">3</span></td>
              <td style="padding:0 0 4px 8px;font-size:13.5px;color:#3f3f46;line-height:1.55;">O teu cartão continua activo em paralelo — podes ter os dois ligados ao mesmo tempo.</td></tr>
          </table>
          ${quickInstall}
          ${qrBlock}
        </td></tr>

        ${detailRows ? `<tr><td style="padding:16px 40px 0;">
          <div style="background:#f4f4f5;border-radius:10px;padding:18px 20px;">
            <p style="margin:0 0 8px;font-size:12px;color:#16a34a;font-weight:800;text-transform:uppercase;letter-spacing:.06em;">Dados de activação manual</p>
            <table cellpadding="0" cellspacing="0" width="100%">${detailRows}</table>
          </div>
        </td></tr>` : ''}

        <tr><td style="padding:20px 40px 0;">
          <div style="border:1px solid #fde68a;background:#fffbeb;border-radius:10px;padding:14px 18px;">
            <p style="margin:0;font-size:12.5px;color:#92400e;"><strong>Se o eSIM não funcionar, verifica:</strong> Roaming de Dados <strong>Activado</strong> · APN configurado automaticamente pelo perfil · selecciona manualmente uma rede suportada se necessário.</p>
          </div>
        </td></tr>

        ${country.name ? `<tr><td style="padding:22px 40px 0;">
          <p style="margin:0 0 10px;font-size:12px;color:#16a34a;font-weight:800;text-transform:uppercase;letter-spacing:.06em;">Útil em ${country.name}</p>
          <table cellpadding="0" cellspacing="0" width="100%" style="font-size:12.5px;color:#3f3f46;line-height:1.7;">
            <tr><td style="padding:2px 0;">💱 <strong>Moeda:</strong> ${country.currency}</td></tr>
            <tr><td style="padding:2px 0;">🚨 <strong>Emergências:</strong> ${country.emergency}</td></tr>
            <tr><td style="padding:2px 0;">📶 <strong>Redes:</strong> ${country.networks}</td></tr>
          </table>
        </td></tr>` : ''}

        <tr><td style="padding:22px 40px 0;">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;">
            <p style="margin:0;font-size:12.5px;color:#166534;line-height:1.6;">🌱 <strong>eSIM & Sustentabilidade</strong> — 0 plástico, sem chip físico, sem logística de entrega. O mesmo eSIM pode ser reprogramado para qualquer destino. A escolha da viagem consciente.</p>
          </div>
        </td></tr>

        <tr><td style="padding:24px 40px 0;">
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px;text-align:center;">
            <p style="margin:0 0 12px;font-size:14px;color:#1e40af;"><strong>Acede ao histórico das tuas encomendas</strong><br>Clica abaixo para entrar instantaneamente — sem palavra-passe.</p>
            <a href="${magicLink}" style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">Ver as minhas encomendas →</a>
            <p style="margin:12px 0 0;font-size:11px;color:#6b7280;">Este link expira em 1 hora.</p>
          </div>
          ${pdfBase64 ? `<p style="margin:16px 0 0;font-size:12px;color:#71717a;text-align:center;">📎 O teu guia completo de viagem segue em anexo (PDF).</p>` : ''}
        </td></tr>

        <tr><td style="padding:28px 40px 24px;">
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 16px;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">PALOP Connect · Stay Connected Across PALOP Communities<br>
          <a href="https://palopconnect.com" style="color:#9ca3af;">palopconnect.com</a> · <a href="mailto:suporte@palopconnect.com" style="color:#9ca3af;">suporte@palopconnect.com</a> · WhatsApp +351 911 186 695 (8h–20h)</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const textBody = [
    `${esimReadyTitle(country)} — PALOP Connect`,
    `Plano: ${planName || 'eSIM'}${dataAmount ? ` (${dataAmount})` : ''}`,
    smdp ? `SMDP+ Address: ${smdp}` : '',
    matchingId ? `Activation Code: ${matchingId}` : '',
    lpaCode ? `Código LPA: ${lpaCode}` : '',
    iccid ? `ICCID: ${iccid}` : '',
    webUrl ? `Instalação rápida: ${webUrl}` : '',
    `Data Roaming: Activado`,
    ``,
    `Ver encomendas: ${magicLink}`,
    `(Link expira em 1 hora)`,
    ``,
    `Suporte: suporte@palopconnect.com · WhatsApp +351 911 186 695`,
  ].filter(Boolean).join('\n');

  const attachments: any[] = [];
  if (!qrImageUrl && qrPngBase64) {
    attachments.push({ filename: 'esim-qr.png', content: qrPngBase64, content_id: 'esim-qr', content_type: 'image/png' });
  }
  if (pdfBase64) {
    const countrySlug = (country.name || 'Viagem').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z]+/g, '-');
    attachments.push({ filename: `eSIM-Pack-PalopConnect-${countrySlug}.pdf`, content: pdfBase64, content_type: 'application/pdf' });
  }

  const payload: Record<string, unknown> = {
    from: 'BuéChama <esims@palopconnect.com>',
    to: [customerEmail],
    subject: `${esimReadyTitle(country)} — PALOP Connect`,
    html,
    text: textBody,
  };
  if (attachments.length > 0) payload.attachments = attachments;

  const sendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!sendRes.ok) {
    const err = await sendRes.json().catch(() => ({}));
    console.error(`[esim-email] Resend failed — status=${sendRes.status} error=${err?.message ?? '(unknown)'}`);
    // Retry once WITHOUT attachments if the payload was rejected (e.g. size)
    if (attachments.length > 0) {
      delete payload.attachments;
      const retry = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (retry.ok) {
        console.log('[esim-email] sent without attachments after retry');
      } else {
        console.error(`[esim-email] retry without attachments also failed — status=${retry.status}`);
        throw new Error(`Email send failed (status ${retry.status})`);
      }
    } else {
      throw new Error(`Email send failed (status ${sendRes.status})`);
    }
  } else {
    console.log(`[esim-email] sent — plan=${planName} country=${country.name} qrInline=${!qrImageUrl && !!qrPngBase64} pdf=${!!pdfBase64}`);
  }
}
