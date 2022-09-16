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
        <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between h-16 px-5 bg-white">
            <span className="text-2xl font-semibold text-gray-400">
                <Link href="/">Community</Link>
            </span>

            <div className="max-w-full px-4">
                <div className="relative flex items-center bg-gray-100 border rounded hover:border-gray-700 hover:bg-white">
                    <i className="pl-4 pr-3 text-gray-400 fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search"
                        className="px-3 py-1 bg-transparent rounded focus:outline-none"
                    />
                </div>
            </div>
            <div className="flex">
                {!loading &&
                    (authenticated ? (
                        <button
                            className="w-20 p-2 mr-2 text-center text-white bg-gray-400 rounded"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    ) : (
                        <Fragment>
                            <Link href="/login">
                                <a className="w-20 p-2 mr-2 text-center text-blue-500 border border-blue-500 rounded">
                                    log in
                                </a>
                            </Link>
                            <Link href="/register">
                                <a className="w-20 p-2 text-center text-white bg-gray-400 rounded">
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
