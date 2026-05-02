
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useLanguage } from "@/contexts/language";

// Schema factory — call with translated validation messages so errors render
// in the user's language. The exported static schema is kept for type inference.
export const makeCheckoutFormSchema = (msgs: { emailInvalid: string; termsRequired: string }) =>
  z.object({
    email: z.string().email({ message: msgs.emailInvalid }),
    termsAccepted: z.boolean().refine(val => val === true, {
      message: msgs.termsRequired,
    }),
  });

// Static schema for type inference — messages in EN, only used as a type reference.
export const checkoutFormSchema = makeCheckoutFormSchema({
  emailInvalid: 'Invalid email address',
  termsRequired: 'You must accept the terms and conditions',
});

interface ContactFormProps {
  form: UseFormReturn<z.infer<typeof checkoutFormSchema>>;
}

const ContactForm = ({ form }: ContactFormProps) => {
  const { t } = useLanguage();
  const c = t.checkout;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b">
        <h2 className="font-semibold text-lg text-gray-900">{c.contactTitle}</h2>
      </div>
      <div className="p-6 space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{c.emailLabel}</FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" {...field} />
              </FormControl>
              <p className="text-xs text-gray-500 mt-1">{c.emailHelper}</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">
                  {c.termsLabel}
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ContactForm;
