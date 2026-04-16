import LoginUserUseCase from '../../../../Applications/use_case/authentications/LoginUserUseCase.js';
import RefreshAuthenticationUseCase from '../../../../Applications/use_case/authentications/RefreshAuthenticationUseCase.js';
import LogoutUserUseCase from '../../../../Applications/use_case/authentications/LogoutUserUseCase.js';

class AuthenticationsController {
  constructor(container) {
    this._container = container;

    this.postAuthenticationController = this.postAuthenticationController.bind(this);
    this.putAuthenticationController = this.putAuthenticationController.bind(this);
    this.deleteAuthenticationController = this.deleteAuthenticationController.bind(this);
  }

  async postAuthenticationController(req, res) {
    const loginUserUseCase = this._container.getInstance(LoginUserUseCase.name);
    const { accessToken, refreshToken } = await loginUserUseCase.execute(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });
  }

  async putAuthenticationController(req, res) {
    const refreshAuthenticationUseCase = this._container.getInstance(
      RefreshAuthenticationUseCase.name,
    );
    const accessToken = await refreshAuthenticationUseCase.execute(req.body);

    res.json({
      status: 'success',
      data: {
        accessToken,
      },
    });
  }

  async deleteAuthenticationController(req, res) {
    const logoutUserUseCase = this._container.getInstance(LogoutUserUseCase.name);
    await logoutUserUseCase.execute(req.body);

    res.json({
      status: 'success',
    });
  }
}

export default AuthenticationsController;
