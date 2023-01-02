import ClientError from "#Commons/exceptions/ClientError";

describe("ClientError", () => {
  it("Should throw error when directly use it", () => {
    expect(() => new ClientError("")).toThrowError(
      "cannot instantiate abstract class"
    );
  });
});
