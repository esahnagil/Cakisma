import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">
                R
              </div>
              <span className="ml-2 text-primary-foreground font-medium">React + Express</span>
            </div>
          </div>
          <div className="flex items-center">
            <Button 
              variant="outline" 
              className="text-primary border-primary/30 hover:bg-gray-50"
              onClick={() => window.open("https://github.com", "_blank")}
            >
              GitHub
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
