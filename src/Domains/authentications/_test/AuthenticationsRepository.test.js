import AuthenticationRepository from "#Domains/authentications/AuthenticationsRepository";

describe("AuthenticationRepository Interface", () => {
  it("should throw error when invoke abstract behavior", () => {
    // Arrange
    const authRepo = new AuthenticationRepository();

    // Action and Assert
    expect(authRepo.addToken("")).rejects.toThrowError(
      "AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    expect(authRepo.checkAvailabilityToken("")).rejects.toThrowError(
      "AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    expect(authRepo.deleteToken("")).rejects.toThrowError(
      "AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
  });
});
