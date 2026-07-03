import Navbar from "@/components/layout/Navbar";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <section className="mx-auto flex max-w-7xl items-center justify-center px-6 py-16">
                <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
                    <h1 className="text-3xl font-bold">Create QOT Account</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Join QOT Uganda and start buying or selling safely.
                    </p>

                    <div className="mt-8">
                        <RegisterForm />
                    </div>

                    <p className="mt-6 text-center text-sm text-slate-600">
                        Already have an account?{" "}
                        <a href="/login" className="font-semibold text-orange-600">
                            Login
                        </a>
                    </p>
                </div>
            </section>
        </main>
    );
}