import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import InputGroup from "../components/InputGroup";
import Axios from "../utils/axios";
import { useRouter } from "next/router";
import { useAuthDispatch, useAuthState } from "../context/auth";

export const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<any>({});
  const dispatch = useAuthDispatch();

  const router = useRouter();

  const { loading, authenticated } = useAuthState();
  if (authenticated) router.push("/");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const res = await Axios.post("/auth/login", {
        username,
        password,
      });
      dispatch("LOGIN", res.data?.user);
      router.push("/");
    } catch (error: any) {
      console.log(error);
      setErrors(error?.response?.data || {});
    }
  };
  return (
    <div className="bg-white">
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="w-10/12 mx-auto md:w-96">
          <h1 className="mb-2 text-lg font-medium">로그인</h1>
          <form onSubmit={handleSubmit}>
            <InputGroup
              placeholder="Username"
              value={username}
              setValue={setUsername}
              error={errors.username}
            />
            <InputGroup
              placeholder="Password"
              value={password}
              type="password"
              setValue={setPassword}
              error={errors.password}
            />
            <button
              className="w-full py-3 mb-1 text-xs font-bold text-white
              uppercase bg-gray-400 border border-gray-400 rounded"
            >
              로그인
            </button>
          </form>
          <small>
            아직 아이디가 없나요?
            <Link href="/register">
              <a className="ml-2 text-blue-500 uppercase">회원가입</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;
