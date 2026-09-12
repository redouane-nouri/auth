import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
} from "@react-email/components";

export default function EmailHtml({
  url,
  host,
}: {
  url: string;
  host: string;
}) {
  /*
    Make the host not clickabale  by adding zero width space before the dot, that will break the string.
  */
  const escapedHost = host.replace(/\./g, "&#8203;.");

  return (
    <Html>
      <Head />
      <Preview>{`Sign in to ${escapedHost}`}</Preview>
      <Body
        style={{
          backgroundColor: "white",
          fontFamily: "Helvetica, Arial, sans-serif",
          margin: 0,
          padding: 20,
        }}
      >
        <Container
          style={{
            maxWidth: 600,
            margin: "0 auto",
            backgroundColor: "#ffffff",
            border: "1px solid #f3f4f6",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <Section
            style={{
              padding: 20,
              textAlign: "center",
              background: "linear-gradient(90deg,#f8fafc,#eef2ff)",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
              {escapedHost}
            </Text>
          </Section>

          <Section style={{ padding: "28px 32px", textAlign: "center" }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
                color: "#0f172a",
              }}
            >
              Login Link
            </Text>

            <Text
              style={{
                fontSize: 15,
                color: "#475569",
                lineHeight: "22px",
                marginBottom: 20,
              }}
            >
              Click the button below to sign in.
            </Text>

            <div
              style={{ margin: "0 auto", width: "100%", textAlign: "center" }}
            >
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ margin: "0 auto" }}
              >
                <tbody>
                  <tr>
                    <td>
                      <Link
                        href={url}
                        style={{
                          display: "inline-block",
                          backgroundColor: "#000000",
                          color: "#ffffff",
                          textDecoration: "none",
                          padding: "12px 24px",
                          borderRadius: 8,
                          fontWeight: 600,
                        }}
                        target="_blank"
                      >
                        Sign in
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Text style={{ fontSize: 13, color: "#94a3b8", marginTop: 18 }}>
              Or copy and paste this link into your browser:
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#0f172a",
                wordBreak: "break-all",
                marginTop: 8,
              }}
            >
              <Link
                href={url}
                style={{ color: "#2563eb", textDecoration: "none" }}
              >
                {url}
              </Link>
            </Text>
          </Section>

          <Section
            style={{
              padding: "18px 32px",
              backgroundColor: "#fafafa",
              borderTop: "1px solid #eef2ff",
              textAlign: "center",
            }}
          >
            <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
              Didn&apos;t request this?
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              If you didn&apos;t request this email, you can safely ignore it.
            </Text>
          </Section>

          <Section
            style={{
              padding: 14,
              textAlign: "center",
              fontSize: 12,
              color: "#9ca3af",
            }}
          >
            <Text>
              © {new Date().getFullYear()} {escapedHost}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
