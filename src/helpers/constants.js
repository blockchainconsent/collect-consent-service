// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

exports.REQUEST_HEADERS = {
  TRANSACTION_ID: "x-cm-txn-id",
  CONSENT_REQUEST_ID: "x-cm-consent-request-id",
  CONSENT_CUSTODIAN_ID: "x-cm-consent-custodian-id",
  PERFORMER_ID: "x-cm-performer-id",
  DATA_RECIPIENT_ID: "x-cm-data-recipient-id",
  DATA_CUSTODIAN_ID: "x-cm-data-custodian-id",
  ISSUER_ID: "x-hpass-issuer-id",
  AUTHORIZATION: "Authorization",
};

exports.QUERY_PARAMS = {
  PURPOSE: "purpose",
  DATATYPE: "datatype",
};

exports.BODY_PARAMS = {
  CONSENT_REQUEST: "consentRequest",
};

exports.REQUEST_DB_PREFIX = "consent-requests";
exports.RECEIPT_DB_PREFIX = "consent-receipts";
exports.TX_DB_PREFIX = "consent-transactions";

exports.CONSENT_REQUEST_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};
