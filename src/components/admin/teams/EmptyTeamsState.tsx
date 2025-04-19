
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyTeamsStateProps {
  onAddTeam: () => void;
}

export function EmptyTeamsState({ onAddTeam }: EmptyTeamsStateProps) {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <h3 className="text-lg font-medium mb-2">No teams found</h3>
      <p className="text-gray-500 mb-4">Get started by adding your first IPL team</p>
      <Button onClick={onAddTeam}>
        <Plus className="mr-2 h-4 w-4" />
        Add Team
      </Button>
    </div>
  );
}
