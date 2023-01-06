export default class GetThreadDetailsUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    // Get Thread Details
    return await this._threadRepository.getThreadById(threadId);
  }
}
