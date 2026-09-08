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

export default function ResetPasswordEmail({ token }: { token: string }) {
  const ZWSP = "\u200B";

  // Build full URL from env + token
  const baseUrl = process.env.NEXT_PUBLIC_URL!;
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  const host = baseUrl.replace(/^https?:\/\//, "");
  const escapedHost = host.replace(/\./g, `${ZWSP}.`);

  return (
    <Html>
      <Head />
      <Preview>{`Reset your password for ${escapedHost}`}</Preview>

      <Body style={{ backgroundColor: "#fff", fontFamily: "Helvetica, Arial" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto" }}>
          <Section style={{ padding: 24, textAlign: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: 700 }}>
              Reset your password
            </Text>

            <Text style={{ fontSize: 14, color: "#475569" }}>
              Click the button below to reset your password for {escapedHost}.
            </Text>

            <Link
              href={resetUrl}
              style={{
                display: "inline-block",
                marginTop: 20,
                padding: "12px 24px",
                backgroundColor: "#000",
                color: "#fff",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              Reset password
            </Link>

            <Text style={{ fontSize: 12, marginTop: 20 }}>
              Or copy and paste this link:
            </Text>

            <Text style={{ fontSize: 12, wordBreak: "break-all" }}>
              <Link href={resetUrl}>{resetUrl}</Link>
            </Text>

            <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 20 }}>
              If you didn’t request this, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
