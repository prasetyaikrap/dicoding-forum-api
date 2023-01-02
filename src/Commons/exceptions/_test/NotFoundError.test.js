import NotFoundError from "@Commons/exceptions/NotFoundError";

describe("NotFoundError", () => {
  it("Should Create NotFoundError Correctly", () => {
    const notFoundError = new NotFoundError("Not Found!");

    expect(notFoundError.name).toEqual("NotFoundError");
    expect(notFoundError.statusCode).toEqual(404);
    expect(notFoundError.message).toEqual("Not Found!");
  });
});
