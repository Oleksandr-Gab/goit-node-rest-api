import HttpError from "../helpers/HttpError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as fs from "node:fs/promises";
import path from "node:path";
import gravatar from "gravatar";
import Jimp from "jimp";

import User from "../models/user.js";
import {
  userLoginSchema,
  userRegisterSchema,
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
    const avatarURL = gravatar.url(email);

    const user = await User.create({
      email,
      password: passwordHash,
      avatarURL,
    });

    res
      .status(201)
      .send({ user: { email: user.email, subscription: user.subscription, avatarURL: user.avatarURL } });
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
      { id: user._id, email: user.email, subscription: user.subscription },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 120 }
    );

    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).send({
      token: token,
      user: { email: email, subscription: user.subscription, avatarURL: user.avatarURL},
    });
  } catch (error) {
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

async function usersAvatar(req, res, next) {
  try {
    if(!req.file) {
      return res.status(400).send({message: "We need image to change avatar!"})
    }

    const resize = await Jimp.read(req.file.path);
    resize.resize(250, 250);
    resize.write(path.resolve(req.file.path));

    await fs.rename(
      req.file.path,
      path.join("public/avatars", req.file.filename)
    );

    const user = await User.findOneAndUpdate(
      req.user._id,
      { avatarURL: `/avatars/ ${req.file.filename}` },
      { new: true }
    );

    if (user === null) {
      return res.status(401).send({ message: "Not authorized" });
    }

    res.status(200).send({ avatarURL: user.avatarURL });
  } catch (error) {
    next(error);
  }
}

export default {
  registerUser,
  loginUser,
  logout,
  currentUser,
  usersAvatar,
};