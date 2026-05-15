import { supabase } from "@/lib/supabase";
import { UnitClient } from "./UnitClient";

interface Props { params: Promise<{ jilidId: string; num: string }> }

export async function generateStaticParams() {
  const { data } = await supabase.from("units").select("jilid_id, num");
  return (data ?? []).map(u => ({ jilidId: u.jilid_id, num: String(u.num) }));
}

export default async function UnitPage({ params }: Props) {
  const { jilidId, num } = await params;
  return <UnitClient jilidId={jilidId} num={Number(num)} />;
}
