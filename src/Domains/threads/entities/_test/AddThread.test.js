import AddThread from "#Domains/threads/entities/AddThread";

describe("AddThreads Entities", () => {
  it("Should throw error when not contain need property", () => {
    // Arrange
    const payload = {
      title: "New Thread Added",
    };

    // Action & Assert
    expect(() => new AddThread(payload)).toThrow(
      "ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("Should throw error when not meet data type specification", () => {
    // Arrange
    const payload = {
      title: "New Thread Added",
      body: 12345,
    };

    // Action & Assert
    expect(() => new AddThread(payload)).toThrow(
      "ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("Should create proper addThread object", () => {
    // Arrange
    const payload = {
      title: "New Thread Added",
      body: "body of the thread",
    };

    // Action
    const addedThread = new AddThread(payload);

    // Assert
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.body).toEqual(payload.body);
  });
});
