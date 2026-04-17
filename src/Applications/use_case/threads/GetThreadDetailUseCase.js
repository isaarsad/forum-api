import DetailThread from '../../../Domains/threads/entities/DetailThread.js';
import { mapCommentDBToModel, mapReplyDBToModel } from '../../../Commons/utils/index.js';

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);

    const [dataComments, dataReplies] = await Promise.all([
      this._commentRepository.getCommentsByThreadId(threadId),
      this._replyRepository.getRepliesByThreadId(threadId),
    ]);

    const comments = dataComments.map(mapCommentDBToModel);
    const replies = dataReplies.map(mapReplyDBToModel);

    const commentsWithReplies = this._mapRepliesToComments(comments, replies);

    return new DetailThread({
      ...thread,
      comments: commentsWithReplies,
    });
  }

  _mapRepliesToComments(comments, replies) {
    const replyMap = replies.reduce((acc, reply) => {
      if (!acc[reply.commentId]) {
        acc[reply.commentId] = [];
      }
      acc[reply.commentId].push(reply);
      return acc;
    }, {});

    return comments.map((comment) => ({
      ...comment,
      replies: replyMap[comment.id] || [],
    }));
  }
}

export default GetThreadDetailUseCase;
