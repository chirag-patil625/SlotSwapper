interface TaskItemProps {
  title: string;
  description: string;
  color: 'purple' | 'teal' | 'coral' | 'blue';
  isCompleted?: boolean;
  onToggle?: () => void;
}

const borderColors = {
  purple: 'border-l-purple-500',
  teal: 'border-l-teal-500',
  coral: 'border-l-orange-500',
  blue: 'border-l-blue-500',
};

export default function TaskItem({ title, description, color, isCompleted = false, onToggle }: TaskItemProps) {
  return (
    <div className={`flex items-center gap-4 p-4 bg-white border-l-4 ${borderColors[color]} rounded-lg hover:shadow-md transition-shadow`}>
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={onToggle}
        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
      />
      <div className="flex-1">
        <h4 className={`font-medium text-gray-800 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
          {title}
        </h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}
