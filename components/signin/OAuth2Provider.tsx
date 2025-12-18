import { OAuth2ProviderT } from "@/utils/types";
import { Button } from "@radix-ui/themes";

export default function OAuth2Provider({
  oAuth2Provider,
}: {
  oAuth2Provider: OAuth2ProviderT;
}) {
  const Icon = oAuth2Provider.icon;

  return (
    <Button variant="outline" highContrast>
      <Icon />
      {oAuth2Provider.label}
    </Button>
  );
}
