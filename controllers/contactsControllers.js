import contactsService from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";
import { createContactSchema } from "../schemas/contactsSchemas.js";
import { updateContactSchema } from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res, next) => {
    try {
        const result = await contactsService.listContacts();
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getOneContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await contactsService.getContactById(id);
        if (!result) {
            throw HttpError(404);
        }
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await contactsService.removeContact(id);
        if (!result) {
            throw HttpError(404);
        }
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const createContact = async (req, res, next) => {
    try {
        const { error } = createContactSchema.validate(req.body);
        if (error) {
            throw HttpError(400);
        }
        const result = await contactsService.addContact(req.body);
        if (!result) {
            throw HttpError(404);
        }
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const updateContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error } = updateContactSchema.validate(req.body);
        if (error) {
            throw HttpError(400, "Body must have at least one field");
        }
        const result = await contactsService.updateContact(id, req.body);
        if (!result) {
            throw HttpError(404);
        }
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export default {
    getAllContacts,
    getOneContact,
    deleteContact,
    createContact,
    updateContact,
};
