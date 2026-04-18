import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import NewThread from '../../../Domains/threads/entities/NewThread.js';

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { title, body, owner } = useCasePayload;

    const newThread = new NewThread({ title, body, owner });

    const addedThread = await this._threadRepository.addThread(newThread);
    return new AddedThread({
      id: addedThread.id,
      title: addedThread.title,
      owner: addedThread.owner,
    });
  }
}

export default AddThreadUseCase;
