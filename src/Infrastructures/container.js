import { createContainer } from 'instances-container';

// --- External & Database ---
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from './database/postgres/pool.js';

// --- Domains ---
import UserRepository from '../Domains/users/UserRepository.js';
import AuthenticationRepository from '../Domains/authentications/AuthenticationRepository.js';
import ThreadRepository from '../Domains/threads/ThreadRepository.js';
import CommentRepository from '../Domains/comments/CommentRepository.js';
import ReplyRepository from '../Domains/replies/ReplyRepository.js';

// --- Applications (Use Cases & Security Interfaces) ---
import PasswordHash from '../Applications/security/PasswordHash.js';
import AuthenticationTokenManager from '../Applications/security/AuthenticationTokenManager.js';

import AddUserUseCase from '../Applications/use_case/users/AddUserUseCase.js';
import LoginUserUseCase from '../Applications/use_case/authentications/LoginUserUseCase.js';
import LogoutUserUseCase from '../Applications/use_case/authentications/LogoutUserUseCase.js';
import RefreshAuthenticationUseCase from '../Applications/use_case/authentications/RefreshAuthenticationUseCase.js';

import AddThreadUseCase from '../Applications/use_case/threads/AddThreadUseCase.js';
import GetThreadDetailUseCase from '../Applications/use_case/threads/GetThreadDetailUseCase.js';
import AddCommentUseCase from '../Applications/use_case/comments/AddCommentUseCase.js';
import DeleteCommentUseCase from '../Applications/use_case/comments/DeleteCommentUseCase.js';
import LikeCommentUseCase from '../Applications/use_case/comments/LikeCommentUseCase.js';
import AddReplyUseCase from '../Applications/use_case/replies/AddReplyUseCase.js';
import DeleteReplyUseCase from '../Applications/use_case/replies/DeleteReplyUseCase.js';

// --- Infrastructure Implementations ---
import UserRepositoryPostgres from './repository/UserRepositoryPostgres.js';
import AuthenticationRepositoryPostgres from './repository/AuthenticationRepositoryPostgres.js';
import ThreadRepositoryPostgres from './repository/ThreadRepositoryPostgres.js';
import CommentRepositoryPostgres from './repository/CommentRepositoryPostgres.js';
import ReplyRepositoryPostgres from './repository/ReplyRepositoryPostgres.js';
import BcryptPasswordHash from './security/BcryptPasswordHash.js';
import JwtTokenManager from './security/JwtTokenManager.js';

const container = createContainer();

// Registering Repositories and Security Services
container.register([
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: { dependencies: [{ concrete: pool }, { concrete: nanoid }] },
  },
  {
    key: AuthenticationRepository.name,
    Class: AuthenticationRepositoryPostgres,
    parameter: { dependencies: [{ concrete: pool }] },
  },
  {
    key: ThreadRepository.name,
    Class: ThreadRepositoryPostgres,
    parameter: { dependencies: [{ concrete: pool }, { concrete: nanoid }] },
  },
  {
    key: CommentRepository.name,
    Class: CommentRepositoryPostgres,
    parameter: { dependencies: [{ concrete: pool }, { concrete: nanoid }] },
  },
  {
    key: ReplyRepository.name,
    Class: ReplyRepositoryPostgres,
    parameter: { dependencies: [{ concrete: pool }, { concrete: nanoid }] },
  },
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: { dependencies: [{ concrete: bcrypt }] },
  },
  {
    key: AuthenticationTokenManager.name,
    Class: JwtTokenManager,
    parameter: { dependencies: [{ concrete: jwt }] },
  },
]);

// Registering Use Cases
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'userRepository', internal: UserRepository.name },
        { name: 'passwordHash', internal: PasswordHash.name },
      ],
    },
  },
  {
    key: LoginUserUseCase.name,
    Class: LoginUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'userRepository', internal: UserRepository.name },
        { name: 'authenticationRepository', internal: AuthenticationRepository.name },
        { name: 'authenticationTokenManager', internal: AuthenticationTokenManager.name },
        { name: 'passwordHash', internal: PasswordHash.name },
      ],
    },
  },
  {
    key: LogoutUserUseCase.name,
    Class: LogoutUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [{ name: 'authenticationRepository', internal: AuthenticationRepository.name }],
    },
  },
  {
    key: RefreshAuthenticationUseCase.name,
    Class: RefreshAuthenticationUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'authenticationRepository', internal: AuthenticationRepository.name },
        { name: 'authenticationTokenManager', internal: AuthenticationTokenManager.name },
      ],
    },
  },
  {
    key: AddThreadUseCase.name,
    Class: AddThreadUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [{ name: 'threadRepository', internal: ThreadRepository.name }],
    },
  },
  {
    key: GetThreadDetailUseCase.name,
    Class: GetThreadDetailUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'threadRepository', internal: ThreadRepository.name },
        { name: 'commentRepository', internal: CommentRepository.name },
        { name: 'replyRepository', internal: ReplyRepository.name },
      ],
    },
  },
  {
    key: AddCommentUseCase.name,
    Class: AddCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'threadRepository', internal: ThreadRepository.name },
        { name: 'commentRepository', internal: CommentRepository.name },
      ],
    },
  },
  {
    key: DeleteCommentUseCase.name,
    Class: DeleteCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'threadRepository', internal: ThreadRepository.name },
        { name: 'commentRepository', internal: CommentRepository.name },
      ],
    },
  },
  {
    key: LikeCommentUseCase.name,
    Class: LikeCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'threadRepository', internal: ThreadRepository.name },
        { name: 'commentRepository', internal: CommentRepository.name },
      ],
    },
  },
  {
    key: AddReplyUseCase.name,
    Class: AddReplyUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'threadRepository', internal: ThreadRepository.name },
        { name: 'commentRepository', internal: CommentRepository.name },
        { name: 'replyRepository', internal: ReplyRepository.name },
      ],
    },
  },
  {
    key: DeleteReplyUseCase.name,
    Class: DeleteReplyUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'threadRepository', internal: ThreadRepository.name },
        { name: 'commentRepository', internal: CommentRepository.name },
        { name: 'replyRepository', internal: ReplyRepository.name },
      ],
    },
  },
]);

export default container;
