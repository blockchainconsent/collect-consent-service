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

const consentCustodian1 = "consentCustodian1";

const postBody = {
  consentRequest: {
    performer: "AOTZ129626",
    dataCustodian: "dataCustodian1",
    dataRecipient: "dataRecipient1",
    purpose: "to collect your data",
    datatype: "blood-test",
  },
  contact: "5555555555",
};

describe("POST Consent Invitation (Valid)", function postConsentInvitationValid() {
  this.timeout(5000);

  let consentRequestID;

  beforeEach(() => {
    nock.cleanAll();
    setupDesNocks();
    setupHpassNocks();
  });

  // check consent request DB
  after(async () => {
    // TODO: confirm whether we should save the consent request or transformed consent payload and update accordingly
    const dbName = `${constants.REQUEST_DB_PREFIX}-${consentCustodian1}`;
    const consentRequest = await dbHelper.queryDoc(dbName, consentRequestID);
    expect(consentRequest).to.not.be.empty;
    // TODO: update fields to check based on consent request schema
    expect(consentRequest).to.have.property("performer");
    expect(consentRequest.performer).to.equal(
      postBody.consentRequest.performer
    );
    expect(consentRequest).to.have.property("dataCustodian");
    expect(consentRequest.dataCustodian).to.equal(
      postBody.consentRequest.dataCustodian
    );
    expect(consentRequest).to.have.property("dataRecipient");
    expect(consentRequest.dataRecipient).to.equal(
      postBody.consentRequest.dataRecipient
    );
    expect(consentRequest).to.have.property("purpose");
    expect(consentRequest.purpose).to.equal(postBody.consentRequest.purpose);
    expect(consentRequest).to.have.property("datatype");
    expect(consentRequest.datatype).to.equal(postBody.consentRequest.datatype);
    expect(consentRequest).to.have.property("docID");
    expect(consentRequest).to.have.property("status");
    expect(consentRequest).to.have.property("createdAt");
  });

  it("Should return 200", (done) => {
    const path = "/collect-consent/api/v1/consent-invitation";

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.AUTHORIZATION]: "test", // TODO
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
      })
      .send(postBody)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "Consent invitation successfully sent"
        );
        expect(res.body).to.have.property("payload");
        expect(res.body.payload).to.have.property("docID");
        consentRequestID = res.body.payload.docID;
        done();
      });
  });
});

describe("POST Consent Invitation (Invalid)", function postConsentInvitationInvalid() {
  this.timeout(5000);

  it("Should return 400, missing consentRequest field", (done) => {
    const path = "/collect-consent/api/v1/consent-invitation";

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.AUTHORIZATION]: "test", // TODO
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
      })
      .send({})
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include("missing consentRequest field");
        done();
      });
  });

  it("Should return 400, invalid consentRequest", (done) => {
    const path = "/collect-consent/api/v1/consent-invitation";

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.AUTHORIZATION]: "test", // TODO
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
      })
      .send({
        consentRequest: {
          testField: "testValue",
        },
        contact: "5555555555",
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include(
          "Failed to validate consent request"
        );
        done();
      });
  });

  it("Should return 400, missing contact field", (done) => {
    const path = "/collect-consent/api/v1/consent-invitation";

    chai
      .request(server)
      .post(path)
      .set({
        [constants.REQUEST_HEADERS.AUTHORIZATION]: "test", // TODO
        [constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID]: consentCustodian1,
      })
      .send({
        consentRequest: {},
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message");
        expect(res.body.message).to.include("missing contact field");
        done();
      });
  });
});
