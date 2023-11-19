/* eslint-disable max-len */
const axios = require("axios");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

const {paymentOnSiteSchema, paymentWithInvoiceSchema, checkPaymentStatus} = require("../helpers/joiSchema");

const apiKey = process.env.NOWPAYMENT_API_KEY;
const callbackURL = "https://nowpayments.io";

initializeApp();
const db = getFirestore();


exports.paymentAPIUP = async (req, res) => {
  res.status(200).send("Payment Server is up and running.");
};

exports.getAllCurrencies = async (req, res) => {
  const options= {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://api.nowpayments.io/v1/full-currencies",
    headers: {
      "x-api-key": apiKey,
    },
  };

  axios(options)
      .then((response) => {
        const currencies = response.data.currencies;
        res.status(200).json(currencies);
      })
      .catch((error) => {
        console.error("Error fetching currencies:", error);
        res.status(500).send("Error fetching currencies");
      });
};


exports.makePaymentOnSite = async (req, res) => {
  const {error} = paymentOnSiteSchema.validate(req.body);

  if (error) {
    res.status(400).json({res_sts: false, res_msg: error["details"][0]["message"]});
    return;
  }

  const data = JSON.stringify({
    "price_amount": req.body.price_amount,
    "price_currency": req.body.price_currency,
    "pay_currency": req.body.pay_currency,
    "ipn_callback_url": callbackURL,
    "order_description": "Payment for Blockchain-Ads Platform",
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.nowpayments.io/v1/payment",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    data: data,
  };

  axios(config)
      .then((response) => {
        const paymentRes = response.data;
        res.status(200).json(paymentRes);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("An error occured while processing payment");
      });
};


exports.makePaymentWithInvoice = async (req, res) => {
  const {error} = paymentWithInvoiceSchema.validate(req.body);

  if (error) {
    res.status(400).json({res_sts: false, res_msg: error["details"][0]["message"]});
    return;
  }

  const data = JSON.stringify({
    "price_amount": req.body.price_amount,
    "price_currency": req.body.price_currency,
    "order_description": "Payment for Blockchain-Ads Platform",
    "ipn_callback_url": callbackURL,
    "success_url": "https://nowpayments.io",
    "cancel_url": "https://nowpayments.io",
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.nowpayments.io/v1/invoice",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    data: data,
  };

  axios(config)
      .then((response) => {
        const paymentRes = response.data;
        res.status(200).json(paymentRes);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("An error occured while processing payment");
      });
};


exports.handlePayment = async (req, res) => {
  try {
    // Extract the payment data from the request body
    const paymentData = req.body;
    console.log(paymentData);

    if (paymentData.payment_status === "finished") {
      // update firestore with the payment
      try {
        const existingUserDocument = (await db.collection("users")
            .doc(paymentData.payment_extra_id).get(paymentData.payment_extra_id)).data();

        let currentBalance = existingUserDocument.balance ? existingUserDocument.balance : 0;

        currentBalance += paymentData.price_amount;

        await db.collection("users")
            .doc(paymentData.payment_extra_id)
            .set(
                {balance: currentBalance}, {merge: true},
            );
      } catch (error) {
        console.log(error);
      }
    }
    // Respond with a success message
    res.status(200)
        .send("Payment webhook received and processed successfully");
  } catch (error) {
    console.error("Error handling payment webhook:", error);
    res.status(500).send("Error handling payment webhook");
  }
};


exports.checkPaymentStatus = async (req, res) => {
  const {error} = checkPaymentStatus.validate(req.body);

  if (error) {
    res.status(400).json({res_sts: false, res_msg: error["details"][0]["message"]});
    return;
  }

  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://api.nowpayments.io/v1/payment/${req.body.paymentId}`,
    headers: {
      "x-api-key": apiKey,
    },
  };

  axios(config)
      .then((response) => {
        const paymentStatusResult = response.data;
        res.status(200).json(paymentStatusResult);
      })
      .catch((error) => {
        console.error(error.data.data);
        res.status(500).send("Error checking payment status");
      });
};

