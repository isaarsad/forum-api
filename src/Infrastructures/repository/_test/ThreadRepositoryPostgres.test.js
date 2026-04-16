import NewThread from '../../../Domains/threads/entities/NewThread.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import pool from '../../database/postgres/pool.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-111',
      username: 'userthread',
      password: 'secret',
      fullname: 'username thread',
    });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'title',
        body: 'body',
        owner: 'user-111',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'title',
        body: 'body',
        owner: 'user-111',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'title',
          owner: 'user-111',
        }),
      );
    });
  });

  describe('verifyThreadAvailability function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-111',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-xxx')).rejects.toThrow(
        new NotFoundError('thread not found'),
      );
    });

    it('should not throw NotFoundError when thread available', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-111',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadAvailability('thread-123'),
      ).resolves.not.toThrow(new NotFoundError('thread not found'));
    });
  });

  describe('getThreadById function', () => {
    it('should return thread correctly', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'my thread title',
        body: 'my thread body',
        owner: 'user-111',
        date: '2026-04-08T07:00:00.000Z',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread).toStrictEqual({
        id: 'thread-123',
        title: 'my thread title',
        body: 'my thread body',
        date: '2026-04-08T07:00:00.000Z',
        username: 'userthread',
      });
    });

    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-xxx')).rejects.toThrow(
        new NotFoundError('thread not found'),
      );
    });
  });
});
