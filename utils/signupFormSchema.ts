import z from "zod";

const FIELD_REQUIRED_STR = "This field is required";
export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

export const signUpFormSchema = z.object({
  title: z
    .string({
      invalid_type_error: "Title must be a string",
      required_error: FIELD_REQUIRED_STR,
    })
    .min(3, "Minimum 3 characters")
    .max(20, "Maximum 20 characters")
    .trim(),
  notes: z
    .string({
      invalid_type_error: "Notes must be a string",
      required_error: FIELD_REQUIRED_STR,
    })
    .min(3, "Minimum 3 characters")
    .trim(),

  //   ingredients: z.enum(GENDER_OPTIONS, {
  //     required_error: FIELD_REQUIRED_STR,
  //     invalid_type_error: `Invalid gender, must be one of the followings: ${GENDER_OPTIONS.join(
  //       ", "
  //     )}`,
  //   }),

  isPublic: z.boolean().optional(),

  image_url: z.string().optional(),

  steps: z.array(
    z.object({
      title: z.string().min(1, "Step title is required"),
      content: z.string().min(1, "Step content is required"),
    })
  ),
});

export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;
