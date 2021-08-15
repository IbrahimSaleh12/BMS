const Joi = require('joi');
const ExpressError = require('./utils/ExpressError');

module.exports = (req, res, next) => {
  const postSchema = Joi.object({
    post: Joi.object({
      title: Joi.string().required(),
      textBody: Joi.string().required()
    }).required()
  })
  const { error } = postSchema.validate(req.body);

  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next();
  }
}