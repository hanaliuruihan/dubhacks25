// src/components/ProfessorLink.jsx
import * as React from "react";

const FN_URL = (import.meta.env?.VITE_RMP_FN_URL ||
  "https://akl5kaosqq6r7pmhrvrkelo6fq0wpbig.lambda-url.us-east-1.on.aws/").replace(/\/+$/, "/");

export default function ProfessorLink({ name, campus = "UW", className = "prof-link" }) {
  const [url, setUrl] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    const cleanName = (name ?? "").trim();
    const cleanCampus = (campus ?? "").trim() || "UW";
    setLoaded(false);
    setUrl(null);

    if (!cleanName) { setLoaded(true); return; }

    const req = `${FN_URL}?name=${encodeURIComponent(cleanName)}&campus=${encodeURIComponent(cleanCampus)}`;
    fetch(req)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => {
        if (!alive) return;
        console.log("[RMP] request:", { cleanName, cleanCampus, req }, "response:", d);
        setUrl(d?.url ?? null);
        setLoaded(true);
      })
      .catch(err => {
        if (!alive) return;
        console.warn("[RMP] lookup failed:", err);
        setUrl(null);
        setLoaded(true);
      });

    return () => { alive = false; };
  }, [name, campus]);

  const stop = (e) => e.stopPropagation(); // prevent card click from hijacking

  // While loading, show plain text (prevents wrong fallback flash)
  if (!loaded) return <span onClick={stop} className={className}>{name}</span>;

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" onClick={stop} className={className}>
        {name}
      </a>
    );
  }

  // Only if API truly had no link:
  const q = `${(name ?? "").trim()} RateMyProfessors University of Washington`;
  return (
    <a
      href={`https://www.google.com/search?q=${encodeURIComponent(q)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={stop}
      className={className}
    >
      {name}
    </a>
  );
}
