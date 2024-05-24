import HttpError from "../helpers/HttpError.js";
import Contact from "../models/contact.js";

async function auditAcces(req, res, next) {
    const { id } = req.params;
    try {
        const contact = await Contact.findById(id);
        if (contact === null) {
            throw HttpError(404);
        }

        if (contact.owner.toString() !== req.user.id) {
            throw HttpError(404);
        }
    } catch (error) {
        next(error);
    }

    next();
}

export default auditAcces;
