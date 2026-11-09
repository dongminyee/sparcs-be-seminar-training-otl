import { z } from "zod";

export const resourceIdSchema = z.number().int().positive().max(2_147_483_647);

export const classTimeSchema = z
  .object({
    day: z.number().int().min(0).max(4),
    begin: z.number().int().min(0).max(1439),
    end: z.number().int().min(1).max(1440),
    room: z.string().min(1).max(64),
  })
  .refine(({ begin, end }) => begin < end, {
    message: "end must be after begin",
  });

export const lectureSchema = z.object({
  id: resourceIdSchema,
  code: z.string().min(1).max(16),
  classNo: z.string().min(1).max(4),
  title: z.string().min(1).max(100),
  titleEn: z.string().min(1).max(150),
  department: z.string().min(1).max(50),
  professor: z.string().min(1).max(50),
  credit: z.number().int().min(0).max(30),
  year: z.number().int().min(2000).max(2100),
  semester: z.number().int().min(1).max(4),
  classes: z
    .array(classTimeSchema)
    .refine(
      classes =>
        new Set(classes.map(({ day, begin }) => `${day}:${begin}`)).size ===
        classes.length,
      { message: "class start times must be unique" },
    ),
});

export const lectureFeedSchema = z
  .array(lectureSchema)
  .refine(
    lectures => new Set(lectures.map(({ id }) => id)).size === lectures.length,
    { message: "lecture IDs must be unique" },
  );

export type ClassTime = z.infer<typeof classTimeSchema>;
export type Lecture = z.infer<typeof lectureSchema>;

export type Credentials = { username: string; password: string };
export type Session = {
  accessToken: string;
  user: { id: number; username: string; name: string };
};

export const demo = {
  username: "student",
  password: "mini-otl-2026",
  userId: 1,
} as const;

export const reviewContentLimit = 500;
export const reviewContentSchema = z
  .string()
  .trim()
  .min(1)
  .max(reviewContentLimit);
export const reviewDemoUsername = "student2";

export type Review = {
  id: number;
  lectureId: number;
  author: { id: number; name: string };
  content: string;
  createdAt: string;
  heartCount?: number;
  heartedByMe?: boolean;
};
