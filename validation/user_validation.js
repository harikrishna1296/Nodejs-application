const expressValidator = require('express-validator/check');

exports.validateLogin = [
    expressValidator.check('user_name')
        .not().isEmpty().withMessage('Provide user name'),
    expressValidator.check('password')
        .not().isEmpty().withMessage('Provide password'),
    function (req, res, next) {
        let errors = expressValidator.validationResult(req).array();
        if (errors.length != 0) {
            res.json({ 'message': errors[0].msg, 'status': 201 });
        } else next()
    }
]

exports.validatenearby = [
    expressValidator.check('user_name')
        .not().isEmpty().withMessage('Provide user name'),
    expressValidator.check('type')
        .not().isEmpty().withMessage('Provide type'),
    function (req, res, next) {
        let errors = expressValidator.validationResult(req).array();
        if (errors.length != 0) {
            res.json({ 'message': errors[0].msg, 'status': 201 });
        } else next()
    }
]
