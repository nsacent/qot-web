import Navbar from "@/components/layout/Navbar";
import PostAdForm from "@/components/listings/PostAdForm";

export default function PostAdPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <section className="mx-auto max-w-4xl px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold md:text-5xl">Post an Advert</h1>
                    <p className="mt-3 text-slate-600">
                        Create a listing and reach buyers across Uganda.
                    </p>
                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
                    <PostAdForm />
                </div>
            </section>
        </main>
    );
}