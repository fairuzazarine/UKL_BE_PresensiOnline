const Joi = require('joi')
    const moment = require('moment')

    const validateAttendance = (req, res, next) => {
        const rules = Joi.object().keys({
            user_id: Joi.number().required(),
            date: Joi.string().isoDate().required(),
            time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).required(),
            status: Joi.string().valid(hadir, izin, sakit, alpha).required()
        }).options({ abortEarly: false })

        let { error, value } = rules.validate(req.body)

        if (error != null) {
            let errMessage = error.details.map(it => it.message).join(",")
            return res.status(422).json({
                success: false,
                message: errMessage
            })
        }
        value.date = moment(value.date).format(YYYY-MM-DD)
        req.body = value
        next()
    }

    module.exports = { validateAttendance }