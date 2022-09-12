import Link from "next/link";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useState } from "react";
import InputGroup from "../components/InputGroup";
import Axios from "../utils/axios";
import { useAuthDispatch, useAuthState } from "../context/auth";
const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<any>({});
  const dispatch = useAuthDispatch();
  const router = useRouter();

  const { loading, authenticated } = useAuthState();
  if (authenticated) router.push("/");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const res = await Axios.post("/auth/register", {
        email,
        password,
        username,
      });
      console.log(res);
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      setErrors(error?.response?.data || {});
    }
    console.log(event);
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="w-10/12 mx-auto md:w-96">
          <h1 className="mb-2 text-lg font-medium">회원가입</h1>
          <form onSubmit={handleSubmit}>
            <InputGroup
              placeholder="Email"
              value={email}
              setValue={setEmail}
              error={errors.email}
            />
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
            <button className="w-full py-3 mb-1 text-xs font-bold text-white uppercase bg-gray-400 border border-gray-400 rounded">
              Sign up
            </button>
          </form>
          <small>
            이미 가입하셨나요?
            <Link href="/login">
              <a className="ml-2 text-blue-500 uppercase">로그인</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Register;
