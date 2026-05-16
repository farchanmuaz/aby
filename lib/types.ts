export interface Jilid {
  id: string;
  name: string;
  level: string | null;
  unit_count: number;
  accent: string;
  locked: boolean;
  resume_unit: number | null;
  resume_progress: number | null;
}

export interface Unit {
  id: string;
  jilid_id: string;
  num: number;
  title: string;
  sub: string | null;
  status: "todo" | "current" | "done";
  words: number;
  progress: number;
}

export interface DialogLine {
  speaker: string;
  text: string;
}

export interface Materi {
  id: string;
  jilid_id: string;
  unit_num: number | null;
  type: "heading" | "paragraph" | "dialog" | "note" | "image";
  text: string | null;
  title: string | null;
  caption: string | null;
  lines: DialogLine[] | null;
  sort_order: number;
}

export interface Tashrif {
  madhi: string;
  mudhari: string;
  masdar: string;
}

export interface Kamus {
  id: string;
  jilid_id: string;
  unit_num: number | null;
  kalimah: string;
  sharh: string;
  jam: string | null;
  mufrad: string | null;
  muradif: string | null;
  didh: string | null;
  mithal: string | null;
  tashrif: Tashrif | null;
  has_img: boolean;
  img_url: string | null;
}

export interface Activity {
  id: number;
  type: "add" | "edit" | "delete" | "image";
  who: string;
  what: string;
  color: string;
  created_at: string;
}

// Supabase database type helper
export type Database = {
  public: {
    Tables: {
      jilids:   { Row: Jilid;    Insert: Omit<Jilid, never>;    Update: Partial<Jilid> };
      units:    { Row: Unit;     Insert: Omit<Unit, never>;     Update: Partial<Unit> };
      materi:   { Row: Materi;   Insert: Omit<Materi, never>;   Update: Partial<Materi> };
      kamus:    { Row: Kamus;    Insert: Omit<Kamus, never>;    Update: Partial<Kamus> };
      activity: { Row: Activity; Insert: Omit<Activity, "id" | "created_at">; Update: Partial<Activity> };
    };
  };
};
