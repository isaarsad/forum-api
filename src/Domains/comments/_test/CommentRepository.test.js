import CommentRepository from '../CommentRepository.js';

describe('CommentRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    // Arrange
    const commentRepository = new CommentRepository();

    // Action & Assert
    await expect(commentRepository.addComment('')).rejects.toThrow(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(commentRepository.verifyCommentAvailability('')).rejects.toThrow(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(commentRepository.verifyCommentOwner('')).rejects.toThrow(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(commentRepository.deleteComment('')).rejects.toThrow(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(commentRepository.getCommentsByThreadId('')).rejects.toThrow(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
