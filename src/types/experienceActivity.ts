export interface ExperienceActivity {
  id: number;
  experience_id: number;

  image_url: string | null;

  title: string;
  description: string | null;

  sort_order: number;

  created_at: string;
  updated_at: string;
}
