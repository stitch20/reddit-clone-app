import { useEffect } from "react";
import Axios from "../utils/axios";
const Test = () => {
    const a = { a: { b: "c" } };
    useEffect(() => {
        async function testAxios() {
            try {
                const sub = await Axios.get("/subs/test");
                console.log(sub);
            } catch (err) {
                console.log(err);
            }
        }
        testAxios();
    }, []);
    return <div></div>;
};
export default Test;
