// "/" loading state — the landing page is fully static so this is rarely shown,
// but keeps Next.js happy for the route segment.
export default function Loading() {
  return (
    <div className="min-h-screen" style={{ background: '#0A192F' }} />
  )
}
