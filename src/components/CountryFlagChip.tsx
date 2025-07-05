
interface CountryFlagChipProps {
  name: string;
  flag: string;
  size?: 'sm' | 'md';
}

const CountryFlagChip = ({ name, flag, size = 'sm' }: CountryFlagChipProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2'
  };

  return (
    <span className={`inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full ${sizeClasses[size]} font-medium text-gray-700`}>
      <span className="text-base">{flag}</span>
      <span className="whitespace-nowrap">{name}</span>
    </span>
  );
};

export default CountryFlagChip;
