import request from 'supertest';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';
import container from '../../container.js';
import pool from '../../database/postgres/pool.js';
import createServer from '../createServer.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';

describe('HTTP Server - Comments API', () => {
  let app;
  let accessToken;
  const threadId = 'thread-123';
  const userId = 'user-123';

  const params = {
    threadId,
    commentId: 'comment-123',
    owner: userId,
  };

  beforeEach(async () => {
    app = await createServer(container);

    await UsersTableTestHelper.addUser({
      id: userId,
      username: 'usercomment',
    });

    await ThreadsTableTestHelper.addThread({
      id: threadId,
      owner: userId,
    });

    const tokenManager = container.getInstance(AuthenticationTokenManager.name);
    accessToken = await tokenManager.createAccessToken({
      id: userId,
      username: 'usercomment',
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should respond 201 and persisted comment', async () => {
      // Arrange
      const payload = { content: 'comment content' };

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedComment).toBeDefined();
      expect(response.body.data.addedComment.id).toBeDefined();
      expect(response.body.data.addedComment.content).toEqual(payload.content);
      expect(response.body.data.addedComment.owner).toEqual('user-123');
    });

    it('should respond with 404 when thread is not found', async () => {
      // Arrange
      const payload = { content: 'comment content' };

      // Action
      const response = await request(app)
        .post('/threads/thread-xxx/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('thread not found');
    });

    it('should respond 400 when property is missing', async () => {
      // Arrange
      const payload = {};

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('cannot create comment, missing required property');
    });

    it('should respond 400 when request params not meet data type specification', async () => {
      // Arrange
      const payload = { content: 123 };

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('cannot create comment, invalid data type');
    });

    it('should respond 401 when request without access token', async () => {
      // Arrange
      const payload = { content: 'comment content' };

      // Action
      const response = await request(app).post(`/threads/${threadId}/comments`).send(payload);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should respond 401 when token format is invalid', async () => {
      // Arrange
      const payload = { content: 'comment content' };

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', 'Bearer')
        .send(payload);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Token Invalid');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should respond 200 and soft delete comment correctly', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: params.commentId,
        threadId: params.threadId,
        owner: params.owner,
      });

      // Action
      const response = await request(app)
        .delete(`/threads/${params.threadId}/comments/${params.commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');

      const comments = await CommentsTableTestHelper.findCommentById(params.commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toEqual(true);
    });

    it('should respond 401 when request without access token', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: params.commentId,
        threadId: params.threadId,
        owner: params.owner,
      });

      // Action
      const response = await request(app)
        .delete(`/threads/${params.threadId}/comments/${params.commentId}`)
        .send(params);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should respond 401 when token format is invalid', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: params.commentId,
        threadId: params.threadId,
        owner: params.owner,
      });

      // Action
      const response = await request(app)
        .delete(`/threads/${params.threadId}/comments/${params.commentId}`)
        .set('Authorization', 'Bearer')
        .send(params);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Token Invalid');
    });

    it('should respond 403 when user is not the comment owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-xxx', username: 'userxxx' });

      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const userToken = await tokenManager.createAccessToken({
        id: 'user-xxx',
        username: 'userxxx',
      });

      await CommentsTableTestHelper.addComment({
        id: params.commentId,
        threadId: params.threadId,
        owner: params.owner,
      });

      // Action
      const response = await request(app)
        .delete(`/threads/${params.threadId}/comments/${params.commentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      // Assert
      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('you are not allowed to access this resource');
    });

    it('should respond with 404 when thread is not found', async () => {
      await CommentsTableTestHelper.addComment({
        id: params.commentId,
        threadId: params.threadId,
        owner: params.owner,
      });

      // Action
      const response = await request(app)
        .delete(`/threads/thread-xxx/comments/${params.commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('thread not found');
    });

    it('should respond with 404 when comment is not found', async () => {
      await CommentsTableTestHelper.addComment({
        id: params.commentId,
        threadId: params.threadId,
        owner: params.owner,
      });

      // Action
      const response = await request(app)
        .delete(`/threads/${params.threadId}/comments/comment-xxx`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('comment not found');
    });
  });
});
