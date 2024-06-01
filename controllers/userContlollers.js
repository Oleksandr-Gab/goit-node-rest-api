import HttpError from "../helpers/HttpError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as fs from "node:fs/promises";
import path from "node:path";
import gravatar from "gravatar";
import Jimp from "jimp";
import crypto from "node:crypto"

import mail from "../helpers/sendEmail.js"
import User from "../models/user.js";
import {
  userLoginSchema,
  userRegisterSchema,
  verifySchema,
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
    const verifyToken = crypto.randomUUID();

    const user = await User.create({
      email,
      password: passwordHash,
      avatarURL,
      verificationToken: verifyToken,
    });

    mail.sendMail({
      to: email,
      subject: "Verify email",
      html: `<p>Hello!</p>
              <p>This is a test email to verify the email sending functionality.</p>
              <p>Please click the button below to verify your email address:</p>
              <p><a href="${BASE_URL}/api/users/verify/${verificationToken}" 
                  style="display:inline-block; padding:10px 20px; font-size:18px; color: #000000; background-color:#e6ffff; text-align:center; text-decoration:none; border-radius:8px;">
                Verify Email Address
              </a></p>
              <p>Thank you!</p>
              <p>Best regards</p>`,
    });

    res
      .status(201)
      .send({ user: { email: user.email, subscription: user.subscription, avatarURL: user.avatarURL } });
  } catch (error) {
    next(error);
  }
}

async function verifyEmail(req, res, next) {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken: verificationToken });

    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }

    await User.findOneAndUpdate(
      { verificationToken: verificationToken },
      { verify: true, verificationToken: null }
    );

    res.status(200).send({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
}

async function verify(req, res, next) {
  const { email } = req.body;

  const { error } = verifySchema.validate(req.body);
  if (typeof error !== "undefined") {
    return res.status(400).send({ message: error.message });
  }

  if (!email) {
    return res.status(400).json({ message: "missing required field email" });
  }

  try {
    const user = await User.findOne({ email: email });
    const verifyToken = user.verificationToken;

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

      res.status(200).send({ message: "Verification email sent" });
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

    if (user.verify === false) {
      return res.status(401).send({ message: "Confirm your email" });
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
  verifyEmail,
  verify,
  loginUser,
  logout,
  currentUser,
  usersAvatar,
};