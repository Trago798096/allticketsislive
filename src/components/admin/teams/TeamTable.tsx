
import { Pencil, Trash2 } from "lucide-react";
import { Team } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TeamTableProps {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
}

export function TeamTable({ teams, onEdit, onDelete }: TeamTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Short Name</TableHead>
            <TableHead className="hidden md:table-cell">Established</TableHead>
            <TableHead className="hidden md:table-cell">Home Venue</TableHead>
            <TableHead className="w-[150px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>
                <img src={team.logo} alt={team.name} className="h-10 w-10 object-contain" />
              </TableCell>
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell>{team.short_name}</TableCell>
              <TableCell className="hidden md:table-cell">{team.established_year || "-"}</TableCell>
              <TableCell className="hidden md:table-cell">{team.home_venue || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(team)}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete(team)}
                    title="Delete"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
