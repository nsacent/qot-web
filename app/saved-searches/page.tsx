import { redirect } from "next/navigation";

export default function LegacySavedSearchesPage() {
    redirect("/account/saved?tab=searches");
}
