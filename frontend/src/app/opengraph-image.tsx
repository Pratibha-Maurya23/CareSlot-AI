import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MediFlow AI - Intelligent Healthcare Triage Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#1B4965",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Background gradient decorative element */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(98, 182, 203, 0.35) 0%, rgba(27, 73, 101, 0) 70%)",
          }}
        />

        {/* Brand header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "#62B6CB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1B4965",
              fontWeight: "900",
              fontSize: "32px",
            }}
          >
            +
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: "800",
              color: "#ffffff",
              letterSpacing: "-0.5px",
            }}
          >
            MediFlow AI
          </span>
          <span
            style={{
              marginLeft: "12px",
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "rgba(98, 182, 203, 0.2)",
              border: "1px solid rgba(98, 182, 203, 0.4)",
              color: "#62B6CB",
              fontSize: "14px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
            }}
          >
            Clinical Triage Intelligence
          </span>
        </div>

        {/* Main headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "800",
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              margin: 0,
            }}
          >
            Advancing Clinical Superintelligence.
          </h1>
          <p
            style={{
              fontSize: "26px",
              color: "#BEE9E8",
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            Real-time medical triage reducing emergency wait times by 70%, prioritizing acute care, and empowering clinicians.
          </p>
        </div>

        {/* Feature badges footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
            width: "100%",
          }}
        >
          {["HIPAA Compliant", "< 90s Triage Speed", "Manchester Triage Protocols", "Live Doctor Queue"].map(
            (badge) => (
              <div
                key={badge}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#CAE9FF",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#62B6CB",
                  }}
                />
                {badge}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
