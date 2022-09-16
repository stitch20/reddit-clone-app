import { NextFunction, Request, Response, Router } from "express";
import { isEmpty } from "class-validator";
import { AppDataSource } from "../data-source";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import Sub from "../entities/Sub";
import User from "../entities/User";
import Post from "../entities/Post";
import multer, { FileFilterCallback } from "multer";
import { makeId } from "../utils/helpers";
import path from "path";
import fs from "fs";
const createSub = async (req: Request, res: Response, next: NextFunction) => {
    const { name, title, description } = req.body;
    try {
        let errors: any = {};
        if (isEmpty(name)) errors.name = "이름은 비워둘 수 없습니다.";
        if (isEmpty(title)) errors.title = "제목은 비워둘 수 없습니다.";

        // 같은 이름의 Sub가 존재하는 지 확인
        // NOTE: TypeORM QueryBuilder
        // CODE: const sub = await AppDataSource.getRepository(Sub)
        //                  .createQueryBuilder("sub")
        //                  .where("lower(sub.name) = :name", { name: name.toLowerCase() })
        //                  .getOne();
        const sub = await Sub.findOneBy({ name: name.toLowerCase() });

        if (sub) errors.name = "서브가 이미 존재합니다.";

        if (Object.keys(errors).length > 0) {
            throw errors;
        }
    } catch (error) {
        console.log(error);
        return res.status(300).json(error);
    }

    try {
        const user: User = res.locals.user;

        // 새로운 Sub Object 생성
        const sub = new Sub();
        sub.name = name;
        sub.user = user;
        sub.title = title;
        sub.description = description;

        await sub.save();

        return res.json(sub);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." });
    }
};

const topSubs = async (req: Request, res: Response) => {
    try {
        const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn", 'https://www.gravatar.com/avatar?d=mp&f=y')`;
        const subs = await AppDataSource.createQueryBuilder()
            .select(
                `s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
            )
            .from(Sub, "s")
            .leftJoin(Post, "p", `s.name=p."subName"`)
            .groupBy('s.title, s.name, "imageUrl"')
            .orderBy(`"postCount"`, "DESC")
            .limit(5)
            .execute();
        return res.json(subs);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
};

const getSub = async (req: Request, res: Response) => {
    const name = req.params.name;

    try {
        const sub = await Sub.findOneByOrFail({ name });

        const posts = await Post.find({
            where: { subName: sub.name },
            order: { createdAt: "DESC" },
            relations: ["comments", "votes"],
        });
        sub.posts = posts;

        if (res.locals.user) {
            sub.posts.forEach((p) => p.setUserVote(res.locals.user));
        }
        return res.json(sub);
    } catch (error) {
        return res.status(404).json({ error: "서브를 찾을 수 없음." });
    }
};

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = res.locals.user;

    try {
        const sub: Sub = await Sub.findOneByOrFail({ name: req.params.name });
        if (sub.username !== user.username) {
            return res
                .status(403)
                .json({ error: "이 커뮤니티를 소유하고 있지 않습니다." });
        }
        res.locals.sub = sub;
        return next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." });
    }
};

const upload = multer({
    storage: multer.diskStorage({
        destination: "public/images",
        filename: (_, file, callback) => {
            const name = makeId(15);
            callback(null, name + path.extname(file.originalname));
        },
    }),
    fileFilter: (_, file: any, callback: FileFilterCallback) => {
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
            callback(null, true);
        } else {
            callback(new Error("이미지가 아닙니다."));
        }
    },
});

const uploadSubImage = async (req: Request, res: Response) => {
    const sub: Sub = res.locals.sub;
    try {
        const type: string = req.body.type;

        if (type !== "image" && type !== "banner") {
            if (!req.file?.path) {
                return res.status(400).json({ error: "유효하지 않은 파일" });
            }

            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "잘못된 유형" });
        }

        let oldImageUrn: string = "";

        if (type == "image") {
            oldImageUrn = sub.imageUrn || "";
            sub.imageUrn = req.file?.filename || "";
        } else if (type == "banner") {
            oldImageUrn = sub.bannerUrn || "";
            sub.bannerUrn = req.file?.filename || "";
        }
        await sub.save();

        if (oldImageUrn !== "") {
            const fullFileName = path.resolve(
                process.cwd(),
                "public",
                "images",
                oldImageUrn
            );

            fs.unlinkSync(fullFileName);
        }
        return res.json(sub);
    } catch (error) {
        console.log(Error);
        return res.status(500).json({ error: "Something went wrong" });
    }
};

const test = async (req: Request, res: Response) => {
    try {
        const sub = await Sub.findOneBy({ name: "test" });
        return res.status(200).json(sub);
    } catch (error) {
        console.log(error);
        return res.status(500);
    }
};

const router = Router();
router.get("/:name", userMiddleware, getSub);
router.post("/", userMiddleware, authMiddleware, createSub);
router.get("/test", test);
router.get("/sub/topsubs", topSubs);
router.post(
    "/:name/upload",
    userMiddleware,
    authMiddleware,
    ownSub,
    upload.single("file"),
    uploadSubImage
);
export default router;
