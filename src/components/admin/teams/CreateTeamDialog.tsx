
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TeamFormValues, teamFormSchema } from "@/types/forms";
import { TeamForm } from "./TeamForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateTeamDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TeamFormValues, logoFile: File) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateTeamDialog({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  isSubmitting 
}: CreateTeamDialogProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const formId = "create-team-form";

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
    if (!logoFile) {
      toast.error("Logo is required", { description: "Please upload a team logo" });
      return;
    }

    try {
      await onSubmit(data, logoFile);
      
      // Reset form on successful submission
      form.reset();
      setLogoFile(null);
      setLogoPreview(null);
      
      // Show success toast and close dialog
      toast.success("Team created successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team", { 
        description: error instanceof Error ? error.message : "Please try again later"
      });
    }
  };

  const handleCancel = () => {
    form.reset();
    setLogoFile(null);
    setLogoPreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-ipl-blue hover:bg-ipl-blue/90" aria-label="Add new team">
          <Plus className="mr-2 h-4 w-4" />
          Add Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle id="create-team-dialog-title">Add New Team</DialogTitle>
          <DialogDescription id="create-team-dialog-description">
            Enter the details for the new IPL team
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
          buttonText="Create Team"
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
