import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/auth";
import { useRouter } from "next/router";
import Navbar from "../components/NavBar";

function MyApp({ Component, pageProps }: AppProps) {
    const { pathname } = useRouter();
    const authRoutes = ["/register", "/login"];
    const authRoute = authRoutes.includes(pathname);

    return (
        <AuthProvider>
            {!authRoute && <Navbar />}
            <div className={authRoute ? "" : "pt-16"}>
                <Component {...pageProps} />
            </div>
        </AuthProvider>
    );
}

export default MyApp;
