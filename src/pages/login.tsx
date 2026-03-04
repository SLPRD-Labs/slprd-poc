import { useAuthContext } from "@/contexts/auth-context/auth-context";
import { Route } from "@/routes/login";
import type { FC, SubmitEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
            <Card className="w-full max-w-100 overflow-hidden rounded-2xl border-none bg-white shadow-xl">
                <CardHeader className="flex flex-col items-center gap-4 pt-10 pb-2">
                    <img className="block h-12 w-auto" src={logo} alt="logo" />
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900">Bon retour parmi nous</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Accédez à votre espace S.L.P.R.D
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="p-10 pt-4">
                    <form
                        onSubmit={e => {
                            void handleSubmit(e);
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="homeserver"
                                className="text-xs font-bold text-slate-600 uppercase"
                            >
                                URL du serveur
                            </Label>
                            <Input
                                id="homeserver"
                                placeholder="https://matrix.org"
                                value={baseUrl}
                                onChange={e => {
                                    setBaseUrl(e.target.value);
                                }}
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="username"
                                className="text-xs font-bold text-slate-600 uppercase"
                            >
                                Nom d&#39;utilisateur
                            </Label>
                            <Input
                                id="username"
                                placeholder="@user:matrix.org"
                                value={username}
                                onChange={e => {
                                    setUsername(e.target.value);
                                }}
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-xs font-bold text-slate-600 uppercase"
                                >
                                    Mot de passe
                                </Label>
                                <button
                                    type="button"
                                    className="text-primary text-xs font-medium hover:underline"
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => {
                                    setPassword(e.target.value);
                                }}
                            />
                        </div>

                        {error && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                                ⚠️ {error}
                            </div>
                        )}

                        <Button type="submit" className="mt-2 py-6 text-base" disabled={loading}>
                            {loading ? "Connexion..." : "Se connecter"}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-xs text-slate-500">
                        En continuant, vous acceptez nos Conditions d&#39;utilisation et notre
                        Politique de confidentialité. © 2026 S.L.P.R.D.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
