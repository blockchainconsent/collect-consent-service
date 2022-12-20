// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const { getErrorInfo } = require("../utils");
const logger = require("../config/logger").getLogger(
  "consent-request-controller"
);
const constants = require("../helpers/constants");
const helper = require("../helpers/consent-request-helper");

const onlyAlphaNumeric = /^[a-zA-Z0-9\-]+$/;

const consentCustodianHeader = constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID;
const requestIDHeader = constants.REQUEST_HEADERS.CONSENT_REQUEST_ID;

exports.getConsentRequest = async (req, res) => {
  logger.info("Get Consent Request");

  try {
    // extract consent custodian ID
    const custodianID = req.headers[consentCustodianHeader];
    if (!custodianID) {
      const errMsg = `Missing ${consentCustodianHeader} header parameter`;
      logger.error(errMsg);
      return res.status(400).json({ message: errMsg, status: 400 });
    }

    //  extract consent request ID
    const requestID = req.headers[requestIDHeader];
    if (!requestID) {
      const errMsg = `Missing ${requestIDHeader} header parameter`;
      logger.error(errMsg);
      return res.status(400).json({ message: errMsg, status: 400 });
    }
    if (!requestID.match(onlyAlphaNumeric)) {
      const errMsg = `Only alphanumeric characters allowed for ${requestIDHeader} header parameter`;
      logger.error(errMsg);
      return res.status(400).json({ message: errMsg, status: 400 });
    }

    // TODO: investigate sanitizing the consent request id

    // TODO: extract token

    // TODO: get caller ID

    try {
      const consentRequest = await helper.getConsentRequest(
        custodianID,
        requestID
      );

      logger.info(`Successfully retrieved consent request ${requestID}`);
      res.status(200).json({
        message: `Successfully retrieved consent request ${requestID}`,
        payload: consentRequest,
        status: 200,
      });
    } catch (err) {
      const { errorStatus, errorMsg } = getErrorInfo(err);
      logger.error(
        `Failed to retrieve consent request ${requestID}: ${errorMsg}`
      );
      return res
        .status(errorStatus)
        .json({ message: errorMsg, status: errorStatus });
    }
  } catch (error) {
    const { errorStatus, errorMsg } = getErrorInfo(error);
    logger.error(`GET /consent/request failed: ${errorMsg}`);
    return res
      .status(errorStatus)
      .json({ message: errorMsg, status: errorStatus });
  }
};

exports.postConsentRequest = async (req, res) => {
  try {
    if (!req.body) {
      const error = new Error("missing request body");
      error.status = 400;
      throw error;
    }
    const { consentRequest } = req.body;
    const consentCustodian = req.headers[consentCustodianHeader];

    const payload = await helper.postConsentRequest(
      consentCustodian,
      consentRequest
    );

    return res.status(201).json({
      message: "Consent request successfully created",
      status: 201,
      payload,
    });
  } catch (error) {
    const { errorStatus, errorMsg } = getErrorInfo(error);
    logger.error(`POST /consent/request failed: ${errorMsg}`);
    return res
      .status(errorStatus)
      .json({ message: errorMsg, status: errorStatus });
  }
};
