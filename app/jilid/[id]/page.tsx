import { supabase } from "@/lib/supabase";
import { JilidClient } from "./JilidClient";

interface Props { params: Promise<{ id: string }> }

export async function generateStaticParams() {
  const { data } = await supabase.from("jilids").select("id");
  return (data ?? []).map(j => ({ id: j.id }));
}

export default async function JilidPage({ params }: Props) {
  const { id } = await params;
  return <JilidClient id={id} />;
}
