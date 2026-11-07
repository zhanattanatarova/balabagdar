import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import PublicationSource from "@/components/PublicationSource";
import SEO from "@/components/SEO";

interface Publication {
  id: string;
  title: string;
  body: string;
  name: string;
  city: string;
  category: string;
  phone?: string;
  event_date: string | null;
  image_url: string | null;
  source_label: string | null;
  source_url: string | null;
  club_id: string | null;
}

export default function PublicationPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const [post, setPost] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const ui = {
    ru: { back: "Назад", club: "Страница центра", missing: "Публикация недоступна", error: "Не удалось загрузить публикацию" },
    kz: { back: "Артқа", club: "Орталық парақшасы", missing: "Жарияланым қолжетімсіз", error: "Жарияланым жүктелмеді" },
    en: { back: "Back", club: "Center page", missing: "Publication unavailable", error: "Could not load publication" },
  }[lang];

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(false);
      const source = user ? "announcements" : "announcements_public";
      const columns = "id,title,body,name,city,category,event_date,image_url,source_label,source_url,club_id" + (user ? ",phone" : "");
      const { data, error: loadError } = await supabase.from(source).select(columns).eq("id", id || "").maybeSingle();
      if (cancelled) return;
      setPost(data as unknown as Publication | null);
      setError(Boolean(loadError));
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [id, user, authLoading]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <Button variant="ghost" asChild className="mb-5">
        <Link to={post?.category === "event" ? "/" : "/board"}><ArrowLeft size={16} /> {ui.back}</Link>
      </Button>
      {loading ? <Loader2 className="animate-spin text-primary mx-auto" /> : !post ? (
        <h1 className="text-xl font-black">{error ? ui.error : ui.missing}</h1>
      ) : (
        <article>
          <SEO title={`${post.title} | BalaHub`} description={post.body.slice(0, 159)} path={`/publication/${post.id}`} />
          <h1 className="text-2xl font-black break-words">{post.title}</h1>
          <p className="flex items-center gap-2 text-sm text-muted-foreground mt-3"><MapPin size={16} /> {post.city}</p>
          {post.image_url && <img src={post.image_url} alt={post.title} className="w-full max-h-96 object-cover mt-5 rounded-lg" />}
          <p className="mt-5 text-base whitespace-pre-line">{post.body}</p>
          <PublicationSource label={post.source_label} url={post.source_url} />
          <div className="mt-5 pt-4 border-t border-border flex flex-wrap justify-between gap-3 text-sm font-bold">
            <span className="text-muted-foreground">{post.name}</span>
            {post.phone && <a href={`tel:${post.phone}`} className="text-primary flex items-center gap-2"><Phone size={16} /> {post.phone}</a>}
          </div>
          {post.club_id && <Button asChild variant="outline" className="mt-5"><Link to={`/club/${post.club_id}`}>{ui.club}</Link></Button>}
        </article>
      )}
    </main>
  );
}