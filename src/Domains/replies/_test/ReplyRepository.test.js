import ReplyRepository from '../ReplyRepository.js';

describe('ReplyRepository', () => {
  it('should throw error when invoke unimplemented method', async () => {
    // Arrange
    const replyRepository = new ReplyRepository();

    // Action & Assert
    await expect(replyRepository.addReply('')).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(replyRepository.verifyReplyAvailability('')).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(replyRepository.verifyReplyOwner('')).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(replyRepository.deleteReply('')).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(replyRepository.getRepliesByThreadId('')).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
