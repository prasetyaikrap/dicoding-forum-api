import AuthTokenManager from "#Applications/security/AuthTokenManager";

describe("PasswordHash interface", () => {
  it("should throw error when invoke abstract behavior", async () => {
    // Arrange
    const authTokenManager = new AuthTokenManager();

    // Action & Assert
    await expect(authTokenManager.createAccessToken({})).rejects.toThrow(
      "AUTH_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED"
    );
    await expect(authTokenManager.createRefreshToken({})).rejects.toThrow(
      "AUTH_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED"
    );
    await expect(
      authTokenManager.verifyRefreshToken("accessToken")
    ).rejects.toThrow("AUTH_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED");
    await expect(
      authTokenManager.decodePayload("accessToken")
    ).rejects.toThrow("AUTH_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED");
  });
});
