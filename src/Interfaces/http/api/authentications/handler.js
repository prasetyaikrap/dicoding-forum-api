import LoginUserUseCase from "#Applications/usecase/LoginUserUseCase";
import LogoutUserUseCase from "#Applications/usecase/LogoutUserUseCase";
import RefreshAuthUseCase from "#Applications/usecase/RefreshAuthUseCase";
import autoBind from "auto-bind";

export default class AuthenticationsHandler {
  constructor(container) {
    this._container = container;
    autoBind(this);
  }

  async postAuthenticationsHandler(request, h) {
    const loginUserUseCase = this._container.getInstance(LoginUserUseCase.name);
    const { accessToken, refreshToken } = await loginUserUseCase.execute(
      request.payload
    );

    const response = h.response({
      status: "success",
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }
  async putAuthenticationsHandler(request, h) {
    const refreshAuthUseCase = this._container.getInstance(
      RefreshAuthUseCase.name
    );
    const accessToken = await refreshAuthUseCase.execute(request.payload);

    const response = h.response({
      status: "success",
      data: {
        accessToken,
      },
    });
    response.code(200);
    return response;
  }

  async deleteAuthenticationsHandler(request, h) {
    const logoutUserUseCase = this._container.getInstance(
      LogoutUserUseCase.name
    );
    await logoutUserUseCase.execute(request.payload);

    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }
}
