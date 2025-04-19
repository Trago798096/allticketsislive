
import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { TeamFormValues } from "@/types/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";

interface TeamFormProps {
  form: UseFormReturn<TeamFormValues>;
  onSubmit: (data: TeamFormValues) => Promise<void>;
  logoFile: File | null;
  logoPreview: string | null;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  buttonText: string;
  onCancel: () => void;
  formId?: string;
}

export function TeamForm({
  form,
  onSubmit,
  logoFile,
  logoPreview,
  onLogoChange,
  isSubmitting,
  buttonText,
  onCancel,
  formId = "team-form"
}: TeamFormProps) {
  return (
    <Form {...form}>
      <form 
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-4 py-4"
        aria-label="Team form"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="team-name">Team Name</FormLabel>
              <FormControl>
                <Input 
                  id="team-name" 
                  name="name"
                  placeholder="Mumbai Indians" 
                  autoComplete="organization"
                  aria-required="true"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="short_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="team-short-name">Short Name</FormLabel>
              <FormControl>
                <Input 
                  id="team-short-name" 
                  name="short_name"
                  placeholder="MI" 
                  maxLength={5}
                  aria-required="true"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="established_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="team-established-year">Established Year</FormLabel>
                <FormControl>
                  <Input 
                    id="team-established-year"
                    name="established_year"
                    placeholder="2008" 
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    autoComplete="off"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="home_venue"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="team-home-venue">Home Venue</FormLabel>
                <FormControl>
                  <Input 
                    id="team-home-venue" 
                    name="home_venue"
                    placeholder="Wankhede Stadium"
                    autoComplete="address-level2" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="team-description">Description</FormLabel>
              <FormControl>
                <Textarea 
                  id="team-description" 
                  name="description"
                  placeholder="Brief description of the team..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel htmlFor="team-logo">Team Logo</FormLabel>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input 
                id="team-logo"
                name="logo"
                type="file" 
                accept="image/*" 
                onChange={onLogoChange}
                aria-describedby="logo-help"
              />
              <p id="logo-help" className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
            </div>
            <div className="flex justify-center items-center border rounded-md p-2">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Team Logo Preview" 
                  className="max-h-20 object-contain" 
                />
              ) : (
                <span className="text-sm text-gray-400">Logo Preview</span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            id="cancel-team-form"
            aria-label="Cancel form"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            id="submit-team-form"
            aria-busy={isSubmitting}
            aria-label={buttonText}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {buttonText === "Create Team" ? "Creating..." : "Updating..."}
              </>
            ) : (
              buttonText
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
