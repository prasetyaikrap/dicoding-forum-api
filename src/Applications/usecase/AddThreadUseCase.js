import AddThread from "#Domains/threads/entities/AddThread";

export default class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { credentialId, threadPayload } = useCasePayload;
    // verify thread payload
    const { title, body } = new AddThread(threadPayload);

    //Add thread to database and return the result
    return this._threadRepository.addNewThread({
      ownerId: credentialId,
      title,
      body,
    });
  }
}
