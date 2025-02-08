import { z } from "zod";

// Define valid platforms as a constant
const validPlatforms = [
    "GitHub",
    "Frontend Mentor",
    "Twitter",
    "LinkedIn",
    "YouTube",
    "Facebook",
    "Twitch",
    "Dev.to",
    "Codewars",
    "freeCodeCamp",
    "GitLab",
    "Hashnode",
    "Stack Overflow",
] as const;

// Custom error message for platform validation
const platformErrorMessage = `Platform must be one of: ${validPlatforms.join(
    ", "
)}.`;

// Create a function for platform schema to reuse across different validations
const platformSchema = z.enum(validPlatforms, {
    errorMap: () => ({ message: platformErrorMessage }),
});

// Create a base schema for links
const baseLinkSchema = (isUpdate: boolean) =>
    z.object({
        ...(isUpdate && { id: z.string({ message: "Id is required" }) }), // Include id for update
        platform: platformSchema,
        url: z.string().url({
            message: "Please provide a valid URL.",
        }),
    });

// Define the schema for addLinks
const addLinksSchema = baseLinkSchema(false);

// Define the schema for updateLinks
const updateLinksSchema = baseLinkSchema(true);

// Define the schema for the entire form (multiple links)
const addLinksFormSchema = z.object({
    links: z.array(addLinksSchema).min(1, {
        message: "You must add at least one link.",
    }),
});

const updateLinksFormSchema = z.object({
    links: z.array(updateLinksSchema).min(1, {
        message: "You must add at least one link.",
    }),
});

const reorderLinksSchema = z.object({
    orderedIds: z.array(z.string().uuid()), // Array of UUID strings
});

const deleteLinkSchema = z.object({
    id: z.string().uuid(), // UUID string for the id
});

export {
    addLinksFormSchema,
    updateLinksFormSchema,
    reorderLinksSchema,
    deleteLinkSchema,
};
