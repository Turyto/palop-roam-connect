import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import HomeHeader from '@/components/home/HomeHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Ticket, LifeBuoy, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  order_id: z.string().optional(),
  device: z.string().optional(),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormValues = z.infer<typeof formSchema>;

export default function Support() {
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: user?.email ?? '',
      order_id: '',
      device: '',
      category: '',
      message: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitState('submitting');

    const messageParts = [
      values.message,
      values.order_id ? `Order: ${values.order_id}` : null,
      values.device ? `Device: ${values.device}` : null,
    ].filter(Boolean).join('\n\n---\n');

    const { error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user?.id ?? null,
        name: values.name,
        email: values.email,
        subject: values.category,
        category: values.category,
        message: messageParts,
        status: 'open',
        priority: 'medium',
      });

    if (error) {
      console.error('[Support] insert error:', error);
      setSubmitState('error');
    } else {
      setSubmitState('success');
      form.reset();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <HomeHeader />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">

          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-palop-blue/10 text-palop-blue mb-6">
              <LifeBuoy className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Como podemos ajudar?</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A nossa equipa está disponível para ajudar com instalação, ativação ou qualquer questão sobre o teu eSIM.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Contact info sidebar */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-none shadow-lg shadow-gray-200/50">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-palop-green/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-palop-green" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Email</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Envia-nos um email e respondemos em até 24 horas.
                    </p>
                    <a
                      href="mailto:suporte@palopconnect.com"
                      className="text-palop-green font-semibold hover:underline"
                    >
                      suporte@palopconnect.com
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg shadow-gray-200/50">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">Problemas comuns</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-palop-green font-bold mt-0.5">·</span>
                      eSIM não aparece nas definições do dispositivo
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-palop-green font-bold mt-0.5">·</span>
                      Sem ligação à internet após ativação
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-palop-green font-bold mt-0.5">·</span>
                      Código QR não funciona
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-palop-green font-bold mt-0.5">·</span>
                      Dúvidas sobre compatibilidade do dispositivo
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Support form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-3"
            >
              <Card className="border border-gray-100 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-palop-blue to-palop-green h-2 w-full" />
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <Ticket className="w-6 h-6 text-gray-400" />
                    <h2 className="text-2xl font-bold font-display">Abrir ticket de suporte</h2>
                  </div>

                  {submitState === 'success' ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 flex flex-col items-center text-center"
                    >
                      <div className="w-20 h-20 bg-palop-green/10 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10 text-palop-green" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Ticket enviado!</h3>
                      <p className="text-gray-600 max-w-sm mb-8">
                        Recebemos o teu pedido. A nossa equipa responderá por email em breve.
                      </p>
                      <Button variant="outline" onClick={() => setSubmitState('idle')}>
                        Enviar outro ticket
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Nome completo</label>
                          <input
                            {...form.register('name')}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-palop-blue focus:ring-4 focus:ring-palop-blue/10 transition-all"
                            placeholder="João Silva"
                            data-testid="input-support-name"
                          />
                          {form.formState.errors.name && (
                            <span className="text-xs text-destructive">{form.formState.errors.name.message}</span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Email</label>
                          <input
                            {...form.register('email')}
                            type="email"
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-palop-blue focus:ring-4 focus:ring-palop-blue/10 transition-all"
                            placeholder="joao@email.com"
                            data-testid="input-support-email"
                          />
                          {form.formState.errors.email && (
                            <span className="text-xs text-destructive">{form.formState.errors.email.message}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">
                            ID da encomenda <span className="font-normal text-gray-400">(opcional)</span>
                          </label>
                          <input
                            {...form.register('order_id')}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-palop-blue focus:ring-4 focus:ring-palop-blue/10 transition-all"
                            placeholder="#ORD-12345"
                            data-testid="input-support-order-id"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Dispositivo <span className="font-normal text-gray-400">(opcional)</span>
                          </label>
                          <input
                            {...form.register('device')}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-palop-blue focus:ring-4 focus:ring-palop-blue/10 transition-all"
                            placeholder="iPhone 14 Pro"
                            data-testid="input-support-device"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Como podemos ajudar?</label>
                        <select
                          {...form.register('category')}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-palop-blue focus:ring-4 focus:ring-palop-blue/10 transition-all appearance-none"
                          data-testid="select-support-category"
                        >
                          <option value="">Seleciona uma categoria</option>
                          <option value="activation">Problema de ativação do eSIM</option>
                          <option value="connectivity">Sem ligação à internet</option>
                          <option value="billing">Faturação e reembolsos</option>
                          <option value="compatibility">Compatibilidade do dispositivo</option>
                          <option value="other">Outra questão</option>
                        </select>
                        {form.formState.errors.category && (
                          <span className="text-xs text-destructive">{form.formState.errors.category.message}</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Mensagem</label>
                        <textarea
                          {...form.register('message')}
                          rows={5}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-palop-blue focus:ring-4 focus:ring-palop-blue/10 transition-all resize-none"
                          placeholder="Descreve o teu problema em detalhe..."
                          data-testid="textarea-support-message"
                        />
                        {form.formState.errors.message && (
                          <span className="text-xs text-destructive">{form.formState.errors.message.message}</span>
                        )}
                      </div>

                      {submitState === 'error' && (
                        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                          Não foi possível enviar o ticket. Tenta novamente ou envia-nos um email diretamente.
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-palop-green hover:bg-palop-green/90 text-white text-lg mt-2 py-6"
                        disabled={submitState === 'submitting'}
                        data-testid="button-support-submit"
                      >
                        {submitState === 'submitting' ? 'A enviar...' : 'Enviar mensagem'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
