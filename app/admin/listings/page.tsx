import { permanentRedirect } from "next/navigation";

export default function LegacyAdminListingsRedirect() {
    permanentRedirect("/admin/ads");
}
