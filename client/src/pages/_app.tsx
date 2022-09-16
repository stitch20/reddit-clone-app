import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/auth";
import { useRouter } from "next/router";
import Navbar from "../components/NavBar";
import { SWRConfig } from "swr";
import Axios from "../utils/axios";
import Head from "next/head";
function MyApp({ Component, pageProps }: AppProps) {
    const { pathname } = useRouter();
    const authRoutes = ["/register", "/login"];
    const authRoute = authRoutes.includes(pathname);
    const fetcher = async (url: string) => {
        try {
            const res = await Axios.get(url);
            return res.data;
        } catch (error: any) {
            throw error.response.data;
        }
    };
    return (
        <>
            <Head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css"
                    integrity="sha512-xh6O/CkQoPOWDdYTDqeRdPCVd1SpvCA9XXcUnZS2FmJNp1coAFzvtCN9BmamE+4aHK8yyUHUSCcJHgXloTyT2A=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
            </Head>
            <SWRConfig value={{ fetcher }}>
                <AuthProvider>
                    {!authRoute && <Navbar />}
                    <div className={authRoute ? "" : "pt-16"}>
                        <Component {...pageProps} />
                    </div>
                </AuthProvider>
            </SWRConfig>
        </>
    );
}

export default MyApp;
