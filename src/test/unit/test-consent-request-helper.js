// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const { expect } = require("chai");

const sinon = require("sinon");
const helper = require("../../helpers/consent-request-helper");
const dbHelper = require("../../helpers/db-helper");

const custodianID1 = "custodian1";
const requestID1 = "request1";
const consentRequest = {
  performer: "AOTZ129626",
  dataCustodian: "dataCustodian1",
  dataRecipient: "dataRecipient1",
  purpose: "to collect your data",
  datatype: "blood-test",
};

describe("getConsentRequest", async () => {
  const getConsentRequestSpy = sinon.spy(helper, "getConsentRequest");

  afterEach(() => {
    dbHelper.queryDoc.restore();
    getConsentRequestSpy.resetHistory();
  });

  it("should fail with missing consent custodian ID", async () => {
    const queryDocStub = sinon.stub(dbHelper, "queryDoc");

    await expect(helper.getConsentRequest()).to.be.rejectedWith(
      "missing consent custodian ID"
    );

    expect(queryDocStub.callCount).to.equal(0);
    expect(getConsentRequestSpy.callCount).to.equal(1);
  });

  it("should fail with missing consent request ID", async () => {
    const queryDocStub = sinon.stub(dbHelper, "queryDoc");

    await expect(helper.getConsentRequest(custodianID1)).to.be.rejectedWith(
      "missing consent request ID"
    );

    expect(queryDocStub.callCount).to.equal(0);
    expect(getConsentRequestSpy.callCount).to.equal(1);
  });

  it("should fail with queryDoc error", async () => {
    const error = new Error("Internal Server Error");
    const queryDocStub = sinon.stub(dbHelper, "queryDoc").throws(error);

    await expect(
      helper.getConsentRequest(custodianID1, requestID1)
    ).to.be.rejectedWith("Internal Server Error");

    expect(queryDocStub.callCount).to.equal(1);
    expect(getConsentRequestSpy.callCount).to.equal(1);
  });

  it("should succeed", async () => {
    const queryDocStub = sinon
      .stub(dbHelper, "queryDoc")
      .returns({ [requestID1]: "doc" });

    const result = await helper.getConsentRequest(custodianID1, requestID1);
    expect(result).to.have.property(requestID1);
    expect(queryDocStub.callCount).to.equal(1);
    expect(getConsentRequestSpy.callCount).to.equal(1);
  });
});

describe("postConsentRequest", async () => {
  const postConsentRequestSpy = sinon.spy(helper, "postConsentRequest");

  afterEach(() => {
    dbHelper.writeDoc.restore();
    postConsentRequestSpy.resetHistory();
  });

  it("should fail with missing consent custodian ID", async () => {
    const writeDocStub = sinon.stub(dbHelper, "writeDoc");

    await expect(helper.postConsentRequest()).to.be.rejectedWith(
      "Failed at postConsentRequest: missing consent custodian ID header parameter"
    );

    expect(writeDocStub.callCount).to.equal(0);
    expect(postConsentRequestSpy.callCount).to.equal(1);
  });

  it("should fail with missing consent request", async () => {
    const writeDocStub = sinon.stub(dbHelper, "writeDoc");

    await expect(helper.postConsentRequest(custodianID1)).to.be.rejectedWith(
      "Failed at postConsentRequest: missing consent request in request body"
    );

    expect(writeDocStub.callCount).to.equal(0);
    expect(postConsentRequestSpy.callCount).to.equal(1);
  });

  it("should fail with missing data custodian", async () => {
    const writeDocStub = sinon.stub(dbHelper, "writeDoc");

    const data = JSON.parse(JSON.stringify(consentRequest));
    delete data.dataCustodian;

    await expect(
      helper.postConsentRequest(custodianID1, data)
    ).to.be.rejectedWith(
      "Failed at postConsentRequest: missing data custodian in request body"
    );

    expect(writeDocStub.callCount).to.equal(0);
    expect(postConsentRequestSpy.callCount).to.equal(1);
  });

  it("should fail with missing data recipient", async () => {
    const writeDocStub = sinon.stub(dbHelper, "writeDoc");

    const data = JSON.parse(JSON.stringify(consentRequest));
    delete data.dataRecipient;

    await expect(
      helper.postConsentRequest(custodianID1, data)
    ).to.be.rejectedWith(
      "Failed at postConsentRequest: missing data recipient in request body"
    );

    expect(writeDocStub.callCount).to.equal(0);
    expect(postConsentRequestSpy.callCount).to.equal(1);
  });

  it("should fail with missing performer", async () => {
    const writeDocStub = sinon.stub(dbHelper, "writeDoc");

    const data = JSON.parse(JSON.stringify(consentRequest));
    delete data.performer;

    await expect(
      helper.postConsentRequest(custodianID1, data)
    ).to.be.rejectedWith(
      "Failed at postConsentRequest: missing performer in request body"
    );

    expect(writeDocStub.callCount).to.equal(0);
    expect(postConsentRequestSpy.callCount).to.equal(1);
  });

  it("should fail with missing purpose", async () => {
    const writeDocStub = sinon.stub(dbHelper, "writeDoc");

    const data = JSON.parse(JSON.stringify(consentRequest));
    delete data.purpose;

    await expect(
      helper.postConsentRequest(custodianID1, data)
    ).to.be.rejectedWith(
      "Failed at postConsentRequest: missing purpose in request body"
    );

    expect(writeDocStub.callCount).to.equal(0);
    expect(postConsentRequestSpy.callCount).to.equal(1);
  });

  it("should fail with missing data type", async () => {
    const writeDocStub = sinon.stub(dbHelper, "writeDoc");

    const data = JSON.parse(JSON.stringify(consentRequest));
    delete data.datatype;

    await expect(
      helper.postConsentRequest(custodianID1, data)
    ).to.be.rejectedWith(
      "Failed at postConsentRequest: missing data type in request body"
    );

    expect(writeDocStub.callCount).to.equal(0);
    expect(postConsentRequestSpy.callCount).to.equal(1);
  });

  it("should fail with writeDoc error", async () => {
    const error = new Error("Internal Server Error");
    const writeDocStub = sinon.stub(dbHelper, "writeDoc").throws(error);

    await expect(
      helper.postConsentRequest(custodianID1, consentRequest)
    ).to.be.rejectedWith("Internal Server Error");

    expect(writeDocStub.callCount).to.equal(1);
    expect(postConsentRequestSpy.callCount).to.equal(1);
  });

  it("should succeed", async () => {
    const writeDocStub = sinon.stub(dbHelper, "writeDoc");

    await helper.postConsentRequest(custodianID1, consentRequest);
    expect(writeDocStub.callCount).to.equal(1);
    expect(postConsentRequestSpy.callCount).to.equal(1);
  });
});

describe("deleteConsentRequest", async () => {
  const deleteConsentRequestSpy = sinon.spy(helper, "deleteConsentRequest");

  afterEach(() => {
    dbHelper.deleteDoc.restore();
    deleteConsentRequestSpy.resetHistory();
  });

  it("should fail with missing consent custodian ID", async () => {
    const deleteDocStub = sinon.stub(dbHelper, "deleteDoc");

    await expect(helper.deleteConsentRequest()).to.be.rejectedWith(
      "missing consent custodian ID"
    );

    expect(deleteDocStub.callCount).to.equal(0);
    expect(deleteConsentRequestSpy.callCount).to.equal(1);
  });

  it("should fail with missing consent request docID", async () => {
    const deleteDocStub = sinon.stub(dbHelper, "deleteDoc");

    await expect(helper.deleteConsentRequest(custodianID1)).to.be.rejectedWith(
      "missing consent request docID"
    );

    expect(deleteDocStub.callCount).to.equal(0);
    expect(deleteConsentRequestSpy.callCount).to.equal(1);
  });

  it("should fail with deleteDoc error", async () => {
    const error = new Error("Internal Server Error");
    const deleteDocStub = sinon.stub(dbHelper, "deleteDoc").throws(error);

    await expect(
      helper.deleteConsentRequest(custodianID1, requestID1)
    ).to.be.rejectedWith("Internal Server Error");

    expect(deleteDocStub.callCount).to.equal(1);
    expect(deleteConsentRequestSpy.callCount).to.equal(1);
  });

  it("should succeed", async () => {
    const deleteDocStub = sinon.stub(dbHelper, "deleteDoc");

    await helper.deleteConsentRequest(custodianID1, requestID1);
    expect(deleteDocStub.callCount).to.equal(1);
    expect(deleteConsentRequestSpy.callCount).to.equal(1);
  });
});
