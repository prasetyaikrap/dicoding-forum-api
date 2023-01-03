export default class AuthTokenManager {
  async createRefreshToken(payload) {
    throw new Error("AUTH_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED");
  }

  async createAccessToken(payload) {
    throw new Error("AUTH_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED");
  }

  async verifyRefreshToken(token) {
    throw new Error("AUTH_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED");
  }

  async decodePayload() {
    throw new Error("AUTH_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED");
  }
}
