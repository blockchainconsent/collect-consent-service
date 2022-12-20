// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const { getErrorInfo } = require("../utils");
const logger = require("../config/logger").getLogger(
  "consent-receipt-controller"
);
const constants = require("../helpers/constants");
const helper = require("../helpers/consent-receipt-helper");
const credentialHelper = require("../helpers/credential-helper");
const requestHelper = require("../helpers/consent-request-helper");

const consentCustodianHeader = constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID;
const dataCustodianHeader = constants.REQUEST_HEADERS.DATA_CUSTODIAN_ID;
const dataRecipientHeader = constants.REQUEST_HEADERS.DATA_RECIPIENT_ID;
const performerIDHeader = constants.REQUEST_HEADERS.PERFORMER_ID;

exports.queryConsentReceipts = async (req, res) => {
  logger.info("Query Consent Receipts");

  try {
    const consentCustodian = req.headers[consentCustodianHeader];
    const dataCustodian = req.headers[dataCustodianHeader];
    const dataRecipient = req.headers[dataRecipientHeader];
    const performer = req.headers[performerIDHeader];
    const { purpose, datatype } = req.query;

    // TODO: extract token

    // TODO: get caller ID

    try {
      const paramData = {
        consentCustodian,
        dataCustodian,
        dataRecipient,
        performer,
        purpose,
        datatype,
      };
      const consentReceipts = await helper.queryConsentReceipts(paramData);

      logger.info("Successfully queried consent receipts");
      res.status(200).json({
        message: "Successfully queried consent receipts",
        payload: consentReceipts,
        status: 200,
      });
    } catch (err) {
      const { errorStatus, errorMsg } = getErrorInfo(err);
      logger.error(`Failed to query consent receipts: ${errorMsg}`);
      return res
        .status(errorStatus)
        .json({ message: errorMsg, status: errorStatus });
    }
  } catch (error) {
    const { errorStatus, errorMsg } = getErrorInfo(error);
    logger.error(`GET /consent/receipt failed: ${errorMsg}`);
    return res
      .status(errorStatus)
      .json({ message: errorMsg, status: errorStatus });
  }
};

exports.postConsentReceipt = async (req, res) => {
  logger.info("Post Consent Receipt");

  try {
    const custodianID = req.headers[consentCustodianHeader];
    const request = req.body.consentRequest;
    const token = req.headers.authorization;

    // TODO: get caller ID

    // get consent custodian's configuration
    let custodianConfig;
    try {
      custodianConfig = await credentialHelper.getOrgConfig(custodianID, token);
    } catch (err) {
      const { errorStatus, errorMsg } = getErrorInfo(err);
      logger.error(
        `Failed to get consent custodian configuration: ${errorMsg}`
      );
      return res
        .status(errorStatus)
        .json({ message: errorMsg, status: errorStatus });
    }

    const issuerID = custodianConfig.issuerID;
    const schemaID = custodianConfig.consentSchemaID;
    const mapperName = custodianConfig.consentMapperName;

    // get consent custodian's consent schema's mapper
    let consentMapper;
    try {
      consentMapper = await credentialHelper.getConsentMapper(
        mapperName,
        token
      );
    } catch (err) {
      const { errorStatus, errorMsg } = getErrorInfo(err);
      logger.error(`Failed to get consent mapper: ${errorMsg}`);
      return res
        .status(errorStatus)
        .json({ message: errorMsg, status: errorStatus });
    }

    let consentPayload;
    try {
      consentPayload = helper.prepareConsentPayload(consentMapper, request);
    } catch (err) {
      logger.error("Failed to prepare consent payload");
      const status = err.status || 400;
      return res.status(status).json({ message: err.message, status });
    }

    // TODO: login

    // issue consent verifiable credential
    let consentReceipt;
    try {
      // TODO: Consider getting token from HP instead of using performer's token
      consentReceipt = await credentialHelper.issueCredential(
        custodianID,
        issuerID,
        schemaID,
        consentPayload,
        token
      );
    } catch (err) {
      const { errorStatus, errorMsg } = getErrorInfo(err);
      logger.error(`Failed to issue credential: ${errorMsg}`);
      return res
        .status(errorStatus)
        .json({ message: errorMsg, status: errorStatus });
    }

    // save consent receipt
    let savedConsentReceipt;
    try {
      savedConsentReceipt = await helper.postConsentReceipt(
        custodianID,
        consentReceipt
      );
    } catch (err) {
      const { errorStatus, errorMsg } = getErrorInfo(err);
      logger.error(`Failed to save consent receipt: ${errorMsg}`);
      return res
        .status(errorStatus)
        .json({ message: errorMsg, status: errorStatus });
    }

    // save consent transaction
    try {
      await helper.postConsentTransaction(
        custodianID,
        consentReceipt.did,
        "collect"
      );
    } catch (err) {
      const { errorStatus, errorMsg } = getErrorInfo(err);
      logger.error(`Failed to save consent transaction: ${errorMsg}`);
      return res
        .status(errorStatus)
        .json({ message: errorMsg, status: errorStatus });
    }

    // delete consent request
    try {
      await requestHelper.deleteConsentRequest(custodianID, request.docID);
    } catch (err) {
      const { errorStatus, errorMsg } = getErrorInfo(err);
      logger.error(`Failed to delete consent request: ${errorMsg}`);
      return res
        .status(errorStatus)
        .json({ message: errorMsg, status: errorStatus });
    }

    logger.info("Successfully issued consent receipt");
    res.status(200).json({
      message: "Successfully issued consent receipt",
      status: 200,
      payload: savedConsentReceipt,
    });
  } catch (error) {
    const { errorStatus, errorMsg } = getErrorInfo(error);
    logger.error(`POST /consent/receipt failed: ${errorMsg}`);
    return res
      .status(errorStatus)
      .json({ message: errorMsg, status: errorStatus });
  }
};
