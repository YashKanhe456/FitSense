const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            res.status(400);
            const errorMessages = error.details.map(detail => detail.message);
            const err = new Error('Validation Error');
            err.errors = errorMessages;
            return next(err);
        }
        req.body = value;
        next();
    };
};

module.exports = validate;
