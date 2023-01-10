import bcrypt from "bcrypt";
import BcryptPasswordHash from "#Infrastructures/security/BcryptPasswordHash";
import { jest } from "@jest/globals";

describe("BcryptPasswordHash", () => {
  describe("hash function", () => {
    it("should encrypt password correctly", async () => {
      // Arrange
      const spyHash = jest.spyOn(bcrypt, "hash");
      const passwordHash = new BcryptPasswordHash(bcrypt);

      // Action
      const encryptedPassword = await passwordHash.hash("plain_password");

      // Assert
      expect(typeof encryptedPassword).toEqual("string");
      expect(encryptedPassword).not.toEqual("plain_password");
      expect(spyHash).toHaveBeenCalledWith("plain_password", 10); // 10 adalah nilai saltRound default untuk PasswordHash
    });
  });
});
