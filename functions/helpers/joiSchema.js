const Joi = require("joi");

exports.paymentOnSiteSchema = Joi.object({
  price_amount: Joi.number().required(),
  price_currency: Joi.string().max(3).required(),
  pay_currency: Joi.string().required(),
});

exports.paymentWithInvoiceSchema = Joi.object({
  price_amount: Joi.number().required(),
  price_currency: Joi.string().max(3).required(),
});

exports.checkPaymentStatus = Joi.object({
  paymentId: Joi.number().required(),
});
