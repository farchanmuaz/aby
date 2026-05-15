import { supabase } from "@/lib/supabase";
import { HomeClient } from "./HomeClient";

export default async function HomePage() {
  const { data: jilids } = await supabase.from("jilids").select("*").order("id");
  return <HomeClient jilids={jilids ?? []} />;
}
