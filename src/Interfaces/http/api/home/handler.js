import autoBind from "auto-bind";

export default class HomeHandler {
  constructor() {
    autoBind(this);
  }

  async getHomeHandler(request, h) {
    const response = h.response({
      status: "success",
      message: "Forum API dicoding is running successfully",
    });
    response.code(200);
    return response;
  }
}
