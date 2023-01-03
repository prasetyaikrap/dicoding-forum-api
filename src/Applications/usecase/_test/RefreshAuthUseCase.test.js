import AuthTokenManager from "#Applications/security/AuthTokenManager";
import RefreshAuthUseCase from "#Applications/usecase/RefreshAuthUseCase";
import AuthenticationRepository from "#Domains/authentications/AuthenticationsRepository";
import { jest } from "@jest/globals";

describe("RefreshAuthUseCase", () => {
  it("Should throw error when payload not contain refresh token", async () => {
    // Arrange
    const useCasePayload = {};
    const refreshAuthUseCase = new RefreshAuthUseCase({});

    // Action & Assert
    await expect(
      refreshAuthUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      "REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN"
    );
  });
  it("Should throw error when payload not meet data type spesification", async () => {
    // Arrange
    const useCasePayload = { refreshToken: 12345 };
    const refreshAuthUseCase = new RefreshAuthUseCase({});

    // Action & Assert
    await expect(
      refreshAuthUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      "REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });
  it("Should orchestrating the refresh authentication action correctly", async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: "refreshToken",
    };

    // Mocking
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthTokenManager = new AuthTokenManager();

    mockAuthenticationRepository.checkAvailabilityToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthTokenManager.verifyRefreshToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthTokenManager.decodePayload = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ id: "user-12345", username: "dicoding" })
      );
    mockAuthTokenManager.createAccessToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve("newAccessToken"));

    const refreshAuthUseCase = new RefreshAuthUseCase({
      authenticationRepository: mockAuthenticationRepository,
      authTokenManager: mockAuthTokenManager,
    });

    // Action
    const accessToken = await refreshAuthUseCase.execute(useCasePayload);

    // Assert
    expect(mockAuthTokenManager.verifyRefreshToken).toBeCalledWith(
      useCasePayload.refreshToken
    );
    expect(mockAuthenticationRepository.checkAvailabilityToken).toBeCalledWith(
      useCasePayload.refreshToken
    );
    expect(mockAuthTokenManager.decodePayload).toBeCalledWith(
      useCasePayload.refreshToken
    );
    expect(mockAuthTokenManager.createAccessToken).toBeCalledWith({
      username: "dicoding",
      id: "user-12345",
    });
    expect(accessToken).toEqual("newAccessToken");
  });
});
