import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import HomeHeader from '@/components/home/HomeHeader';
import HomeFooter from '@/components/home/HomeFooter';
import { useLanguage } from '@/contexts/language';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Smartphone, QrCode, Package, KeyRound, CreditCard, Zap,
  Mail, ArrowRight, CheckCircle2, ChevronRight,
} from 'lucide-react';

const QUICK_HELP_ICONS = [Smartphone, QrCode, Package, KeyRound, CreditCard, Zap];
const CATEGORY_KEYS = [
  'compatibility', 'activation', 'no_esim', 'orders_access', 'payment', 'plan_help',
] as const;

type CategoryKey = typeof CATEGORY_KEYS[number] | 'qr_code' | 'other' | '';

const SupportPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const sp = t.supportPage;
  const formRef = useRef<HTMLDivElement>(null);
  const [presetCategory, setPresetCategory] = useState<string>('');
  const [submitState, setSubmitState] = useState<'success' | 'error' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [searchParams] = useSearchParams();
  const topicFromUrl = searchParams.get('topic') ?? '';

  const formSchema = z.object({
    name: z.string().min(1, sp.form.required),
    email: z.string().min(1, sp.form.required).email(sp.form.validEmail),
    order_id: z.string().optional(),
    device: z.string().optional(),
    category: z.string().min(1, sp.form.selectCategory),
    message: z.string().min(20, sp.form.minMessage),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      order_id: '',
      device: '',
      category: topicFromUrl,
      message: '',
    },
  });

  useEffect(() => {
    if (user) {
      const name = (user.user_metadata?.full_name as string | undefined) ?? '';
      const email = user.email ?? '';
      if (name) form.setValue('name', name);
      if (email) form.setValue('email', email);
    }
  }, [user]);

  useEffect(() => {
    if (topicFromUrl) {
      form.setValue('category', topicFromUrl);
    }
  }, [topicFromUrl]);

  useEffect(() => {
    if (presetCategory) {
      form.setValue('category', presetCategory);
    }
  }, [presetCategory]);

  const categoryLabelMap: Record<string, string> = {
    compatibility: sp.form.catCompatibility,
    no_esim: sp.form.catNoEsim,
    qr_code: sp.form.catQrCode,
    activation: sp.form.catActivation,
    orders_access: sp.form.catOrdersAccess,
    payment: sp.form.catPayment,
    plan_help: sp.form.catPlanHelp,
    other: sp.form.catOther,
  };

  const cardCategoryKeys = ['compatibility', 'activation', 'no_esim', 'orders_access', 'payment', 'plan_help'];

  const scrollToForm = (category?: string) => {
    if (category) setPresetCategory(category);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setSubmitState(null);

    const messageParts = [
      values.message,
      values.order_id ? `Order: ${values.order_id}` : null,
      values.device ? `Device: ${values.device}` : null,
    ].filter(Boolean).join('\n\n---\n');

    const subject = categoryLabelMap[values.category] ?? values.category;

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user?.id ?? null,
        name: values.name,
        email: values.email,
        subject,
        category: values.category,
        message: messageParts,
        status: 'open',
        priority: 'medium',
      })
      .select('id')
      .single();

    setSubmitting(false);
    if (error) {
      setSubmitState('error');
    } else {
      setSubmitState('success');
      form.reset({ name: '', email: '', order_id: '', device: '', category: '', message: '' });

      // Fire-and-forget internal notification — errors do not affect the user experience
      supabase.functions.invoke('notify-support-ticket', {
        body: {
          ticket_id: ticket?.id ?? null,
          name: values.name,
          email: values.email,
          category: values.category,
          subject,
          message: messageParts,
          order_id: values.order_id || null,
          device: values.device || null,
        },
      }).catch((err: any) => {
        console.error('[Support] notify-support-ticket failed (non-fatal):', err?.message);
      });
    }
  };

  const faqGroups = [
    {
      label: sp.faq.group1,
      items: [
        { q: sp.faq.q1_1, a: sp.faq.a1_1 },
        { q: sp.faq.q1_2, a: sp.faq.a1_2 },
      ],
    },
    {
      label: sp.faq.group2,
      items: [
        { q: sp.faq.q2_1, a: sp.faq.a2_1 },
        { q: sp.faq.q2_2, a: sp.faq.a2_2 },
      ],
    },
    {
      label: sp.faq.group3,
      items: [
        { q: sp.faq.q3_1, a: sp.faq.a3_1 },
        { q: sp.faq.q3_2, a: sp.faq.a3_2 },
      ],
    },
    {
      label: sp.faq.group4,
      items: [
        { q: sp.faq.q4_1, a: sp.faq.a4_1 },
        { q: sp.faq.q4_2, a: sp.faq.a4_2 },
      ],
    },
    {
      label: sp.faq.group5,
      items: [
        { q: sp.faq.q5_1, a: sp.faq.a5_1 },
        { q: sp.faq.q5_2, a: sp.faq.a5_2 },
      ],
    },
    {
      label: sp.faq.group6,
      items: [
        { q: sp.faq.q6_1, a: sp.faq.a6_1 },
      ],
    },
  ];

  const quickHelpCards = [
    { title: sp.quickHelp.card1Title, desc: sp.quickHelp.card1Desc, key: 'compatibility' },
    { title: sp.quickHelp.card2Title, desc: sp.quickHelp.card2Desc, key: 'activation' },
    { title: sp.quickHelp.card3Title, desc: sp.quickHelp.card3Desc, key: 'no_esim' },
    { title: sp.quickHelp.card4Title, desc: sp.quickHelp.card4Desc, key: 'orders_access' },
    { title: sp.quickHelp.card5Title, desc: sp.quickHelp.card5Desc, key: 'payment' },
    { title: sp.quickHelp.card6Title, desc: sp.quickHelp.card6Desc, key: 'plan_help' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HomeHeader />

      <main className="flex-grow">

        {/* ── SECTION A: Hero ─────────────────────────────────── */}
        <section className="bg-gradient-to-br from-palop-green/10 via-white to-palop-blue/5 pt-16 pb-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-palop-green mb-4">
              {sp.hero.eyebrow}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {sp.hero.title}
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              {sp.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 bg-palop-green text-white px-6 py-3 rounded-lg font-medium hover:bg-palop-green/90 transition-colors"
                data-testid="button-support-faq"
              >
                {sp.hero.primaryCta}
                <ChevronRight className="h-4 w-4" />
              </a>
              <button
                onClick={() => scrollToForm()}
                className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                data-testid="button-support-contact"
              >
                {sp.hero.secondaryCta}
                <Mail className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ── SECTION B: Quick Help ───────────────────────────── */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{sp.quickHelp.title}</h2>
              <p className="text-gray-500">{sp.quickHelp.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickHelpCards.map((card, i) => {
                const Icon = QUICK_HELP_ICONS[i];
                return (
                  <Card
                    key={card.key}
                    className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    data-testid={`card-help-${card.key}`}
                  >
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="w-10 h-10 rounded-lg bg-palop-green/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-palop-green" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{card.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
                      </div>
                      <button
                        onClick={() => scrollToForm(card.key)}
                        className="mt-auto inline-flex items-center gap-1.5 text-palop-green text-xs font-medium hover:underline"
                        data-testid={`button-quickhelp-${card.key}`}
                      >
                        {sp.quickHelp.askQuestion}
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION C: FAQ ──────────────────────────────────── */}
        <section id="faq" className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{sp.faq.title}</h2>
              <p className="text-gray-500">{sp.faq.subtitle}</p>
            </div>

            <div className="space-y-6">
              {faqGroups.map((group, gi) => (
                <div key={gi}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-palop-green mb-2 px-1">
                    {group.label}
                  </h3>
                  <Accordion type="multiple" className="space-y-2">
                    {group.items.map((item, qi) => (
                      <AccordionItem
                        key={qi}
                        value={`g${gi}-q${qi}`}
                        className="bg-white border border-gray-100 rounded-lg px-4 data-[state=open]:border-palop-green/30"
                      >
                        <AccordionTrigger className="text-sm font-medium text-gray-800 hover:no-underline py-4 text-left">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-gray-600 pb-4 leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-gray-500 text-sm mb-3">{sp.helpNote.text}</p>
              <button
                onClick={() => scrollToForm()}
                className="inline-flex items-center gap-2 text-palop-green font-medium text-sm hover:underline"
                data-testid="button-faq-to-form"
              >
                {sp.hero.secondaryCta}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ── SECTION D: Contact Form ─────────────────────────── */}
        <section ref={formRef} id="contact-form" className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{sp.form.title}</h2>
              <p className="text-gray-500">{sp.form.subtitle}</p>
            </div>

            {submitState === 'success' ? (
              <div
                className="flex flex-col items-center gap-4 py-12 px-6 rounded-xl border border-palop-green/20 bg-palop-green/5 text-center"
                data-testid="support-form-success"
              >
                <CheckCircle2 className="h-10 w-10 text-palop-green" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{sp.form.successTitle}</h3>
                  <p className="text-gray-600 text-sm">{sp.form.successDesc}</p>
                </div>
                <button
                  onClick={() => setSubmitState(null)}
                  className="text-palop-green text-sm font-medium hover:underline mt-2"
                >
                  {sp.hero.secondaryCta}
                </button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                  data-testid="support-form"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{sp.form.labelName}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={sp.form.placeholderName}
                              data-testid="input-support-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{sp.form.labelEmail}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={sp.form.placeholderEmail}
                              data-testid="input-support-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="order_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{sp.form.labelOrderId}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={sp.form.placeholderOrderId}
                              data-testid="input-support-order"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="device"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{sp.form.labelDevice}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={sp.form.placeholderDevice}
                              data-testid="input-support-device"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{sp.form.labelCategory}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-support-category">
                              <SelectValue placeholder={sp.form.selectCategory} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="compatibility">{sp.form.catCompatibility}</SelectItem>
                            <SelectItem value="no_esim">{sp.form.catNoEsim}</SelectItem>
                            <SelectItem value="qr_code">{sp.form.catQrCode}</SelectItem>
                            <SelectItem value="activation">{sp.form.catActivation}</SelectItem>
                            <SelectItem value="orders_access">{sp.form.catOrdersAccess}</SelectItem>
                            <SelectItem value="payment">{sp.form.catPayment}</SelectItem>
                            <SelectItem value="plan_help">{sp.form.catPlanHelp}</SelectItem>
                            <SelectItem value="other">{sp.form.catOther}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{sp.form.labelMessage}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={sp.form.placeholderMessage}
                            rows={5}
                            data-testid="textarea-support-message"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {submitState === 'error' && (
                    <p className="text-sm text-red-600 text-center" data-testid="support-form-error">
                      {sp.form.errorDesc}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-palop-green hover:bg-palop-green/90 text-white"
                    disabled={submitting}
                    data-testid="button-support-submit"
                  >
                    {submitting ? sp.form.submitting : sp.form.submit}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </section>

        {/* ── SECTION E: Help Note ─────────────────────────────── */}
        <section className="py-10 px-4 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto max-w-2xl text-center">
            <p className="text-sm text-gray-500 leading-relaxed">{sp.helpNote.text}</p>
          </div>
        </section>

      </main>

      <HomeFooter />
    </div>
  );
};

export default SupportPage;
