import { useAuthContext } from "@/contexts/auth-context/auth-context";
import { Route } from "@/routes/login";
import type { FC, SubmitEvent } from "react";
import { useState } from "react";

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
        <form
            onSubmit={e => {
                void handleSubmit(e);
            }}
        >
            <h2>Matrix Login</h2>

            <input
                placeholder="Homeserver URL"
                value={baseUrl}
                onChange={e => {
                    setBaseUrl(e.target.value);
                }}
            />

            <input
                placeholder="Username"
                value={username}
                onChange={e => {
                    setUsername(e.target.value);
                }}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => {
                    setPassword(e.target.value);
                }}
            />

            {error && <div style={{ color: "red" }}>{error}</div>}

            <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>
    );
};
