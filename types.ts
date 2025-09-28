// types.ts (MUST reflect your schema)
export interface Course {
  id: string;
  title: string; // <-- Correct field name
  description?: string;
  created_at?: string;
}

export interface Topic {
  id: string;
  course_id: string;
  title: string;
  content?: string;
  created_at?: string;
}