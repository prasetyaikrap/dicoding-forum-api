import AuthenticationRepository from "#Domains/authentications/AuthenticationsRepository";

describe("AuthenticationRepository Interface", () => {
  it("should throw error when invoke abstract behavior", async () => {
    // Arrange
    const authRepo = new AuthenticationRepository();

    // Action and Assert
    await expect(authRepo.addToken("")).rejects.toThrow(
      "AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(authRepo.checkAvailabilityToken("")).rejects.toThrow(
      "AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(authRepo.deleteToken("")).rejects.toThrow(
      "AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
  });
});
