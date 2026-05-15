import { supabase } from "@/lib/supabase";
import { UnitClient } from "./UnitClient";
import { notFound } from "next/navigation";

interface Props { params: Promise<{ jilidId: string; num: string }> }

export async function generateStaticParams() {
  const { data } = await supabase.from("units").select("jilid_id, num");
  return (data ?? []).map(u => ({ jilidId: u.jilid_id, num: String(u.num) }));
}

export default async function UnitPage({ params }: Props) {
  const { jilidId, num } = await params;
  const unitNum = Number(num);

  const [{ data: jilid }, { data: unit }, { data: materi }, { data: kamus }] = await Promise.all([
    supabase.from("jilids").select("*").eq("id", jilidId).single(),
    supabase.from("units").select("*").eq("jilid_id", jilidId).eq("num", unitNum).single(),
    supabase.from("materi").select("*").eq("jilid_id", jilidId).eq("unit_num", unitNum).order("sort_order"),
    supabase.from("kamus").select("*").eq("jilid_id", jilidId).eq("unit_num", unitNum),
  ]);

  if (!jilid || !unit) notFound();

  return <UnitClient jilid={jilid} unit={unit} materi={materi ?? []} kamus={kamus ?? []} />;
}
