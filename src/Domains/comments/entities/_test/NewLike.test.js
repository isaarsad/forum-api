import NewLike from '../NewLike.js';

describe('NewLike entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    // Action & Assert
    expect(() => new NewLike(payload)).toThrow('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 123,
      commentId: 'comment-123',
      userId: {},
    };

    // Action & Assert
    expect(() => new NewLike(payload)).toThrow('NEW_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewLike entities correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    // Action
    const newLike = new NewLike(payload);

    // Assert
    expect(newLike).toBeInstanceOf(NewLike);
    expect(newLike.threadId).toEqual(payload.threadId);
    expect(newLike.commentId).toEqual(payload.commentId);
    expect(newLike.userId).toEqual(payload.userId);
  });
});
