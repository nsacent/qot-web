"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <html lang="en">
            <body>
                <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff7f2", padding: "24px", fontFamily: "Arial, sans-serif" }}>
                    <section style={{ maxWidth: 620, width: "100%", background: "white", borderRadius: 28, padding: 40, textAlign: "center", boxShadow: "0 24px 80px rgba(15,23,42,.12)" }}>
                        <div style={{ color: "#f97316", fontSize: 38, fontWeight: 900, letterSpacing: -3 }}>QOT</div>
                        <h1 style={{ margin: "24px 0 0", color: "#0f172a", fontSize: 36 }}>QOT could not load.</h1>
                        <p style={{ color: "#64748b", lineHeight: 1.7 }}>Please try again. If the problem continues, return to the homepage.</p>
                        <button type="button" onClick={reset} style={{ marginTop: 16, border: 0, borderRadius: 14, background: "#f97316", color: "white", padding: "13px 24px", fontWeight: 800, cursor: "pointer" }}>Try again</button>
                    </section>
                </main>
            </body>
        </html>
    );
}
