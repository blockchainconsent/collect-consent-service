// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const express = require("express");

const consentController = require("../controllers/consent-request");

const requestLogger = require("../middleware/request-logger");

const router = express.Router();

router.get("/", requestLogger, consentController.getConsentRequest);
router.post("/", requestLogger, consentController.postConsentRequest);

module.exports = router;
