/**
 * DEV-ONLY QA PREVIEW — never rendered in production.
 *
 * Vite replaces import.meta.env.DEV with `false` in production builds,
 * so this entire component is tree-shaken out and never shipped to users.
 *
 * Purpose: validate all five public activation states (processing / ready /
 * active / expired / error) using mock order data that exactly drives the
 * deriveActivationState() logic, without touching any real orders or backend.
 */

import { useState } from "react";
import OrderCard from "./OrderCard";
import QRCodeDownloadModal from "../QRCodeDownloadModal";
import { useLanguage } from "@/contexts/language";
import { AlertTriangle, ChevronDown, ChevronRight, FlaskConical } from "lucide-react";
import { PLAN_PRICES } from "@/content/plansPageContent";

/* ── Mock data — drives every state in deriveActivationState() ─────── */

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

const MOCK_ORDERS = [
  {
    _qaState: 'processing' as const,
    _qaLabel: '1 — Processing / Em processamento',
    _qaDesc: 'Payment succeeded, eSIM not yet delivered. No QR. Support CTA only.',
    order: {
      id: 'qa-processing-001',
      plan_name: '[QA] Europe Weekly — Processing',
      data_amount: '5 GB',
      duration_days: 7,
      price: PLAN_PRICES['europe-weekly'],
      created_at: daysAgo(0),
      status: 'completed',
      payment_status: 'succeeded',
      esim_delivered_at: null,
      payment_intent_id: 'pi_qa_processing_001',
      coverage: null,
    },
    qrCode: undefined as any,
  },
  {
    _qaState: 'ready' as const,
    _qaLabel: '2 — Ready to Activate / Pronto para ativação',
    _qaDesc: 'eSIM delivered, QR exists (status: pending). Download + guide visible.',
    order: {
      id: 'qa-ready-002',
      plan_name: '[QA] Europe Weekly — Ready',
      data_amount: '5 GB',
      duration_days: 30,
      price: PLAN_PRICES['europe-weekly'],
      created_at: daysAgo(2),
      status: 'completed',
      payment_status: 'succeeded',
      esim_delivered_at: daysAgo(1),
      payment_intent_id: 'pi_qa_ready_002',
      coverage: 'Portugal / Europe',
    },
    qrCode: {
      id: 'qa-qr-ready-002',
      order_id: 'qa-ready-002',
      activation_url: 'LPA:1$sm-v4-059-a-gtm.pr.go-esim.com$QA_READY_ACTIVATION_CODE',
      status: 'pending' as const,
    },
  },
  {
    _qaState: 'active' as const,
    _qaLabel: '3 — Active / Ativo',
    _qaDesc: 'eSIM delivered, QR status: active. Top-up button shown. Guide still accessible.',
    order: {
      id: 'qa-active-003',
      plan_name: '[QA] Europe Weekly — Active',
      data_amount: '5 GB',
      duration_days: 30,
      price: PLAN_PRICES['europe-weekly'],
      created_at: daysAgo(5),
      status: 'completed',
      payment_status: 'succeeded',
      esim_delivered_at: daysAgo(4),
      payment_intent_id: 'pi_qa_active_003',
      coverage: 'Portugal / Europe',
    },
    qrCode: {
      id: 'qa-qr-active-003',
      order_id: 'qa-active-003',
      activation_url: 'LPA:1$sm-v4-059-a-gtm.pr.go-esim.com$QA_ACTIVE_ACTIVATION_CODE',
      status: 'active' as const,
    },
  },
  {
    _qaState: 'expired' as const,
    _qaLabel: '4 — Expired / Expirado',
    _qaDesc: 'delivered_at + duration_days < now. Buy new plan CTA shown. No download.',
    order: {
      id: 'qa-expired-004',
      plan_name: '[QA] Europe Weekly — Expired',
      data_amount: '5 GB',
      duration_days: 7,
      price: PLAN_PRICES['europe-weekly'],
      created_at: daysAgo(20),
      status: 'completed',
      payment_status: 'succeeded',
      esim_delivered_at: daysAgo(15),
      payment_intent_id: 'pi_qa_expired_004',
      coverage: 'Portugal / Europe',
    },
    qrCode: {
      id: 'qa-qr-expired-004',
      order_id: 'qa-expired-004',
      activation_url: 'LPA:1$sm-v4-059-a-gtm.pr.go-esim.com$QA_EXPIRED_ACTIVATION_CODE',
      status: 'active' as const,
    },
  },
  {
    _qaState: 'error' as const,
    _qaLabel: '5 — Error / Needs Support / Precisa de apoio',
    _qaDesc: 'status=failed, payment_status=failed. Support CTA only. No QR, no top-up.',
    order: {
      id: 'qa-error-005',
      plan_name: '[QA] Europe Weekly — Error',
      data_amount: '5 GB',
      duration_days: 7,
      price: PLAN_PRICES['europe-weekly'],
      created_at: daysAgo(1),
      status: 'failed',
      payment_status: 'failed',
      esim_delivered_at: null,
      payment_intent_id: 'pi_qa_error_005',
      coverage: null,
    },
    qrCode: undefined as any,
  },
];

const STATE_COLORS: Record<string, string> = {
  processing: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  ready:      'bg-blue-100 border-blue-300 text-blue-800',
  active:     'bg-green-100 border-green-300 text-green-800',
  expired:    'bg-gray-100 border-gray-300 text-gray-700',
  error:      'bg-red-100 border-red-300 text-red-800',
};

/* ── QA Checklist per state ─────────────────────────────────────────── */
const QA_CHECKLISTS: Record<string, string[]> = {
  processing: [
    '✅ Badge: "Em processamento" (yellow)',
    '✅ State block: yellow "Ativação em preparação" + full description',
    '✅ "Falar com suporte" button visible',
    '❌ No QR code / Download eSIM button',
    '❌ No top-up',
    '❌ No activation guide',
  ],
  ready: [
    '✅ Badge: "Pronto para ativação" (blue)',
    '✅ State block: green "Pronto para ativação" + description',
    '✅ "Ver QR Code" button → opens modal with real QR',
    '✅ "Descarregar eSIM" button visible',
    '✅ "Reenviar email" button visible',
    '✅ Email reassurance line visible',
    '✅ 5-step activation guide visible',
    '❌ No top-up (qrCode.status = pending)',
  ],
  active: [
    '✅ Badge: "Ativo" (green)',
    '✅ State block: green "Ativo" + description',
    '✅ "Ver QR Code" button → opens modal',
    '✅ "Adicionar dados" (top-up) button visible',
    '✅ Email reassurance line visible',
    '✅ Activation guide still accessible',
  ],
  expired: [
    '✅ Badge: "Expirado" (gray)',
    '✅ State block: gray "Expirado" + description',
    '✅ "Comprar novo plano" CTA visible → links to /plans',
    '✅ "Falar com suporte" link visible',
    '❌ No QR download in compact (expired guard)',
  ],
  error: [
    '✅ Badge: "Falhado" (red)',
    '✅ State block: red "Precisa de apoio" + description',
    '✅ "Falar com suporte" button visible → links to /support',
    '❌ No QR code, no download, no top-up, no activation guide',
  ],
};

/* ── Component ─────────────────────────────────────────────────────── */

const DevQAPreview = () => {
  const { t } = useLanguage();

  const [collapsed, setCollapsed] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showChecklists, setShowChecklists] = useState<Set<string>>(new Set());
  const [selectedQRCode, setSelectedQRCode] = useState<{
    activationUrl: string;
    orderId: string;
    planName?: string;
    dataAmount?: string;
    status: 'pending' | 'active' | 'revoked';
    coverage?: string;
  } | null>(null);

  const toggleOrder = (id: string) => {
    const s = new Set(expandedOrders);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedOrders(s);
  };

  const toggleChecklist = (state: string) => {
    const s = new Set(showChecklists);
    s.has(state) ? s.delete(state) : s.add(state);
    setShowChecklists(s);
  };

  const handleDownloadESIM = (order: any) => {
    const mock = MOCK_ORDERS.find(m => m.order.id === order.id);
    if (mock?.qrCode) {
      setSelectedQRCode({
        activationUrl: mock.qrCode.activation_url,
        orderId: order.id,
        planName: order.plan_name,
        dataAmount: order.data_amount,
        status: mock.qrCode.status,
        coverage: order.coverage || undefined,
      });
    }
  };

  const handleResendEmail = (orderId: string) => {
  };

  const handleTopUp = (order: any) => {
  };

  const canDownload = (mock: typeof MOCK_ORDERS[0]) =>
    mock.order.status === 'completed' &&
    mock.order.payment_status === 'succeeded' &&
    !!mock.order.esim_delivered_at &&
    !!mock.qrCode;

  return (
    <div className="mt-10 border-2 border-dashed border-amber-400 rounded-xl overflow-hidden bg-amber-50/60">
      {/* Banner */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-amber-100 border-b border-amber-300 hover:bg-amber-200 transition-colors text-left"
        data-testid="button-qa-preview-toggle"
      >
        <div className="flex items-center gap-2.5">
          <FlaskConical className="h-5 w-5 text-amber-700 shrink-0" />
          <div>
            <span className="font-bold text-amber-900 text-sm tracking-wide">
              🔧 DEV ONLY — QA Activation State Preview
            </span>
            <span className="ml-2 text-xs text-amber-700 font-normal">
              (hidden in production · import.meta.env.DEV)
            </span>
          </div>
        </div>
        {collapsed
          ? <ChevronRight className="h-4 w-4 text-amber-700 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-amber-700 shrink-0" />}
      </button>

      {!collapsed && (
        <div className="p-5 space-y-8">
          {/* Warning */}
          <div className="flex items-start gap-3 bg-amber-100 border border-amber-300 rounded-lg p-4">
            <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Dev QA Preview — Mock Orders</p>
              <p>
                These are <strong>not real orders</strong>. Each card uses carefully constructed mock
                data to drive a specific activation state through the real UI components. Use them
                to visually validate each state without waiting for live provisioning events.
              </p>
              <p className="mt-1.5 text-xs text-amber-700">
                Fields driving state: <code className="bg-amber-200 px-1 py-0.5 rounded">order.status</code>{' · '}
                <code className="bg-amber-200 px-1 py-0.5 rounded">payment_status</code>{' · '}
                <code className="bg-amber-200 px-1 py-0.5 rounded">esim_delivered_at</code>{' · '}
                <code className="bg-amber-200 px-1 py-0.5 rounded">duration_days</code>{' · '}
                <code className="bg-amber-200 px-1 py-0.5 rounded">qrCode</code>{' · '}
                <code className="bg-amber-200 px-1 py-0.5 rounded">qrCode.status</code>
              </p>
            </div>
          </div>

          {/* Mock order cards */}
          {MOCK_ORDERS.map((mock) => (
            <div key={mock.order.id} className="space-y-2">
              {/* State label */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${STATE_COLORS[mock._qaState]}`}>
                  State: <strong>{mock._qaLabel}</strong>
                </div>
                <button
                  onClick={() => toggleChecklist(mock._qaState)}
                  className="text-xs text-amber-700 underline underline-offset-2 hover:text-amber-900"
                  data-testid={`button-qa-checklist-${mock._qaState}`}
                >
                  {showChecklists.has(mock._qaState) ? 'Hide checklist' : 'Show QA checklist'}
                </button>
              </div>

              {/* QA description */}
              <p className="text-xs text-amber-700 font-mono bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
                {mock._qaDesc}
              </p>

              {/* Checklist */}
              {showChecklists.has(mock._qaState) && (
                <div className="bg-white border border-amber-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">QA Checklist</p>
                  <ul className="space-y-1">
                    {QA_CHECKLISTS[mock._qaState].map((item, i) => (
                      <li key={i} className="text-xs text-gray-700 font-mono">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Real OrderCard with mock data */}
              <OrderCard
                order={mock.order}
                qrCode={mock.qrCode}
                canDownload={canDownload(mock)}
                isExpanded={expandedOrders.has(mock.order.id)}
                onToggleExpansion={toggleOrder}
                onDownloadESIM={handleDownloadESIM}
                onResendEmail={handleResendEmail}
                onTopUp={handleTopUp}
              />
            </div>
          ))}
        </div>
      )}

      {/* QR Modal — same one used by real orders */}
      <QRCodeDownloadModal
        isOpen={!!selectedQRCode}
        onClose={() => setSelectedQRCode(null)}
        activationUrl={selectedQRCode?.activationUrl || ''}
        orderId={selectedQRCode?.orderId || ''}
        planName={selectedQRCode?.planName}
        dataAmount={selectedQRCode?.dataAmount}
        status={selectedQRCode?.status || 'pending'}
        coverage={selectedQRCode?.coverage}
      />
    </div>
  );
};

export default DevQAPreview;
