// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const { getErrorInfo } = require("../utils");
const logger = require("../config/logger").getLogger(
  "consent-invitation-controller"
);
const constants = require("../helpers/constants");
const requestHelper = require("../helpers/consent-request-helper");
const receiptHelper = require("../helpers/consent-receipt-helper");
const desHelper = require("../helpers/des-helper");
const hpassHelper = require("../helpers/hpass-helper");
const credentialHelper = require("../helpers/credential-helper");

const consentCustodianHeader = constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID;

exports.invite = async (req, res) => {
  try {
    if (!req.body.consentRequest) {
      const error = new Error("missing consentRequest field");
      error.status = 400;
      throw error;
    }
    if (!req.body.contact) {
      const error = new Error("missing contact field");
      error.status = 400;
      throw error;
    }
    // TODO: validate contact

    const { consentRequest, contact } = req.body;
    const consentCustodian = req.headers[consentCustodianHeader];
    const token = req.headers.authorization;
    // TODO: get caller ID

    // get consent custodian's configuration
    let custodianConfig;
    try {
      custodianConfig = await credentialHelper.getOrgConfig(
        consentCustodian,
        token
      );
    } catch (err) {
      const { errorStatus, errorMsg } = getErrorInfo(err);
      logger.error(
        `Failed to get consent custodian configuration: ${errorMsg}`
      );
      return res
        .status(errorStatus)
        .json({ message: errorMsg, status: errorStatus });
    }
    const schemaID = custodianConfig.consentSchemaID;
    const issuerID = custodianConfig.issuerID;
    const mapperName = custodianConfig.consentMapperName;

    // get consent custodian's consent schema
    let consentSchema;
    try {
      consentSchema = await hpassHelper.getSchema(issuerID, schemaID, token);
    } catch (err) {
      const { errorStatus, errorMsg } = getErrorInfo(err);
      logger.error(`Failed to get consent schema: ${errorMsg}`);
      return res
        .status(errorStatus)
        .json({ message: errorMsg, status: errorStatus });
    }

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

    // transform consent request via consent mapper
    let consentPayload;
    try {
      consentPayload = receiptHelper.prepareConsentPayload(
        consentMapper,
        consentRequest
      );
    } catch (err) {
      logger.error("Failed to prepare consent payload");
      const status = err.status || 400;
      return res.status(status).json({ message: err.message, status });
    }

    // validate consent payload against consent schema
    try {
      credentialHelper.validateConsentRequest(consentPayload, consentSchema);
    } catch (err) {
      const { errorStatus, errorMsg } = getErrorInfo(err);
      logger.error(`Failed to validate consent request: ${errorMsg}`);
      return res
        .status(errorStatus)
        .json({ message: errorMsg, status: errorStatus });
    }

    // save consent request payload for future reference
    // TODO: confirm whether we should save the consent request or the transformed consent payload
    let payload;
    try {
      payload = await requestHelper.postConsentRequest(
        consentCustodian,
        consentRequest
      );
    } catch (err) {
      const { errorStatus, errorMsg } = getErrorInfo(err);
      logger.error(`Failed to save consent request: ${errorMsg}`);
      return res
        .status(errorStatus)
        .json({ message: errorMsg, status: errorStatus });
    }

    // TODO: get invitation content and pass to sendInvitation()
    try {
      await desHelper.sendInvitation(contact);
    } catch (err) {
      const { errorStatus, errorMsg } = getErrorInfo(err);
      logger.error(`Failed to sent consent invitation: ${errorMsg}`);
      return res
        .status(errorStatus)
        .json({ message: errorMsg, status: errorStatus });
    }

    return res.status(201).json({
      message: "Consent invitation successfully sent",
      status: 201,
      payload,
    });
  } catch (error) {
    const { errorStatus, errorMsg } = getErrorInfo(error);
    logger.error(`POST /consent/invitation failed: ${errorMsg}`);
    return res
      .status(errorStatus)
      .json({ message: errorMsg, status: errorStatus });
  }
};
