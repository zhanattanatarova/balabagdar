import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { ClubMiniCard } from "./Cards";
import { CLUB_COLS, type PubClub } from "@/lib/publicData";
import { safeUrl } from "@/lib/safeUrl";

const CLUB_RE = /\[club:([0-9a-f-]{36})\]/gi;
export function splitClubEmbeds(body: string): ({ md: string } | { club: string })[] {
  const out: ({ md: string } | { club: string })[] = [];
  let last = 0;
  for (const m of body.matchAll(CLUB_RE)) {
    if (m.index! > last) out.push({ md: body.slice(last, m.index) });
    out.push({ club: m[1].toLowerCase() });
    last = m.index! + m[0].length;
  }
  if (last < body.length) out.push({ md: body.slice(last) });
  return out;
}

const md = {
  h1: (p: any) => <h2 className="text-xl font-black mt-6 mb-2" {...p} />,
  h2: (p: any) => <h2 className="text-xl font-black mt-6 mb-2" {...p} />,
  h3: (p: any) => <h3 className="text-lg font-black mt-5 mb-2" {...p} />,
  p: (p: any) => <p className="my-3 leading-relaxed" {...p} />,
  ul: (p: any) => <ul className="list-disc pl-6 my-3 space-y-1" {...p} />,
  ol: (p: any) => <ol className="list-decimal pl-6 my-3 space-y-1" {...p} />,
  a: ({ href, ...p }: any) => <a href={safeUrl(href)} target="_blank" rel="noopener noreferrer" className="text-primary underline" {...p} />,
  img: ({ src, alt }: any) => <img src={safeUrl(src)} alt={alt || ""} className="rounded-xl my-4 w-full" />,
  blockquote: (p: any) => <blockquote className="border-l-4 border-primary pl-4 my-4 text-muted-foreground" {...p} />,
};

export default function ArticleBody({ body }: { body: string }) {
  const parts = splitClubEmbeds(body);
  const ids = [...new Set(parts.flatMap((p) => ("club" in p ? [p.club] : [])))];
  const [clubs, setClubs] = useState<Record<string, PubClub>>({});
  useEffect(() => {
    if (!ids.length) return;
    supabase.from("clubs").select(CLUB_COLS).in("id", ids).then(({ data }) =>
      setClubs(Object.fromEntries(((data as unknown as PubClub[]) || []).map((c) => [c.id, c]))));
  }, [ids.join(",")]);
  return (
    <div className="text-base">
      {parts.map((p, i) => "md" in p
        ? <ReactMarkdown key={i} components={md}>{p.md}</ReactMarkdown>
        : clubs[p.club] ? <div key={i} className="my-4"><ClubMiniCard club={clubs[p.club]} /></div> : null)}
    </div>
  );
}
