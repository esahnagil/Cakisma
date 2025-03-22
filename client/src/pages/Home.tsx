import Navbar from "@/components/Navbar";
import MainContent from "@/components/MainContent";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <MainContent />
      <Footer />
    </div>
  );
}
