import { ImageResponse } from "next/og";

export const alt = "QOT Uganda - Buy and Sell for Free";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "78px 90px",
                    color: "white",
                    background: "linear-gradient(135deg, #0f172a 0%, #111827 55%, #f97316 140%)",
                    fontFamily: "Arial, sans-serif",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
                    <div style={{ fontSize: 92, fontWeight: 900, letterSpacing: -8 }}>QOT</div>
                    <div style={{ width: 18, height: 18, borderRadius: 20, background: "#f97316" }} />
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#fdba74" }}>UGANDA</div>
                </div>
                <div style={{ marginTop: 46, fontSize: 70, fontWeight: 900, letterSpacing: -3, lineHeight: 1.04 }}>
                    Buy &amp; Sell for Free
                </div>
                <div style={{ marginTop: 24, fontSize: 30, fontWeight: 600, color: "#cbd5e1" }}>
                    Cars, phones, property, electronics, services and more across Uganda.
                </div>
            </div>
        ),
        size,
    );
}
