import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import User from "../models/user.js";

async function auditToken(req, res, next) {
    const { authorization } = req.headers;

    if (typeof authorization === "undefined") {
        return res.status(401).send({ message: "Not authorized" });
    }

    const [bearer, token] = authorization.split(" ", 2);

    if (bearer !== "Bearer" || !token) {
        return res.status(401).send({ message: "Not authorized" });
    }

    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(id);

        if (user.token === null) {
            return next(HttpError(401));
        }

        if (!user) {
            return next(HttpError(401));
        }

        req.user = user;

        next();
    } catch (error) {
        next(error);
    }
}

export default auditToken;
