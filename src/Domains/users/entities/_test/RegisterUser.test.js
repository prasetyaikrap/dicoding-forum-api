import RegisterUser from "#Domains/users/entities/RegisterUser";

describe("RegisterUser Entities", () => {
  it("Should throw error when payload did not contain needed property", () => {
    //Arrange
    const payload = {
      username: "dicoding",
      password: "supersecretpassword",
    };

    //Action and Assert
    expect(() => new RegisterUser(payload)).toThrow(
      "REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("Should throw error when payload data type is not meet specifications", () => {
    //Arrange
    const payload = {
      username: 12345,
      password: "supersecretpassword",
      fullname: "dicoding user",
    };

    //Action and Assert
    expect(() => new RegisterUser(payload)).toThrow(
      "REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("Should throw error when username length is more than 50 character", () => {
    //Arrange
    const payload = {
      username: "dicodingindonesiadicodingindonesiadicodingindonesiadicoding",
      password: "supersecretpassword",
      fullname: "dicoding user",
    };

    //Action and Assert
    expect(() => new RegisterUser(payload)).toThrow(
      "REGISTER_USER.USERNAME_LIMIT_CHAR"
    );
  });

  it("Should throw error when username contains restricted character", () => {
    //Arrange
    const payload = {
      username: "dico ding",
      password: "supersecretpassword",
      fullname: "dicoding user",
    };

    //Action and Assert
    expect(() => new RegisterUser(payload)).toThrow(
      "REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER"
    );
  });

  it("should create registerUser object correctly", () => {
    // Arrange
    const payload = {
      username: "dicoding",
      fullname: "Dicoding Indonesia",
      password: "supersecretpassword",
    };
    // Action
    const { username, fullname, password } = new RegisterUser(payload);
    // Assert
    expect(username).toEqual(payload.username);
    expect(fullname).toEqual(payload.fullname);
    expect(password).toEqual(payload.password);
  });
});
