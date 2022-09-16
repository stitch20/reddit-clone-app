import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { KeyedMutator } from "swr";
import { useAuthState } from "../context/auth";
import { Comment, Post } from "../types";
import Axios from "../utils/axios";
interface PostCardProps {
    post: Post;
    subMutate?: KeyedMutator<any>;
}

export const PostCard = ({
    post: {
        identifier,
        slug,
        title,
        body,
        subName,
        createdAt,
        voteScore,
        userVote,
        commentCount,
        url,
        username,
        sub,
    },
    subMutate,
}: PostCardProps) => {
    const { authenticated } = useAuthState();
    const router = useRouter();
    const vote = async (value: number) => {
        if (!authenticated) router.push("/login");

        if (value === userVote) value = 0;

        try {
            await Axios.post("/votes", {
                identifier,
                slug,
                value,
            });
            if (subMutate) {
                subMutate();
            }
        } catch (error) {
            console.log(error);
        }
    };
    const isInSubPage = router.pathname === "/r/[sub]";
    return (
        <div
            key={identifier}
            className="flex mb-4 bg-white rounded"
            id={identifier}
        >
            {/* Vote 부분 */}
            <div className="w-10 py-3 text-center rounded-l">
                <div
                    className="w-6 mx-auto text-gray-400 rounded cursor-pointer
                hover:bg-gray-300 hover:text-red-500"
                    onClick={() => vote(1)}
                >
                    <i
                        className={classNames("fas fa-arrow-up", {
                            "text-red-500": userVote === 1,
                        })}
                    ></i>
                </div>
                <p className="text-xs font-bold">{voteScore}</p>
                <div
                    className="w-6 mx-auto text-gray-400 rounded cursor-pointer
                hover:bg-gray-300 hover:Text-blue-600"
                    onClick={() => vote(-1)}
                >
                    <i
                        className={classNames("fas fa-arrow-down", {
                            "text-blue-600": userVote === -1,
                        })}
                    ></i>
                </div>
            </div>
            {/* 포트스 데이터 부분 */}
            <div className="w-full p-2">
                <div className="flex items-center">
                    {!isInSubPage && (
                        <>
                            <Link href={`/r/${subName}`} passHref>
                                <Image
                                    src={sub!.imageUrl}
                                    className="w-6 h-6 mr-1 rounded-full cursor-pointer"
                                    width={12}
                                    height={12}
                                    alt="sub"
                                />
                            </Link>
                            <Link href={`/r/${subName}`}>
                                <a className="text-xs font-bold cursor-pointer hover:underline">
                                    /r/{subName}
                                </a>
                            </Link>
                            <span className="mx-1 text-xs text-gray-500">
                                •
                            </span>
                        </>
                    )}
                    <p className="text-xs text-gray-500">
                        Posted by
                        <Link href={`/u/${username}`}>
                            <span className="mx-1 hover:underline">
                                /u/{username}
                            </span>
                        </Link>
                        <Link href={url}>
                            <span className="mx-1 hover:underline">
                                {dayjs(createdAt).format("YYYY-MM-DD HH:mm")}
                            </span>
                        </Link>
                    </p>
                </div>
                <Link href={url}>
                    <a className="my-1 text-lg font-medium">{title}</a>
                </Link>
                {body && <p className="my-1 text-sm">{body}</p>}

                <div className="flex">
                    <Link href={url} passHref>
                        <div>
                            <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                            <span>{commentCount}</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
