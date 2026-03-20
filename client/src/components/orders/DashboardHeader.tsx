import { User } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  welcomeText: string | null;
}

const DashboardHeader = ({ title, welcomeText }: DashboardHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 bg-palop-green/10 rounded-full flex items-center justify-center shrink-0">
          <User className="h-5 w-5 text-palop-green" />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
          {title}
        </h1>
      </div>
      {welcomeText && (
        <p className="text-gray-500 text-sm ml-12" data-testid="text-dashboard-welcome">
          {welcomeText}
        </p>
      )}
    </div>
  );
};

export default DashboardHeader;
