import HttpError from "../helpers/HttpError.js";

const validateBody = (schema) => {
    const func = (res, req, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            next(HttpError(400));
        }
        next();
    };
    return func;
};

export default validateBody;
