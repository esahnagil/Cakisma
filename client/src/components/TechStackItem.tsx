interface TechStackItemProps {
  text: string;
}

export default function TechStackItem({ text }: TechStackItemProps) {
  return (
    <div className="flex items-center space-x-3 mb-2">
      <div className="w-2 h-2 rounded-full bg-primary"></div>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}
