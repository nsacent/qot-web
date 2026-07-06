import Navbar from "@/components/layout/Navbar";
import LoginForm from "@/components/auth/LoginForm";
import LoginPageClient from "@/components/auth/LoginPageClient";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <LoginPageClient>
                <section className="mx-auto max-w-md px-6 py-16">
                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                            Welcome Back
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">
                            Login to QOT
                        </h1>

                        <div className="mt-6">
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
            </LoginPageClient>
        </main>
    );
}