import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function Pricing() {
  const navigate = useNavigate();
  const superProfileUrl = "https://superprofile.bio/vp/691cb5ad29cccd001342a60b";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10 h-8 w-8 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AICOACHLY
              </h1>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(superProfileUrl, '_blank')}
              className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Open in New Tab</span>
              <span className="sm:hidden">Open</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Embedded SuperProfile Payment Page */}
      <div className="flex-1 w-full">
        <iframe
          src={superProfileUrl}
          title="AICOACHLY Payment"
          className="w-full h-full min-h-[calc(100vh-57px)] sm:min-h-[calc(100vh-73px)] border-0"
          allow="payment"
          loading="lazy"
        />
      </div>
    </div>
  );
}
