import { isEmpty, validate } from "class-validator";
import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import User from "../entities/User";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";

const mapErrors = (errors: Object[]) => {
    return errors.reduce((prev: any, err: any) => {
        prev[err.property] = Object.entries(err.constraints)[0][1];
        return prev;
    }, {});
};

const me = (req: Request, res: Response) => {
    return res.json(res.locals.user);
};

const register = async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    try {
        let errors: any = {};
        // 중복 확인
        const emailUser = await User.findOneBy({ email });
        const usernameUser = await User.findOneBy({ username });

        if (emailUser) errors.email = "이미 해당 이메일 주소가 사용되었습니다.";
        if (usernameUser)
            errors.username = "이미 이 사용자 이름이 사용되었습니다.";

        if (Object.keys(errors).length > 0) {
            return res.status(400).json(errors);
        }

        // 사용자 생성
        const user = new User();
        user.email = email;
        user.username = username;
        user.password = password;

        // validation
        errors = await validate(user);

        if (errors.length > 0) return res.status(400).json(mapErrors(errors));

        await user.save();
        console.log(user);
        return res.json({ email, username });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
    }
};

const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        let errors: any = {};
        if (isEmpty(username))
            errors.username = "사용자 이름은 비워둘 수 없습니다.";
        if (isEmpty(password))
            errors.password = "비밀번호는 비워둘 수 없습니다.";
        if (Object.keys(errors).length > 0) {
            return res.status(400).json(errors);
        }

        const user = await User.findOneBy({ username });
        if (!user) {
            return res
                .status(404)
                .json({ username: "사용자 이름이 잘못되었습니다." });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res
                .status(401)
                .json({ password: "비밀번호가 잘못되었습니다." });
        }

        const token = jwt.sign({ username }, process.env.JWT_SECRET!);

        res.set(
            "Set-Cookie",
            cookie.serialize("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 60 * 50 * 24 * 7,
                path: "/",
            })
        );
        return res.json({ user: user.username, token });
    } catch (error) {
        console.log(error);
    }
};

const logout = async (_: Request, res: Response) => {
    res.set(
        "Set-Cookie",
        cookie.serialize("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date(0),
            path: "/",
        })
    );
    return res.status(200).json({ success: true });
};

const router = Router();
router.get("/me", userMiddleware, authMiddleware, me);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
export default router;
