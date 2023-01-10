import ClientError from "#Commons/exceptions/ClientError";

describe("ClientError", () => {
  it("Should throw error when directly use it", () => {
    expect(() => new ClientError("")).toThrow(
      "cannot instantiate abstract class"
    );
  });
});
