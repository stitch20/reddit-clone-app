import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import User from "../entities/User";
export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get Token in Cookie
        const token = req.cookies.token;
        if (!token) return next();

        // Token Decode
        const { username }: any = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        );

        // Get Requet User Object
        const user = await User.findOneBy({ username });

        // 유저 정보를 Response객체에 저장
        res.locals.user = user;
        return next();
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            return next();
        }
        console.log(error);
        return res.status(400).json({ error: "Something went wrong" });
    }
};
