import { useAuthContext } from "@/contexts/auth-context/auth-context.ts";
import { Route } from "@/routes/login.tsx";
import type { FC, SubmitEvent } from "react";
import { useState } from "react";
import logo from "@/assets/LogoSLPRD.png";

export const Login: FC = () => {
    const { redirect } = Route.useSearch();
    const navigate = Route.useNavigate();

    const { login } = useAuthContext();

    const [baseUrl, setBaseUrl] = useState("https://synapse.m.localhost");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login({ baseUrl, username, password });
            await navigate({ to: redirect });
        } catch (err) {
            setError(
                typeof err === "object" &&
                    err !== null &&
                    "message" in err &&
                    typeof err.message === "string"
                    ? err.message
                    : "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-100 p-4">
            <form
                className="flex w-full max-w-90 flex-col gap-6 rounded-2xl bg-white p-10 shadow-xl"
                onSubmit={e => {
                    void handleSubmit(e);
                }}
            >
                <img className="mx-auto h-12.5 w-15" src={logo} alt="logo" />
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900">Bon retour parmi nous</h2>
                    <p className="mt-1 text-sm text-slate-500">Accédez à votre espace S.L.P.R.D</p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="homeserver"
                            className="text-xs font-bold text-slate-600 uppercase"
                        >
                            URL du serveur
                        </label>
                        <input
                            id="homeserver"
                            className="rounded-md border border-slate-300 bg-slate-50 p-2.5 text-sm transition-all outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            placeholder="https://matrix.org"
                            value={baseUrl}
                            onChange={e => {
                                setBaseUrl(e.target.value);
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="username"
                            className="text-xs font-bold text-slate-600 uppercase"
                        >
                            Nom d&#39;utilisateur
                        </label>
                        <input
                            id="username"
                            className="rounded-md border border-slate-300 bg-slate-50 p-2.5 text-sm transition-all outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            placeholder="@user:matrix.org"
                            value={username}
                            onChange={e => {
                                setUsername(e.target.value);
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="password"
                                className="text-xs font-bold text-slate-600 uppercase"
                            >
                                Mot de passe
                            </label>
                            <button
                                type="button"
                                className="text-xs font-medium text-indigo-600 hover:underline"
                                onClick={() => {
                                    /* Ta logique ici */
                                }}
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>
                        <input
                            id="password"
                            type="password"
                            className="rounded-md border border-slate-300 bg-slate-50 p-2.5 text-sm transition-all outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => {
                                setPassword(e.target.value);
                            }}
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                        ⚠️ {error}
                    </div>
                )}

                <button
                    className="mt-2 rounded-md bg-[#7D69E2FF] py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Connexion..." : "Se connecter"}
                </button>
                <p className="text-center text-xs text-slate-500">
                    En continuant, vous acceptez nos Conditions d&#39;utilisation et notre Politique
                    de confidentialité. © 2026 S.L.P.R.D. Tous droits réservés.
                </p>
            </form>
        </div>
    );
};
