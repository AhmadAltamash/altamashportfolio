import { Helmet } from "react-helmet-async";

const SITE_URL = "https://altamashahmad.in";
const DEFAULT_IMAGE = `${SITE_URL}/Meta.png`;

/**
 * Overrides the static tags in index.html for a specific route. Pass only
 * what differs from the site defaults — anything omitted falls back to
 * index.html's values since those render first (avoids a flash of the
 * wrong title before this mounts).
 */
const SEO = ({ title, description, path = "/", image = DEFAULT_IMAGE, noindex = false }) => {
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />

      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default SEO;
