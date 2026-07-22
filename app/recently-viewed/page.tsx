import { redirect } from "next/navigation";

export default function LegacyRecentlyViewedPage() {
    redirect("/account/recently-viewed");
}
