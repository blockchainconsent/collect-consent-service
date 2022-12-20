// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const chai = require("chai");
const chaiHttp = require("chai-http");
const nock = require("nock");

const constants = require("../../helpers/constants");
const dbHelper = require("../../helpers/db-helper");

const { setupHpassNocks, setupDesNocks } = require("./test-config.js");

const server = require("../../server");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

chai.use(chaiHttp);

const { expect } = chai;

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjMzMjUwNDIzOTk2fQ.r-rc4DIfu4y1Tp8ZlhyNyPL7a3JxgW_YNBGg1313xL4";
const consentCustodian1 = "consentCustodian1";
const performer1 = "AOTZ129626";
const dataCustodianID1 = "dataCustodian1";
const dataRecipientID1 = "dataRecipient1";
const purpose1 = "To collect your data";
const datatype1 = "blood-test";

const consentRequestPostBody = {
  consentRequest: {
    dataCustodian: dataCustodianID1,
    dataRecipient: dataRecipientID1,
    performer: performer1,
    purpose: purpose1,
    datatype: datatype1,
  },
};

describe("Query Consent Receipts(Invalid)", function queryConsentReceiptsInvalid() {
  this.timeout(5000);

  it("Should return a 400, missing Consent Custodian ID", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .get(path)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing x-cm-consent-custodian-id header parameter"
        );
        done();
      });
  });

  it("Should return a 400, empty Consent Custodian ID", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .get(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: "",
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing x-cm-consent-custodian-id header parameter"
        );
        done();
      });
  });

  it("Should return a 400, Data Recipient ID", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .get(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.DATA_CUSTODIAN_ID]: dataCustodianID1,
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing x-cm-data-recipient-id header parameter"
        );
        done();
      });
  });

  it("Should return a 400, empty Data Recipient ID", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .get(path)
      .set({
        [constants.REQUEST_HEADERS.DATA_CUSTODIAN_ID]: dataCustodianID1,
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.DATA_RECIPIENT_ID]: "",
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing x-cm-data-recipient-id header parameter"
        );
        done();
      });
  });

  it("Should return a 400, missing performer header", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .get(path)
      .set({
        [constants.REQUEST_HEADERS.DATA_CUSTODIAN_ID]: dataCustodianID1,
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.DATA_RECIPIENT_ID]: dataRecipientID1,
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing x-cm-performer-id header parameter"
        );
        done();
      });
  });
  it("Should return a 400, empty performer header", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .get(path)
      .set({
        [constants.REQUEST_HEADERS.DATA_CUSTODIAN_ID]: dataCustodianID1,
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.DATA_RECIPIENT_ID]: dataRecipientID1,
        [constants.REQUEST_HEADERS.PERFORMER_ID]: "",
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing x-cm-performer-id header parameter"
        );
        done();
      });
  });

  it("Should return a 400, missing purpose query param", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .get(path)
      .set({
        [constants.REQUEST_HEADERS.DATA_CUSTODIAN_ID]: dataCustodianID1,
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.DATA_RECIPIENT_ID]: dataRecipientID1,
        [constants.REQUEST_HEADERS.PERFORMER_ID]: performer1,
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include("missing purpose query parameter");
        done();
      });
  });

  it("Should return a 400, empty purpose query param", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .get(path)
      .set({
        [constants.REQUEST_HEADERS.DATA_CUSTODIAN_ID]: dataCustodianID1,
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.DATA_RECIPIENT_ID]: dataRecipientID1,
        [constants.REQUEST_HEADERS.PERFORMER_ID]: performer1,
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .query({
        purpose: "",
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include("missing purpose query parameter");
        done();
      });
  });

  it("Should return a 400, missing datatype query param", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .get(path)
      .set({
        [constants.REQUEST_HEADERS.DATA_CUSTODIAN_ID]: dataCustodianID1,
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.DATA_RECIPIENT_ID]: dataRecipientID1,
        [constants.REQUEST_HEADERS.PERFORMER_ID]: performer1,
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .query({
        purpose: purpose1,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include("missing datatype query parameter");
        done();
      });
  });

  it("Should return a 400, empty datatype query param", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .get(path)
      .set({
        [constants.REQUEST_HEADERS.DATA_CUSTODIAN_ID]: dataCustodianID1,
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.DATA_RECIPIENT_ID]: dataRecipientID1,
        [constants.REQUEST_HEADERS.PERFORMER_ID]: performer1,
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .query({
        purpose: purpose1,
        datatype: "",
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include("missing datatype query parameter");
        done();
      });
  });
});

describe("Query Consent Receipts (Valid)", function queryConsentReceiptsValid() {
  this.timeout(5000);

  it("Should return a 200", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .get(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.DATA_CUSTODIAN_ID]: dataCustodianID1,
        [constants.REQUEST_HEADERS.DATA_RECIPIENT_ID]: dataRecipientID1,
        [constants.REQUEST_HEADERS.PERFORMER_ID]: performer1,
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .query({
        purpose: purpose1,
        datatype: datatype1,
      })
      .end((err, res) => {
        expect(res.body).to.have.property("payload");
        expect(res.body.payload).to.be.not.empty;
        // TODO: check payload
        done();
      });
  });
});

describe("POST Consent Receipt (Invalid)", function postConsentReceiptInvalid() {
  this.timeout(5000);

  it("Should return a 400, missing Consent Custodian ID", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing x-cm-consent-custodian-id header parameter"
        );
        done();
      });
  });

  it("Should return a 400, empty Consent Custodian ID", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: "",
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing x-cm-consent-custodian-id header parameter"
        );
        done();
      });
  });

  it("Should return a 400, missing Consent Request", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing consentRequest body parameter"
        );
        done();
      });
  });

  // TODO: invalid custodian ID
});

describe("POST Consent Receipt (Valid)", function postConsentReceiptValid() {
  this.timeout(5000);

  let consentRequestID;
  let consentRequestPayload;
  let consentReceiptID;

  beforeEach(() => {
    nock.cleanAll();
    setupDesNocks();
    setupHpassNocks();
  });

  before((done) => {
    const path = "/collect-consent/api/v1/consent-request";

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .send(consentRequestPostBody)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("payload");
        expect(res.body.payload).to.have.property("docID");
        consentRequestID = res.body.payload.docID;
        done();
      });
  });

  before((done) => {
    const path = "/collect-consent/api/v1/consent-request";

    chai
      .request(server)
      .get(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.CONSENT_REQUEST_ID]: consentRequestID,
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("payload");
        consentRequestPayload = res.body.payload;
        done();
      });
  });

  // check consent receipt DB
  after(async () => {
    const dbName = `${constants.RECEIPT_DB_PREFIX}-${consentCustodian1}`;
    const consentReceipt = await dbHelper.queryDoc(dbName, consentReceiptID);
    expect(consentReceipt).to.not.be.empty;
    // TODO: update fields to check based on consent receipt schema
    expect(consentReceipt).to.have.property("id");
    expect(consentReceipt).to.have.property("type");
    expect(consentReceipt).to.have.property("issuer");
    expect(consentReceipt).to.have.property("issuanceDate");
    expect(consentReceipt).to.have.property("credentialSchema");
    expect(consentReceipt).to.have.property("credentialSubject");
    expect(consentReceipt).to.have.property("proof");
  });

  // TODO: check consent transaction DB
  after(async () => {
    const dbName = `${constants.TX_DB_PREFIX}-${consentCustodian1}`;
    await dbHelper.queryDocs(dbName, { receiptID: consentReceiptID });
    // expect(consentTransactions).to.have.lengthOf(1);
    // expect(consentTransactions[0]).to.have.property("receiptID");
    // expect(consentTransactions[0]).to.have.property("action");
    // expect(consentTransactions[0]).to.have.property("timestamp");
  });

  it("Should return a 200", (done) => {
    const path = "/collect-consent/api/v1/consent-receipt";

    chai
      .request(server)
      .post(path)
      .send({
        consentRequest: consentRequestPayload,
      })
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.AUTHORIZATION]: token,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "Successfully issued consent receipt"
        );
        expect(res.body).to.have.property("payload");

        expect(res.body.payload).to.have.property("id");
        expect(res.body.payload).to.have.property("type");
        expect(res.body.payload).to.have.property("issuer");
        expect(res.body.payload).to.have.property("issuanceDate");
        expect(res.body.payload).to.have.property("credentialSchema");
        expect(res.body.payload).to.have.property("credentialSubject");
        expect(res.body.payload).to.have.property("proof");

        consentReceiptID = res.body.payload.docID;

        done();
      });
  });
});
