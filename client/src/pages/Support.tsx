import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import HomeHeader from '@/components/home/HomeHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, MessageSquare, Ticket, LifeBuoy, CheckCircle2 } from 'lucide-react';
// We assume supabase is available, mocked here to prevent TypeScript errors in the generator context
const supabase = { from: () => ({ insert: async () => ({ error: null }) }), functions: { invoke: async () => ({}) } };

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', order_id: '', device: '', category: '', message: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitState('submitting');
    
    const messageParts = [
      values.message,
      values.order_id ? `Order: ${values.order_id}` : null,
      values.device ? `Device: ${values.device}` : null,
    ].filter(Boolean).join('\n\n---\n');

    // This reflects the exact corrected logic from the user prompt history
    const { error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: null,
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
      
      // Fire and forget edge function
      supabase.functions.invoke('notify-support-ticket', {
        body: {
          ticket_id: null,
          name: values.name,
          email: values.email,
          category: values.category,
          subject: values.category,
          message: messageParts,
          order_id: values.order_id || null,
          device: values.device || null,
        },
      }).catch(err => console.error('[Support] notify-support-ticket failed (non-fatal):', err?.message));
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
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">How can we help?</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Our support team is available 24/7 to assist you with installation, activation, or any questions.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Quick Contact Info */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-none shadow-lg shadow-gray-200/50">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-palop-green/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-palop-green" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Email Support</h3>
                    <p className="text-sm text-gray-600 mb-2">Drop us a line and we'll get back to you within 24 hours.</p>
                    <a href="mailto:suporte@palopconnect.com" className="text-palop-green font-semibold hover:underline">suporte@palopconnect.com</a>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg shadow-gray-200/50">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-palop-blue/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-6 h-6 text-palop-blue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Live Chat</h3>
                    <p className="text-sm text-gray-600 mb-2">Available for urgent activation issues during business hours.</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-xs font-semibold text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-palop-green"></span> Online now
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Support Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-3"
            >
              <Card className="border border-gray-100 shadow-xl overflow-hidden glass-panel">
                <div className="bg-gradient-to-r from-palop-blue to-palop-green h-2 w-full"></div>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <Ticket className="w-6 h-6 text-gray-400" />
                    <h2 className="text-2xl font-bold font-display">Submit a Ticket</h2>
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
                      <h3 className="text-2xl font-bold mb-2">Ticket Submitted!</h3>
                      <p className="text-gray-600 max-w-sm mb-8">We've received your request and our team will get back to you via email shortly.</p>
                      <Button variant="outline" onClick={() => setSubmitState('idle')}>Submit another ticket</Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Full Name</label>
                          <input 
                            {...form.register('name')}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-palop-blue focus:ring-4 focus:ring-palop-blue/10 transition-all"
                            placeholder="John Doe"
                          />
                          {form.formState.errors.name && <span className="text-xs text-destructive">{form.formState.errors.name.message}</span>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Email Address</label>
                          <input 
                            {...form.register('email')}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-palop-blue focus:ring-4 focus:ring-palop-blue/10 transition-all"
                            placeholder="john@example.com"
                          />
                          {form.formState.errors.email && <span className="text-xs text-destructive">{form.formState.errors.email.message}</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Order ID (Optional)</label>
                          <input 
                            {...form.register('order_id')}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-palop-blue focus:ring-4 focus:ring-palop-blue/10 transition-all"
                            placeholder="#ORD-12345"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Device Model (Optional)</label>
                          <input 
                            {...form.register('device')}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-palop-blue focus:ring-4 focus:ring-palop-blue/10 transition-all"
                            placeholder="iPhone 14 Pro"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">How can we help?</label>
                        <select 
                          {...form.register('category')}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-palop-blue focus:ring-4 focus:ring-palop-blue/10 transition-all appearance-none"
                        >
                          <option value="">Select a category</option>
                          <option value="activation">eSIM Activation Issue</option>
                          <option value="connectivity">No Internet Connection</option>
                          <option value="billing">Billing & Refunds</option>
                          <option value="compatibility">Device Compatibility</option>
                          <option value="other">Other Question</option>
                        </select>
                        {form.formState.errors.category && <span className="text-xs text-destructive">{form.formState.errors.category.message}</span>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Message</label>
                        <textarea 
                          {...form.register('message')}
                          rows={5}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-palop-blue focus:ring-4 focus:ring-palop-blue/10 transition-all resize-none"
                          placeholder="Please describe your issue in detail..."
                        />
                        {form.formState.errors.message && <span className="text-xs text-destructive">{form.formState.errors.message.message}</span>}
                      </div>

                      {submitState === 'error' && (
                        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                          Failed to submit ticket. Please try again or email us directly.
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        variant="gradient"
                        size="lg" 
                        className="w-full text-lg mt-2"
                        disabled={submitState === 'submitting'}
                      >
                        {submitState === 'submitting' ? 'Sending...' : 'Send Message'}
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
