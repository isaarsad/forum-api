import DeleteReply from '../DeleteReply.js';

describe('a DeleteReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    // Action & Assert
    expect(() => new DeleteReply(payload)).toThrow('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      replyId: 'reply-123',
      commentId: 123,
      threadId: true,
      owner: 'user-123',
    };

    // Action & Assert
    expect(() => new DeleteReply(payload)).toThrow('DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create deleteReply object correctly', () => {
    // Arrange
    const payload = {
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Action
    const deleteReply = new DeleteReply(payload);

    // Assert
    expect(deleteReply.replyId).toEqual(payload.replyId);
    expect(deleteReply.commentId).toEqual(payload.commentId);
    expect(deleteReply.threadId).toEqual(payload.threadId);
    expect(deleteReply.owner).toEqual(payload.owner);
  });
});
