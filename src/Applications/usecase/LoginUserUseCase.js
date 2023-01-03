import LoginUser from "#Domains/users/entities/LoginUser";
import UserAuth from "#Domains/authentications/entities/UserAuth";

export default class LoginUserUseCase {
  constructor({
    userRepository,
    authenticationRepository,
    authTokenManager,
    passwordHash,
  }) {
    this._userRepository = userRepository;
    this._authenticationRepository = authenticationRepository;
    this._authTokenManager = authTokenManager;
    this._passwordHash = passwordHash;
  }

  async execute(useCasePayload) {
    const { username, password } = new LoginUser(useCasePayload);

    const encryptedPassword = await this._userRepository.getPasswordByUsername(
      username
    );

    await this._passwordHash.comparePassword(password, encryptedPassword);

    const id = await this._userRepository.getIdByUsername(username);

    const accessToken = await this._authTokenManager.createAccessToken({
      username,
      id,
    });
    const refreshToken = await this._authTokenManager.createRefreshToken({
      username,
      id,
    });

    const newAuthentication = new UserAuth({ accessToken, refreshToken });

    await this._authenticationRepository.addToken(
      newAuthentication.refreshToken
    );

    return newAuthentication;
  }
}
