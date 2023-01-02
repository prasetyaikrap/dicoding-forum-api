import AddUserUseCase from "#Applications/usecase/AddUserUseCase";
import autoBind from "auto-bind";

export default class UsersHandler {
  constructor(container) {
    this._container = container;
    autoBind(this);
  }

  async postUserHandler(request, h) {
    const addUserUseCase = this._container.getInstance(AddUserUseCase.name);
    const addedUser = await addUserUseCase.execute(request.payload);

    const response = h.response({
      status: "success",
      data: {
        addedUser,
      },
    });
    response.code(201);
    return response;
  }
}
