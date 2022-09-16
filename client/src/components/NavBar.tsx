import Image from "next/image";
import Link from "next/link";
import { FormEvent, Fragment } from "react";
import { useAuthDispatch, useAuthState } from "../context/auth";
import Axios from "../utils/axios";
export const Navbar: React.FC = () => {
    const { loading, authenticated } = useAuthState();
    const dispatch = useAuthDispatch();
    const handleLogout = async (event: FormEvent) => {
        try {
            await Axios.post("/auth/logout");
            dispatch("LOGOUT");
            window.location.reload();
            console.log(authenticated);
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between h-13 px-5 bg-white">
            <span className="flex items-center text-2xl font-semibold text-gray-400">
                {/* <Link href="/">Community</Link> */}
                <Link href="/">
                    <a className="cursor-pointer">
                        <Image
                            src="/reddit-name-logo.png"
                            alt="logo"
                            width={80}
                            height={45}
                            className="hidden md:block"
                        />
                    </a>
                </Link>
            </span>

            <div className="max-w-full px-4">
                <div className="relative flex items-center bg-gray-100 border rounded hover:border-gray-700 hover:bg-white">
                    <i className="pl-4 pr-3 text-gray-400 fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search Reddit"
                        className="px-3 py-1 bg-transparent rounded h-7 focus:outline-none placeholder:text-sm"
                    />
                </div>
            </div>
            <div className="flex">
                {!loading &&
                    (authenticated ? (
                        <button
                            className="w-20 px-2 mr-2 text-sm text-center text-white bg-gray-400 rounded h-7"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    ) : (
                        <Fragment>
                            <Link href="/login">
                                <a className="w-20 px-2 pt-1 mr-2 text-sm text-center text-white bg-gray-400 rounded h-7">
                                    log in
                                </a>
                            </Link>
                            <Link href="/register">
                                <a className="w-20 px-2 pt-1 text-sm text-center text-white bg-gray-400 rounded h-7">
                                    sing up
                                </a>
                            </Link>
                        </Fragment>
                    ))}
            </div>
        </div>
    );
};

export default Navbar;
