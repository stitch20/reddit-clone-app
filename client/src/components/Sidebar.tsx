import dayjs from "dayjs";
import Link from "next/link";
import { useAuthState } from "../context/auth";
import { Sub } from "../types";

export const Sidebar = ({ sub }: { sub: Sub }) => {
    const { authenticated } = useAuthState();
    return (
        <div className="hidden w-4/12 ml-3 md:block">
            <div className="bg-white border rounded">
                <div className="p-3 bg-gray-400 rounded-t">
                    <p className="font-semibold text-white">커뮤니티 대해서</p>
                </div>
                <div className="p-3">
                    <p className="mb-3 text-base">{sub?.description}</p>
                    <div className="flex mb-3 text-sm font-medium">
                        <div className="w-1/2">
                            <p>100</p>
                            <p>멤버</p>
                        </div>
                    </div>
                    <p className="my-3">
                        <i className="mr-2 fas fa-birthday-cake"></i>
                        {dayjs(sub.createdAt).format("D MMM YYYY")}
                    </p>
                    {authenticated && (
                        <div className="mx-0 my-2">
                            <Link href={`/r/${sub.name}/create`}>
                                <a className="w-full p-2 text-sm text-white bg-gray-400 rounded">
                                    포스트 생성
                                </a>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
