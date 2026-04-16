import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';

describe('HTTP Server - Threads API', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should respond 201 and persisted thread', async () => {
      // Arrange
      const payload = {
        title: 'thread title',
        body: 'thread body',
      };

      const app = await createServer(container);

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'userthread' });

      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({
        id: 'user-123',
        username: 'userthread',
      });

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.id).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual(payload.title);
      expect(response.body.data.addedThread.owner).toEqual('user-123');
    });

    it('should respond 400 when title or body is missing', async () => {
      // Arrange
      const payload = {
        title: 'thread title',
      };
      const app = await createServer(container);

      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({
        id: 'user-123',
        username: 'userthread',
      });

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('cannot create thread, missing required property');
    });

    it('should respond 400 when request payload not meet data type specification', async () => {
      // Arrange
      const payload = {
        title: 'thread title',
        body: 123,
      };
      const app = await createServer(container);

      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({
        id: 'user-123',
        username: 'userthread',
      });

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('cannot create thread, invalid data type');
    });

    it('should respond 401 when request without access token', async () => {
      // Arrange
      const payload = {
        title: 'thread title',
        body: 'ini adalah body thread',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post('/threads').send(payload);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should respond 401 when token format is invalid', async () => {
      // Arrange
      const payload = {
        title: 'thread title',
        body: 'ini adalah body thread',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', 'Bearer')
        .send(payload);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Token Invalid');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should respond 200 and return thread  detail', async () => {
      // Arrange
      const payload = {
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        date: '2026-04-12T07:00:00.000Z',
        owner: 'user-123',
      };

      const app = await createServer(container);

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'userthread' });
      await ThreadsTableTestHelper.addThread(payload);

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'comment content',
      });
      // 4. Masukin Reply (Biar ketahuan endpoint-nya beneran ngeluarin replies!)
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
        content: 'reply content',
      });

      // Action
      const response = await request(app).get('/threads/thread-123');

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.id).toEqual(payload.id);
      expect(response.body.data.thread.title).toEqual(payload.title);
      expect(response.body.data.thread.body).toEqual(payload.body);
      expect(response.body.data.thread.date).toEqual(payload.date);
      expect(response.body.data.thread.username).toEqual('userthread');

      const { comments } = response.body.data.thread;
      expect(Array.isArray(comments)).toBe(true);
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].content).toEqual('comment content');

      const { replies } = comments[0];
      expect(Array.isArray(replies)).toBe(true);
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual('reply-123');
      expect(replies[0].content).toEqual('reply content');
      expect(replies[0].username).toEqual('userthread');
    });

    it('should respond 404 when thread not found', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).get('/threads/thread-xxx');

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('thread not found');
    });
  });
});
