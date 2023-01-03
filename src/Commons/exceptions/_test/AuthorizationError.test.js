import AuthorizationError from "#Commons/exceptions/AuthorizationError";

describe("AuthorizationError", () => {
  it("Should create Authorization Error correctly", () => {
    const authError = new AuthorizationError("Not Authorized!");

    expect(authError.name).toEqual("AuthorizationError");
    expect(authError.statusCode).toEqual(403);
    expect(authError.message).toEqual("Not Authorized!");
  });
});
