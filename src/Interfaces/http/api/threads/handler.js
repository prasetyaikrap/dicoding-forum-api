import AddCommentOnThreadUseCase from "#Applications/usecase/threads/AddCommentOnThreadUseCase";
import AddReplyOnCommentUseCase from "#Applications/usecase/threads/AddReplyOnCommentUseCase";
import AddThreadUseCase from "#Applications/usecase/threads/AddThreadUseCase";
import DeleteCommentOnThreadUseCase from "#Applications/usecase/threads/DeleteCommentOnThreadUseCase";
import DeleteReplyOnCommentUseCase from "#Applications/usecase/threads/DeleteReplyOnCommentUseCase";
import GetThreadDetailsUseCase from "#Applications/usecase/threads/GetThreadDetailsUseCase";
import UpdateCommentLikesUseCase from "#Applications/usecase/threads/UpdateCommentLikesUseCase";
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

  async postCommentOnThreadHandler(request, h) {
    const addCommentOnThreadUseCase = this._container.getInstance(
      AddCommentOnThreadUseCase.name
    );
    const { id: credentialId } = request.auth.credentials;
    const { threadId } = request.params;
    const useCasePayload = {
      credentialId,
      threadId,
      commentPayload: request.payload,
    };
    const { addedComment } = await addCommentOnThreadUseCase.execute(
      useCasePayload
    );
    const response = h.response({
      status: "success",
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async postReplyOnCommentHandler(request, h) {
    const addReplyOnCommentUseCase = this._container.getInstance(
      AddReplyOnCommentUseCase.name
    );
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const useCasePayload = {
      credentialId,
      threadId,
      commentId,
      replyPayload: request.payload,
    };
    const { addedReply } = await addReplyOnCommentUseCase.execute(
      useCasePayload
    );
    const response = h.response({
      status: "success",
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentOnThreadHandler(request, h) {
    const deleteCommentOnThreadUseCase = this._container.getInstance(
      DeleteCommentOnThreadUseCase.name
    );
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const useCasePayload = {
      threadId,
      commentId,
      credentialId,
    };
    // execute deleteComment
    await deleteCommentOnThreadUseCase.execute(useCasePayload);
    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }

  async deleteReplyOnCommentHandler(request, h) {
    const deleteReplyOnCommentUseCase = this._container.getInstance(
      DeleteReplyOnCommentUseCase.name
    );
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;
    const useCasePayload = {
      threadId,
      commentId: replyId,
      replyCommentId: commentId,
      credentialId,
    };
    // execute deleteComment
    await deleteReplyOnCommentUseCase.execute(useCasePayload);
    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }

  async getThreadDetailHandler(request, h) {
    const getThreadDetailsUseCase = this._container.getInstance(
      GetThreadDetailsUseCase.name
    );
    const { threadId } = request.params;
    const useCasePayload = {
      threadId,
    };

    //Get thread details
    const { thread } = await getThreadDetailsUseCase.execute(useCasePayload);

    const response = h.response({
      status: "success",
      data: {
        thread,
      },
    });
    response.code(200);
    return response;
  }

  async updateCommentLikesHandler(request, h) {
    const updateCommentLikesUseCase = this._container.getInstance(
      UpdateCommentLikesUseCase.name
    );
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const useCasePayload = {
      threadId,
      commentId,
      userId: credentialId,
    };
    // execute update likes
    await updateCommentLikesUseCase.execute(useCasePayload);
    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }
}
