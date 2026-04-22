import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Dashboard } from "./components/Dashboard";

function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-6 h-6 text-neutral-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3h18v18H3V3z" />
                <path d="M3 9h18M9 3v18" />
              </svg>
              <span className="text-lg font-medium text-neutral-800 tracking-tight">OptiScan</span>
            </div>
            <p className="text-neutral-500 text-sm mt-4 leading-relaxed">
              Find oversold call options on low-price stocks. Real-time scanning for day trading opportunities.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400 transition-colors placeholder:text-neutral-400"
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400 transition-colors placeholder:text-neutral-400"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            {error && (
              <p className="text-red-600 text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-sm font-medium text-white bg-neutral-800 rounded-md hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "..." : flow === "signIn" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              {flow === "signIn" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-100">
            <button
              onClick={() => signIn("anonymous")}
              className="w-full py-2.5 text-sm text-neutral-600 border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors"
            >
              Continue as guest
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="py-4 text-center">
      <p className="text-xs text-neutral-400">
        Requested by{" "}
        <a href="https://twitter.com/Quincy" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-600 transition-colors">
          @Quincy
        </a>
        {" · "}
        Built by{" "}
        <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-600 transition-colors">
          @clonkbot
        </a>
      </p>
    </footer>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Dashboard />
      <Footer />
    </div>
  );
}
