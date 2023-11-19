const express = require("express");
const router = express.Router();

const {
  getAllCurrencies,
  paymentAPIUP,
  makePaymentOnSite,
  makePaymentWithInvoice,
  handlePayment,
  checkPaymentStatus,
} = require("../controllers/defaultController");


// Routes for Payment actions
router.route("/").get(paymentAPIUP);

router.route("/getAllCurrencies").get(getAllCurrencies);

router.route("/paymentOnSite").post(makePaymentOnSite);

router.route("/paymentWithInvoice").post(makePaymentWithInvoice);

router.route("/handlePayment").post(handlePayment);

router.route("/checkPaymentStatus").get(checkPaymentStatus);

// Routes for Propeller Ads Integration

module.exports = router;
