import { vi } from 'vitest';
import NewThread from '../../../../Domains/threads/entities/NewThread.js';
import AddedThread from '../../../../Domains/threads/entities/AddedThread.js';
import ThreadRepository from '../../../../Domains/threads/ThreadRepository.js';
import AddThreadUseCase from '../AddThreadUseCase.js';

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'title',
      body: 'body',
    };
    const owner = 'user-123';

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: owner,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });

    // Action
    const addedThread = await addThreadUseCase.execute({ ...useCasePayload, owner });

    // Assert
    expect(addedThread).toStrictEqual(
      new AddedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner: owner,
      }),
    );

    expect(mockThreadRepository.addThread).toBeCalledWith(
      new NewThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: owner,
      }),
    );
  });
});
