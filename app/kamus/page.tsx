import { supabase } from "@/lib/supabase";
import { KamusClient } from "./KamusClient";

export default async function KamusPage() {
  const { data: entries } = await supabase.from("kamus").select("*").order("unit_num").order("kalimah");
  return <KamusClient entries={entries ?? []} />;
}
