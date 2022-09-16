import axios from "axios";
import type { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { useAuthState } from "../context/auth";
import { Post, Sub } from "../types";
import useSWRInfinite from "swr/infinite";
import PostCard from "../components/PostCard";
import { useEffect, useState } from "react";
const Home: NextPage = () => {
    const address =
        process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api/subs/sub/topSubs";
    const { data: topSubs } = useSWR<Sub[]>(address);
    const { authenticated } = useAuthState();

    const getKey = (pageIndex: number, previousPageData: Post[]) => {
        if (previousPageData && !previousPageData.length) return null;
        return `/posts?page=${pageIndex}&count=${3}`;
    };

    const {
        data,
        error,
        size: page,
        setSize: setPage,
        isValidating,
        mutate,
    } = useSWRInfinite<Post[]>(getKey);

    const isInitialLoading = !data && !error;
    const posts: Post[] = data ? ([] as Post[]).concat(...data) : [];

    // 스크롤 기능
    const [observedPost, setObservedPost] = useState("");

    useEffect(() => {
        if (!posts || posts.length === 0) return;
        const id = posts[posts.length - 1].identifier;
        if (id !== observedPost) {
            setObservedPost(id);
            observeElement(document.getElementById(id));
        }
    }, [posts]);

    const observeElement = (element: HTMLElement | null) => {
        if (!element) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting === true) {
                    console.log("Reached bottom of post");
                    setPage(page + 1);
                    observer.unobserve(element);
                }
            },
            { threshold: 1 }
        );
        observer.observe(element);
    };

    return (
        <div className="flex max-w-5xl px-4 pt-5 mx-auto">
            {/* Post List */}
            <div className="w-full md:mr-3 md:w-8/12">
                {isInitialLoading && (
                    <p className="text-lg text-center">Loading..</p>
                )}
                {posts?.map((post) => (
                    <PostCard
                        post={post}
                        key={post.identifier}
                        subMutate={mutate}
                    />
                ))}
                {isValidating && posts.length > 0 && (
                    <p className="text-lg text-center">Loading More..</p>
                )}
            </div>
            <div className="hidden w-4/12 ml-3 md:block">
                <div className="bg-white border rounded">
                    <div className="p-4 border-b">
                        <p className="text-lg font-semibold text-center">
                            상위 커뮤니티
                        </p>
                    </div>
                    <div>
                        {topSubs?.map((sub) => (
                            <div
                                key={sub.name}
                                className="flex items-center px-4 py-2 text-xs border-b"
                            >
                                <Link href={`/r/${sub.name}`}>
                                    <a>
                                        <Image
                                            src={sub.imageUrl}
                                            className="rounded-full cursor-pointer"
                                            alt="Sub"
                                            width={24}
                                            height={24}
                                        />
                                    </a>
                                </Link>
                                <Link href={`/r/${sub.name}`}>
                                    <a className="ml-2 font-bold hover:cursor-pointer">
                                        /r/{sub.name}
                                    </a>
                                </Link>
                                <p className="ml-auto font-med">
                                    {sub.postCount}
                                </p>
                            </div>
                        ))}
                    </div>
                    {authenticated && (
                        <div className="w-full py-6 text-center">
                            <Link href="/subs/create">
                                <a className="w-full p-2 text-center text-white bg-gray-400 rounded">
                                    커뮤니티 만들기
                                </a>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
