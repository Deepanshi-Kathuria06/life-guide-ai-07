import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Briefcase, Brain, DollarSign, Heart, MessageSquare } from "lucide-react";

interface CoachCardProps {
  type: "fitness" | "career" | "mindfulness" | "finance" | "relationship";
  name: string;
  description: string;
}

const iconMap = {
  fitness: Dumbbell,
  career: Briefcase,
  mindfulness: Brain,
  finance: DollarSign,
  relationship: Heart,
};

const emojiMap = {
  fitness: "💪",
  career: "💼",
  mindfulness: "🧠",
  finance: "💰",
  relationship: "❤️",
};

export default function CoachCard({ type, name, description }: CoachCardProps) {
  const navigate = useNavigate();
  const Icon = iconMap[type];
  const emoji = emojiMap[type];

  return (
    <Card 
      className="relative p-5 sm:p-6 md:p-8 glass-morphism hover-lift transition-all duration-300 border-2 group overflow-hidden flex flex-col"
      style={{
        borderImage: `linear-gradient(135deg, hsl(var(--coach-${type})), transparent) 1`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 flex flex-col flex-grow">
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 animate-float">{emoji}</div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3" style={{ color: `hsl(var(--coach-${type}))` }}>
          {name}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 flex-grow line-clamp-2 sm:line-clamp-none">{description}</p>
        <Button
          onClick={() => navigate(`/chat/${type}`)}
          className="w-full text-sm sm:text-base"
          variant="outline"
          style={{ 
            borderColor: `hsl(var(--coach-${type}))`,
            color: `hsl(var(--coach-${type}))`
          }}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat Now
        </Button>
      </div>
    </Card>
  );
}
