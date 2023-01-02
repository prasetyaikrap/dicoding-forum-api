export default class RegisterUser {
  constructor(payload) {
    const { username, password, fullname } = payload;
    //verify payload
    this._verifyPayload({ username, password, fullname });

    this.username = username;
    this.password = password;
    this.fullname = fullname;
  }

  _verifyPayload({ username, password, fullname }) {
    //Check required payload
    if (!username || !password || !fullname) {
      throw new Error("REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY");
    }
    //Check payload data type
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof fullname !== "string"
    ) {
      throw new Error("REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }

    //Check username limit char
    if (username.length > 50) {
      throw new Error("REGISTER_USER.USERNAME_LIMIT_CHAR");
    }

    //Check username should not have restricted character
    if (!username.match(/^[\w]+$/)) {
      throw new Error("REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER");
    }
  }
}
