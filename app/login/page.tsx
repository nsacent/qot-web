import Navbar from "@/components/layout/Navbar";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <section className="mx-auto flex max-w-7xl items-center justify-center px-6 py-16">
                <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
                    <h1 className="text-3xl font-bold">Login to QOT</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Access your account, manage listings, chat with sellers, and post adverts.
                    </p>

                    <div className="mt-8">
                        <LoginForm />
                    </div>

                    <p className="mt-6 text-center text-sm text-slate-600">
                        Do not have an account?{" "}
                        <a href="/register" className="font-semibold text-orange-600">
                            Create account
                        </a>
                    </p>
                </div>
            </section>
        </main>
    );
}