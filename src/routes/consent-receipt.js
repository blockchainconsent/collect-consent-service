// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const express = require("express");
const requestLogger = require("../middleware/request-logger");

const consentController = require("../controllers/consent-receipt");

const router = express.Router();

router.get("/", requestLogger, consentController.queryConsentReceipts);
router.post("/", requestLogger, consentController.postConsentReceipt);

module.exports = router;
