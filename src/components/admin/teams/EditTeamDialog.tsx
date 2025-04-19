
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Team } from "@/types/database";
import { TeamFormValues, teamFormSchema } from "@/types/forms";
import { TeamForm } from "./TeamForm";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditTeamDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTeam: Team | null;
  onSubmit: (data: TeamFormValues, logoFile: File | null) => Promise<void>;
  isSubmitting: boolean;
}

export function EditTeamDialog({
  isOpen,
  onOpenChange,
  selectedTeam,
  onSubmit,
  isSubmitting,
}: EditTeamDialogProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const formId = "edit-team-form";

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      short_name: "",
      established_year: undefined,
      description: "",
      home_venue: "",
    },
  });

  // Reset form when selectedTeam changes
  useEffect(() => {
    if (selectedTeam) {
      form.reset({
        name: selectedTeam.name,
        short_name: selectedTeam.short_name,
        established_year: selectedTeam.established_year,
        description: selectedTeam.description || "",
        home_venue: selectedTeam.home_venue || "",
      });
      setLogoPreview(selectedTeam.logo);
    }
  }, [selectedTeam, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Logo file is too large", { description: "Maximum file size is 5MB" });
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", { description: "Please upload an image file" });
      return;
    }
    
    setLogoFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (data: TeamFormValues) => {
    try {
      await onSubmit(data, logoFile);
      // Show success message
      toast.success("Team updated successfully");
      // Close dialog
      onOpenChange(false);
      setLogoFile(null);
    } catch (error) {
      console.error("Error updating team:", error);
      toast.error("Failed to update team", { 
        description: error instanceof Error ? error.message : "Please try again later"
      });
    }
  };

  const handleCancel = () => {
    form.reset();
    setLogoFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle id="edit-team-dialog-title">Edit Team</DialogTitle>
          <DialogDescription id="edit-team-dialog-description">
            Edit information for {selectedTeam?.name}
          </DialogDescription>
        </DialogHeader>
        
        <TeamForm
          formId={formId}
          form={form}
          onSubmit={handleSubmit}
          logoFile={logoFile}
          logoPreview={logoPreview}
          onLogoChange={handleLogoChange}
          isSubmitting={isSubmitting}
          buttonText="Update Team"
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
