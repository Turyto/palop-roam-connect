
interface ComparisonMetricsBarProps {
  totalCountries: number;
  mostPopularPlan?: {
    clusterName: string;
  };
}

const ComparisonMetricsBar = ({ totalCountries, mostPopularPlan }: ComparisonMetricsBarProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 bg-gray-50 rounded-lg py-4 px-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏳️</span>
        <span>Up to <strong>{totalCountries}</strong> countries covered</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        <span>Most Popular: <strong>{mostPopularPlan?.clusterName}</strong></span>
      </div>
    </div>
  );
};

export default ComparisonMetricsBar;
