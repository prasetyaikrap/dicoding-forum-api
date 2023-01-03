export default class LoginUser {
  constructor(payload) {
    this._verifyPayload(payload);
    const { username, password } = payload;
    this.username = username;
    this.password = password;
  }

  _verifyPayload(payload) {
    const { username, password } = payload;
    //Check required fields
    if (!username || !password) {
      throw new Error("LOGIN_USER.NOT_CONTAIN_NEEDED_DATA");
    }

    //Check fields data type
    if (typeof username !== "string" || typeof password !== "string") {
      throw new Error("LOGIN_USER.NOT_MEET_DATA_TYPE_SPESIFICATION");
    }
  }
}
