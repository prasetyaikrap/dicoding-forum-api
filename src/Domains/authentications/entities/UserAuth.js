export default class UserAuth {
  constructor(payload) {
    this._verifyPayload(payload);
    const { accessToken, refreshToken } = payload;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  _verifyPayload(payload) {
    const { accessToken, refreshToken } = payload;
    if (!accessToken || !refreshToken) {
      throw new Error("USER_AUTH.NOT_CONTAIN_NEEDED_DATA");
    }

    if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
      throw new Error("USER_AUTH.NOT_MEET_DATA_TYPE_SPESIFICATION");
    }
  }
}
