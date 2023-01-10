import AddThreadUseCase from "#Applications/usecase/threads/AddThreadUseCase";
import ThreadRepository from "#Domains/threads/ThreadsRepository";
import { jest } from "@jest/globals";

describe("AddThreadUseCase", () => {
  it("Should orchestrating add thread correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialId: "someCredentialId",
      threadPayload: {
        title: "New thread title",
        body: "New thread body",
      },
    };
    const expectedAddedThread = {
      id: "thread-12345",
      title: useCasePayload.threadPayload.title,
      owner: useCasePayload.credentialId,
    };

    //Mock
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addNewThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedAddedThread));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addNewThread).toHaveBeenCalledWith({
      ownerId: useCasePayload.credentialId,
      title: useCasePayload.threadPayload.title,
      body: useCasePayload.threadPayload.body,
    });
  });
});
