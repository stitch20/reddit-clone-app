import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { Post } from "../../../types";
import Axios from "../../../utils/axios";
export const PostCreate = () => {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const router = useRouter();
    const { sub: subName } = router.query;
    const submitPost = async (e: FormEvent) => {
        e.preventDefault();
        if (title.trim() === "" || !subName) return;

        try {
            const { data: post } = await Axios.post<Post>("/posts", {
                title: title.trim(),
                body,
                sub: subName,
            });
            router.push(`/r/${subName}/${post.identifier}/${post.slug}`);
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div className="flex flex-col justify-center pt-16">
            <div className="w-10/12 mx-auto md:w-96">
                <div className="p-4 bg-white rounded">
                    <h1 className="mb-3 text-lg">포스트 생성하기</h1>
                    <form onSubmit={submitPost}>
                        <div className="relative mb-2">
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300
                                rounded focus:outline-none focus:border-blue-500"
                                placeholder="Title"
                                maxLength={20}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <div
                                style={{ top: 10, right: 10 }}
                                className="absolute mb-2 text-sm text-gray-400 select-none"
                            >
                                {title.trim().length}/20
                            </div>
                        </div>
                        <textarea
                            rows={4}
                            placeholder="Description"
                            className="w-full p-3 border border-gray-300 rounded
                        focus:outline-none focus:border-blue-500"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end">
                            <button
                                className="px-4 py-1 text-sm font-semibold text-white
                             bg-gray-400 border rounded"
                            >
                                생성하기
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostCreate;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    try {
        const cookie = req.headers.cookie;
        if (!cookie) throw new Error("Missing auth token cookie");
        await Axios.get("/auth/me", { headers: { cookie } });
        return { props: {} };
    } catch (error) {
        res.writeHead(307, { Location: "/login" }).end();
        return { props: {} };
    }
};
