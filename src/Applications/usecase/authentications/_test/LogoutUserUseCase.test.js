import LogoutUserUseCase from "#Applications/usecase/authentications/LogoutUserUseCase";
import AuthenticationRepository from "#Domains/authentications/AuthenticationsRepository";
import { jest } from "@jest/globals";

describe("LogoutUserUseCase", () => {
  it("Should throw error when payload not contain refresh token", async () => {
    // Arrange
    const useCasePayload = {};
    const logoutUserUseCase = new LogoutUserUseCase({});

    // Action & Assert
    await expect(
      logoutUserUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      "DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN"
    );
  });

  it("Should throw error when refresh token not meet data type spesification", async () => {
    // Arrange
    const useCasePayload = { refreshToken: 12345 };
    const logoutUserUseCase = new LogoutUserUseCase({});

    // Action & Assert
    await expect(
      logoutUserUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      "DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should orchestrating the delete authentication action correctly", async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: "refreshToken",
    };

    const mockAuthenticationRepository = new AuthenticationRepository();
    mockAuthenticationRepository.checkAvailabilityToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationRepository.deleteToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const logoutUserUseCase = new LogoutUserUseCase({
      authenticationRepository: mockAuthenticationRepository,
    });

    // Action
    await logoutUserUseCase.execute(useCasePayload);

    // Assert
    expect(
      mockAuthenticationRepository.checkAvailabilityToken
    ).toHaveBeenCalledWith(useCasePayload.refreshToken);
    expect(mockAuthenticationRepository.deleteToken).toHaveBeenCalledWith(
      useCasePayload.refreshToken
    );
  });
});
