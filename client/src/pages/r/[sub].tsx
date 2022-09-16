import Image from "next/image";
import { useRouter } from "next/router";
import React, {
    ChangeEvent,
    Fragment,
    useEffect,
    useRef,
    useState,
} from "react";
import useSWR from "swr";
import Sidebar from "../../components/Sidebar";
import { useAuthState } from "../../context/auth";
import Axios from "../../utils/axios";
import { Post } from "../../types";
import PostCard from "../../components/PostCard";
const subPage = () => {
    const [ownSub, setOwnSub] = useState(false);
    const { authenticated, user } = useAuthState();

    const router = useRouter();
    const subName = router.query.sub;
    const {
        data: sub,
        error,
        mutate: subMutate,
    } = useSWR(subName ? `/subs/${subName}` : null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const openFileInput = (type: string) => {
        console.log(type, ownSub);
        if (!ownSub) return;
        const fileInput = fileInputRef.current;
        if (fileInput) {
            fileInput.name = type;
            fileInput.click();
        }
    };

    const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
        console.log(event);
        if (event.target.files == null) return;
        const file = event.target.files[0];

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", fileInputRef.current!.name);

        try {
            await Axios.post(`/subs/${sub.name}/upload`, formData, {
                headers: { "Context-Type": "multipart/form-data" },
            });
        } catch (error: any) {
            console.log(error);
        }
    };

    let renderPosts;
    if (!sub) {
        renderPosts = <p className="text-lg text-center">로딩중...</p>;
    } else if (sub.posts.length === 0) {
        renderPosts = (
            <p className="text-lg text-center">
                아직 작성된 포스트가 없습니다.
            </p>
        );
    } else {
        renderPosts = sub.posts.map((post: Post) => (
            <PostCard key={post.identifier} post={post} subMutate={subMutate} />
        ));
    }

    useEffect(() => {
        if (!sub || !user) return;
        setOwnSub(authenticated && user.username === sub.username);
    }, [sub]);

    // NOTE: 존재하지 않은 커뮤니티면 홈화면으로 이동
    useEffect(() => {
        if (error?.error) {
            router.push("/");
        }
    }, [error]);

    return (
        <>
            {sub && (
                <Fragment>
                    <input
                        type="file"
                        hidden={true}
                        ref={fileInputRef}
                        onChange={uploadImage}
                    />
                    <div>
                        <div className="bg-gray-400">
                            {sub.bannerUrl ? (
                                <div
                                    className="h-56"
                                    style={{
                                        backgroundImage: `url(${sub.bannerUrl})`,
                                        backgroundRepeat: "no-repeat",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                    onClick={() => openFileInput("banner")}
                                ></div>
                            ) : (
                                <div className="h-20 bg-gray-400"></div>
                            )}
                        </div>
                        <div className="h-20 bg-white">
                            <div className="relative flex max-w-5xl px-5 mx-auto">
                                <div className="absolute" style={{ top: -15 }}>
                                    {sub.imageUrl && (
                                        <Image
                                            src={sub.imageUrl}
                                            alt="Community Image"
                                            width={70}
                                            height={70}
                                            onClick={() =>
                                                openFileInput("image")
                                            }
                                            className="rounded-full"
                                        />
                                    )}
                                </div>
                                <div className="pt-1 pl-24">
                                    <div className="flex items-center">
                                        <h1 className="mb-1 text-3xl font-bold">
                                            {sub.title}
                                        </h1>
                                    </div>
                                    <p className="text-sm font-bold text-gray-400">
                                        /r/{sub.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 포스트 & 사이드바 */}
                    <div className="flex max-w-5xl px-4 pt-5 mx-auto">
                        <div className="w-full md:mr-3 md:w-8/12">
                            {renderPosts}
                        </div>
                        <Sidebar sub={sub} />
                    </div>
                </Fragment>
            )}
        </>
    );
};

export default subPage;
