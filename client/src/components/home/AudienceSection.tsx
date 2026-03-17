import { useLanguage } from '@/contexts/language';

const AudienceSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-palop-green/5 border-y border-palop-green/10">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
            {t.audience.title}
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            {t.audience.body}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
