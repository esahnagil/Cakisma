import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import TechStackItem from "./TechStackItem";

export default function MainContent() {
  const techStackItems = [
    "React.js + Tailwind CSS",
    "Express.js (Node.js)",
    "PostgreSQL + Drizzle ORM",
    "WebSocket + React Query"
  ];

  const handleStart = () => {
    alert('Getting started with React and Express!');
  };
  
  const handleDocs = () => {
    alert('Viewing documentation');
  };

  return (
    <main className="flex-grow flex items-center justify-center p-6">
      <Card className="max-w-md w-full overflow-hidden">
        {/* Card Header */}
        <CardHeader className="bg-primary px-6 py-4">
          <h2 className="text-xl font-semibold text-white">React Application</h2>
        </CardHeader>
        
        {/* Card Content */}
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">Hello World</h1>
            <p className="mt-2 text-gray-600">This is a simple React application using Tailwind CSS with shadcn/ui components</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Tech Stack</h3>
            {techStackItems.map((item, index) => (
              <TechStackItem key={index} text={item} />
            ))}
          </div>
          
          {/* Button Group */}
          <div className="flex space-x-3">
            <Button 
              className="flex-1" 
              onClick={handleStart}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleDocs}
            >
              Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
