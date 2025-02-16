import { z } from "zod";
import {
    addLinksFormSchema,
    deleteLinkSchema,
    reorderLinksSchema,
    updateLinksFormSchema,
} from "../schemas/link-schema";
import {
    createProfileSchema,
    updateProfileSchema,
} from "../schemas/profile-schema";

export type AddLinkPayload = z.infer<typeof addLinksFormSchema>;
export type UpdateLinkPayload = z.infer<typeof updateLinksFormSchema>;
export type ReorderLinksPayload = z.infer<typeof reorderLinksSchema>;
export type DeleteLinkPayload = z.infer<typeof deleteLinkSchema>;
export type CreateProfilePayload = z.infer<typeof createProfileSchema>;
export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;
