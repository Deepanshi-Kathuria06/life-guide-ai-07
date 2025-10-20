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

export default function CoachCard({ type, name, description }: CoachCardProps) {
  const navigate = useNavigate();
  const Icon = iconMap[type];

  return (
    <Card className="p-6 hover:shadow-lg transition-all border-2 hover:border-primary/50 flex flex-col">
      <div className={`w-14 h-14 rounded-xl bg-coach-${type}/10 flex items-center justify-center mb-4`}>
        <Icon className={`h-7 w-7 text-coach-${type}`} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <p className="text-muted-foreground mb-6 flex-grow">{description}</p>
      <Button
        onClick={() => navigate(`/chat/${type}`)}
        className="w-full"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Start Chat
      </Button>
    </Card>
  );
}
