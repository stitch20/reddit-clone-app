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
import { useAuthState } from "../../context/auth";
import Axios from "../../utils/axios";
const subPage = () => {
    const [ownSub, setOwnSub] = useState(false);
    const { authenticated, user } = useAuthState();

    const fetcher = async (url: string) => {
        try {
            const res = await Axios.get(url);
            return res.data;
        } catch (error: any) {
            console.log(error);
            throw error.response.data;
        }
    };

    const router = useRouter();
    const subName = router.query.sub;
    const { data: sub, error } = useSWR(
        subName ? `/subs/${subName}` : null,
        fetcher
    );

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

    useEffect(() => {
        if (!sub || !user) return;
        setOwnSub(authenticated && user.username === sub.username);
    }, [sub]);

    return (
        <>
            {sub && (
                <Fragment>
                    {JSON.stringify(sub)}
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
                    <div className="flex max-w-5xl px-4 pt-5 mx-auto">
                        Posts & Sidebar
                    </div>
                </Fragment>
            )}
        </>
    );
};

export default subPage;
