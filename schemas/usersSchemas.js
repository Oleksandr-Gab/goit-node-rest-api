import Joi from "joi";

export const userRegisterSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const userLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const verifySchema = Joi.object({
    email: Joi.string().email().required(),
  });
