import DetailReply from '../DetailReply.js';

describe('a DetailReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'username',
      date: 'date',
    };

    // Action & Assert
    expect(() => new DetailReply(payload)).toThrow('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw new error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'username',
      date: '2021-08-08T07:22:33.555Z',
      content: 'content',
      isDelete: 'true',
    };

    // Action & Assert
    expect(() => new DetailReply(payload)).toThrow('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailReply object correctly when reply is deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'username',
      date: '2021-08-08T07:22:33.555Z',
      content: 'content',
      isDelete: true,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.username).toEqual(payload.username);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.content).toEqual('**balasan telah dihapus**');
  });

  it('should create detailReply object correctly when reply is NOT deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'username',
      date: '2021-08-08T07:22:33.555Z',
      content: 'content',
      isDelete: false,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.username).toEqual(payload.username);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.content).toEqual(payload.content);
  });
});
