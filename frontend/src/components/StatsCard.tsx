interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatsCard({ label, value, icon, color = 'purple' }: StatsCardProps) {
  const colorClasses = {
    purple: 'bg-purple-500',
    teal: 'bg-teal-500',
    coral: 'bg-orange-500',
  };

  return (
    <div className="bg-white rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      {icon && (
        <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.purple} rounded-full flex items-center justify-center text-white`}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
