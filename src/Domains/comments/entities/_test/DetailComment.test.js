import DetailComment from '../DetailComment.js';

describe('a DetailComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'username',
      date: 'date',
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrow('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw new error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'username',
      date: 12122002,
      content: 'content',
      isDelete: 'false',
      replies: {},
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrow(
      'DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create detailComment object correctly when comment is deleted', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'username',
      date: '2021-08-08T07:22:33.555Z',
      content: 'content',
      isDelete: true,
      replies: [],
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual('**komentar telah dihapus**');
  });

  it('should create detailComment object correctly when comment is NOT deleted', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'username',
      date: '2021-08-08T07:22:33.555Z',
      content: 'content',
      isDelete: false,
      replies: [],
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual(payload.content);
  });
});
