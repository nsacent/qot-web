import Navbar from "@/components/layout/Navbar";
import MyReviewsClient from "@/components/reviews/MyReviewsClient";

export default function MyReviewsPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <MyReviewsClient />
        </main>
    );
}