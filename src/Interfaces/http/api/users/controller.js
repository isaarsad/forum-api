import AddUserUseCase from '../../../../Applications/use_case/users/AddUserUseCase.js';

class UsersController {
  constructor(container) {
    this._container = container;

    this.postUserController = this.postUserController.bind(this);
  }

  async postUserController(req, res) {
    const addUserUseCase = this._container.getInstance(AddUserUseCase.name);
    const addedUser = await addUserUseCase.execute(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        addedUser,
      },
    });
  }
}

export default UsersController;
