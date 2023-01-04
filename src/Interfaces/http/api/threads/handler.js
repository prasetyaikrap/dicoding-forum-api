import AddThreadUseCase from "#Applications/usecase/AddThreadUseCase";
import autoBind from "auto-bind";

export default class ThreadsHandler {
  constructor(container) {
    this._container = container;
    autoBind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { id: credentialId } = request.auth.credentials;
    const useCasePayload = {
      credentialId,
      threadPayload: request.payload,
    };
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    const response = h.response({
      status: "success",
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async postCommentOnThreadHandler(request, h) {}

  async postReplyOnCommentHandler(request, h) {}

  async deleteCommentOnThreadHandler(request, h) {}

  async deleteReplyOnCommentHandler(request, h) {}

  async getThreadDetailHandler(request, h) {}
}
