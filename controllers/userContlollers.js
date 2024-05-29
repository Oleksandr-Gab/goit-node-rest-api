import HttpError from "../helpers/HttpError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user.js";
import {
    userRegisterSchema,
    userLoginSchema,
} from "../schemas/usersSchemas.js";

async function registerUser(req, res, next) {
    const { email, password } = req.body;

    const { error } = userRegisterSchema.validate(req.body);
    if (typeof error !== "undefined") {
        return res.status(400).send({message: error.message});
    }

    try {
        const newUser = await User.findOne({ email });

        if (newUser !== null) {
            throw HttpError(409, "Email in use");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({email, password: passwordHash });

        res.status(201).send({
            user: {
                email: user.email,
                subscription: user.subscription,
            },
        });
    } catch (error) {
        next(error);
    }
}

async function loginUser(req, res, next) {
    const { email, password } = req.body;

    const { error } = userLoginSchema.validate(req.body);
    if (typeof error !== "undefined") {
        return res.status(400).send({message: error.message});
    }

    try {
        const user = await User.findOne({ email });

        if (user === null) {
            return res.status(401).send({ message: "Email or password is wrong" });
            }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch === false) {
            return res.status(401).send({ message: "Email or password is wrong" });
            }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                subscription: user.subscription,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        await User.findByIdAndUpdate(user._id, { token });

        res.status(200).send({
            token: token,
            user: { email: email, subscription: user.subscription },
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

async function logout(req, res, next) {
    try {
        await User.findByIdAndUpdate(req.user.id, { token: null });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
}

async function currentUser(req, res) {
    const { email, subscription } = req.user;

    res.send({ email, subscription });
}

export default {
    registerUser,
    loginUser,
    logout,
    currentUser,
};
