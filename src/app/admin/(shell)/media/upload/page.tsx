import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/AdminUi";
import { UploadForm } from "@/components/admin/SettingsForms";

export const metadata: Metadata = { title: "Upload Media" };

export default function UploadMediaPage() {
  return (
    <>
      <PageHeader
        back={{ href: "/admin/media", label: "Back to media" }}
        title="Upload Media"
        description="Add an editorial image to the shared media library."
      />
      <UploadForm />
    </>
  );
}
