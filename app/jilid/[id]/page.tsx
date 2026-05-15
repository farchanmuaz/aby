import { supabase } from "@/lib/supabase";
import { JilidClient } from "./JilidClient";
import { notFound } from "next/navigation";

interface Props { params: Promise<{ id: string }> }

export async function generateStaticParams() {
  const { data } = await supabase.from("jilids").select("id");
  return (data ?? []).map(j => ({ id: j.id }));
}

export default async function JilidPage({ params }: Props) {
  const { id } = await params;
  const [{ data: jilid }, { data: units }, { data: allJilids }] = await Promise.all([
    supabase.from("jilids").select("*").eq("id", id).single(),
    supabase.from("units").select("*").eq("jilid_id", id).order("num"),
    supabase.from("jilids").select("*").order("id"),
  ]);
  if (!jilid) notFound();
  return <JilidClient jilid={jilid} units={units ?? []} allJilids={allJilids ?? []} />;
}
