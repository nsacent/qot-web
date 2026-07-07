import Navbar from "@/components/layout/Navbar";
import SavedSearchesClient from "@/components/listings/SavedSearchesClient";

export default function SavedSearchesPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <SavedSearchesClient />
        </main>
    );
}