import UserAuth from "#Domains/authentications/entities/UserAuth";
import UserRepository from "#Domains/users/UserRepository";
import AuthenticationRepository from "#Domains/authentications/AuthenticationsRepository";
import AuthTokenManager from "#Applications/security/AuthTokenManager";
import PasswordHash from "#Applications/security/PasswordHash";
import LoginUserUseCase from "#Applications/usecase/authentications/LoginUserUseCase";
import { jest } from "@jest/globals";

describe("LoginUserUseCase", () => {
  it("should orchestrating the get authentication action correctly", async () => {
    // Arrange
    const useCasePayload = {
      username: "dicoding",
      password: "secret",
    };
    const expectedAuthentication = new UserAuth({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
    });
    const mockUserRepository = new UserRepository();
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthTokenManager = new AuthTokenManager();
    const mockPasswordHash = new PasswordHash();

    // Mocking
    mockUserRepository.getPasswordByUsername = jest
      .fn()
      .mockImplementation(() => Promise.resolve("encrypted_password"));
    mockPasswordHash.comparePassword = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthTokenManager.createAccessToken = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(expectedAuthentication.accessToken)
      );
    mockAuthTokenManager.createRefreshToken = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(expectedAuthentication.refreshToken)
      );
    mockUserRepository.getIdByUsername = jest
      .fn()
      .mockImplementation(() => Promise.resolve("user-123"));
    mockAuthenticationRepository.addToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    // create use case instance
    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      authTokenManager: mockAuthTokenManager,
      passwordHash: mockPasswordHash,
    });

    // Action
    const actualAuthentication = await loginUserUseCase.execute(useCasePayload);

    // Assert
    expect(actualAuthentication).toEqual(expectedAuthentication);
    expect(mockUserRepository.getPasswordByUsername).toHaveBeenCalledWith("dicoding");
    expect(mockPasswordHash.comparePassword).toHaveBeenCalledWith(
      "secret",
      "encrypted_password"
    );
    expect(mockUserRepository.getIdByUsername).toHaveBeenCalledWith("dicoding");
    expect(mockAuthTokenManager.createAccessToken).toHaveBeenCalledWith({
      username: "dicoding",
      id: "user-123",
    });
    expect(mockAuthTokenManager.createRefreshToken).toHaveBeenCalledWith({
      username: "dicoding",
      id: "user-123",
    });
    expect(mockAuthenticationRepository.addToken).toHaveBeenCalledWith(
      expectedAuthentication.refreshToken
    );
  });
});
