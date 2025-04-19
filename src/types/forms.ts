
import { z } from "zod";

export const teamFormSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  short_name: z.string().min(1, "Short name is required"),
  established_year: z.coerce.number().optional(),
  description: z.string().optional(),
  home_venue: z.string().optional(),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;
