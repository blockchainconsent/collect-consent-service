// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const chai = require("chai");
const chaiHttp = require("chai-http");

const constants = require("../../helpers/constants");
const server = require("../../server");
const dbHelper = require("../../helpers/db-helper");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

chai.use(chaiHttp);

const { expect } = chai;

const consentCustodian1 = "custodian1";

const consentRequestPostBody = {
  consentRequest: {
    performer: "AOTZ129626",
    dataCustodian: "dataCustodian1",
    dataRecipient: "dataRecipient1",
    purpose: "to collect your data",
    datatype: "blood-test",
  },
};

describe("GET Consent Request (Invalid)", function getConsentRequestInvalid() {
  this.timeout(5000);

  it("Should return a 400, missing Consent Custodian ID", (done) => {
    const path = "/collect-consent/api/v1/consent-request";

    chai
      .request(server)
      .get(path)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "Missing x-cm-consent-custodian-id header parameter"
        );
        done();
      });
  });

  it("Should return a 400, empty Consent Custodian ID", (done) => {
    const path = "/collect-consent/api/v1/consent-request";

    chai
      .request(server)
      .get(path)
      .set({ [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: "" })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "Missing x-cm-consent-custodian-id header parameter"
        );
        done();
      });
  });

  it("Should return a 400, missing Consent Request ID", (done) => {
    const path = "/collect-consent/api/v1/consent-request";

    chai
      .request(server)
      .get(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "Missing x-cm-consent-request-id header parameter"
        );
        done();
      });
  });

  it("Should return a 400, invalid consent request id", (done) => {
    const path = "/collect-consent/api/v1/consent-request";

    chai
      .request(server)
      .get(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.CONSENT_REQUEST_ID]: "request2~",
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "Only alphanumeric characters allowed for x-cm-consent-request-id header parameter"
        );
        done();
      });
  });

  // TODO: invalid custodian ID

  // TODO: invalid request ID
});

describe("GET Consent Request (Valid)", function getConsentRequestValid() {
  this.timeout(5000);

  let requestID1;

  before(async () => {
    const dbName = `${constants.REQUEST_DB_PREFIX}-${consentCustodian1}`;
    const consentRequest = await dbHelper.writeDoc(
      dbName,
      consentRequestPostBody.consentRequest
    );
    requestID1 = consentRequest.docID;
  });

  it("Should return a 200", (done) => {
    const path = "/collect-consent/api/v1/consent-request";

    chai
      .request(server)
      .get(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
        [constants.REQUEST_HEADERS.CONSENT_REQUEST_ID]: requestID1,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("payload");
        expect(res.body.payload).to.be.not.empty;
        // TODO: check payload
        done();
      });
  });
});

describe("POST Consent Request (Invalid)", function getConsentRequestInvalid() {
  this.timeout(5000);

  it("Should return a 400, missing request body", (done) => {
    const path = "/collect-consent/api/v1/consent-request";

    chai
      .request(server)
      .post(path)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing consent custodian ID header parameter"
        );
        done();
      });
  });

  it("Should return a 400, missing consent request", (done) => {
    const path = "/collect-consent/api/v1/consent-request";

    const body = JSON.parse(JSON.stringify(consentRequestPostBody));
    delete body.consentRequest;

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
      })
      .send(body)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing consent request in request body"
        );
        done();
      });
  });

  it("Should return a 400, missing data custodian", (done) => {
    const path = "/collect-consent/api/v1/consent-request";

    const body = JSON.parse(JSON.stringify(consentRequestPostBody));
    delete body.consentRequest.dataCustodian;

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
      })
      .send(body)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing data custodian in request body"
        );
        done();
      });
  });

  it("Should return a 400, missing data recipient", (done) => {
    const path = "/collect-consent/api/v1/consent-request";

    const body = JSON.parse(JSON.stringify(consentRequestPostBody));
    delete body.consentRequest.dataRecipient;

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
      })
      .send(body)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing data recipient in request body"
        );
        done();
      });
  });

  it("Should return a 400, missing performer", (done) => {
    const path = "/collect-consent/api/v1/consent-request";

    const body = JSON.parse(JSON.stringify(consentRequestPostBody));
    delete body.consentRequest.performer;

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
      })
      .send(body)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing performer in request body"
        );
        done();
      });
  });

  it("Should return a 400, missing purpose", (done) => {
    const path = "/collect-consent/api/v1/consent-request";

    const body = JSON.parse(JSON.stringify(consentRequestPostBody));
    delete body.consentRequest.purpose;

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
      })
      .send(body)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include("missing purpose in request body");
        done();
      });
  });

  it("Should return a 400, missing data type", (done) => {
    const path = "/collect-consent/api/v1/consent-request";

    const body = JSON.parse(JSON.stringify(consentRequestPostBody));
    delete body.consentRequest.datatype;

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
      })
      .send(body)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "missing data type in request body"
        );
        done();
      });
  });
});

describe("POST Consent Request (Valid)", function getConsentRequestValid() {
  this.timeout(5000);

  let consentRequestID;

  // check consent request DB
  after(async () => {
    const dbName = `${constants.REQUEST_DB_PREFIX}-${consentCustodian1}`;
    const consentRequest = await dbHelper.queryDoc(dbName, consentRequestID);
    expect(consentRequest).to.not.be.empty;
    // TODO: update fields to check based on consent request schema
    expect(consentRequest).to.have.property("performer");
    expect(consentRequest).to.have.property("dataCustodian");
    expect(consentRequest).to.have.property("dataRecipient");
    expect(consentRequest).to.have.property("purpose");
    expect(consentRequest).to.have.property("datatype");
    expect(consentRequest).to.have.property("docID");
    expect(consentRequest).to.have.property("status");
    expect(consentRequest).to.have.property("createdAt");
  });

  it("Should return 200", (done) => {
    const path = "/collect-consent/api/v1/consent-request";

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
      })
      .send(consentRequestPostBody)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "Consent request successfully created"
        );
        expect(res.body).to.have.property("payload");
        expect(res.body.payload).to.have.property("docID");
        consentRequestID = res.body.payload.docID;
        done();
      });
  });
});
