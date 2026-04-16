import GetThreadDetailUseCase from '../../../../Applications/use_case/threads/GetThreadDetailUseCase.js';
import AddThreadUseCase from '../../../../Applications/use_case/threads/AddThreadUseCase.js';

class ThreadsController {
  constructor(container) {
    this._container = container;

    this.postThreadController = this.postThreadController.bind(this);
    this.getThreadController = this.getThreadController.bind(this);
  }

  async postThreadController(req, res) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);

    const addedThread = await addThreadUseCase.execute({
      ...req.body,
      owner: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        addedThread,
      },
    });
  }

  async getThreadController(req, res) {
    const getThreadDetailUseCase = this._container.getInstance(GetThreadDetailUseCase.name);
    const getThread = await getThreadDetailUseCase.execute(req.params.threadId);

    res.status(200).json({
      status: 'success',
      data: {
        thread: getThread,
      },
    });
  }
}

export default ThreadsController;
