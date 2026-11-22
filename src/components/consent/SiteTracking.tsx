import { ConsentManager } from "@/components/consent/ConsentManager";
import { GoogleTags } from "@/components/consent/GoogleTags";
import { getPublicSettings } from "@/lib/api/endpoints";

/** Cookie banner and consent-gated Google tags, configured from Website Settings in the admin dashboard. */
export async function SiteTracking() {
  const settings = await getPublicSettings();

  return (
    <>
      <ConsentManager mode={settings.consentMode} />
      <GoogleTags
        gaMeasurementId={settings.gaMeasurementId}
        adsenseClientId={settings.adsenseClientId}
        mode={settings.consentMode}
      />
    </>
  );
}
