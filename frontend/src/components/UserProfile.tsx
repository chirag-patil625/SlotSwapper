interface UserProfileProps {
  name: string;
  email: string;
  avatar?: string;
  status?: string;
}

export default function UserProfile({ name, email, avatar, status = "Online" }: UserProfileProps) {
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm">
      <div className="relative">
        <img
          src={avatar || `https://ui-avatars.com/api/?name=${name}&background=random`}
          alt={name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-800">{name}</h3>
      <p className="text-sm text-gray-500">{email}</p>
      <span className="mt-2 text-xs text-green-600 flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        {status}
      </span>
    </div>
  );
}
