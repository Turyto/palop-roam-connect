import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Wifi, Smartphone, ExternalLink } from 'lucide-react';

interface SupportCardLabels {
  title: string;
  topicInstall: string;
  topicConnection: string;
  topicCompat: string;
  contact: string;
  viewCompatibility: string;
}

interface SupportCardProps {
  labels: SupportCardLabels;
}

const SupportCard = ({ labels: l }: SupportCardProps) => {
  const topics = [
    { icon: Smartphone, label: l.topicInstall },
    { icon: Wifi,       label: l.topicConnection },
    { icon: LifeBuoy,   label: l.topicCompat },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" data-testid="card-support">
      <h2 className="font-semibold text-gray-900 text-base mb-4">{l.title}</h2>

      <ul className="space-y-2 mb-5">
        {topics.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5 text-sm text-gray-600">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Icon className="h-3.5 w-3.5 text-gray-500" />
            </div>
            {label}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2">
        <Button
          asChild
          className="w-full bg-palop-green hover:bg-palop-green/90 text-white"
          data-testid="button-contact-support"
        >
          <Link to="/support">{l.contact}</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
          data-testid="button-view-compatibility"
        >
          <Link to="/compatibility">
            <ExternalLink className="h-4 w-4 mr-1.5" />
            {l.viewCompatibility}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default SupportCard;
