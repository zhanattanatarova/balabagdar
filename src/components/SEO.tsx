import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  jsonLd?: Record<string, any>;
}

const BASE = "https://bala-hub.kz";

const SEO = ({ title, description, path, image, type = "website", jsonLd }: SEOProps) => {
  const url = `${BASE}${path}`;
  // Keep the static description from index.html in sync so crawlers never read two different ones.
  useEffect(() => {
    document.title = title;
    document.querySelectorAll('meta[name="description"]:not([data-rh])').forEach((m) => m.setAttribute("content", description));
  }, [title, description]);
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
