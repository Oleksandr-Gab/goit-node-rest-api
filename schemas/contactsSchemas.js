import Joi from "joi";

export const contactCreateSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    owner: Joi.string().required(),
});

export const contactFavoriteSchema = Joi.object({
    favorite: Joi.boolean().required(),
});

export const contactUpdateSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
    favorite: Joi.boolean(),
});

export default {
    contactUpdateSchema,
    contactFavoriteSchema,
    contactCreateSchema,
};
