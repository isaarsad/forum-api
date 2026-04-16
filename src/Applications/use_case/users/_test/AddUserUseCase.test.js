import { vi } from 'vitest';
import RegisterUser from '../../../../Domains/users/entities/RegisterUser.js';
import RegisteredUser from '../../../../Domains/users/entities/RegisteredUser.js';
import UserRepository from '../../../../Domains/users/UserRepository.js';
import PasswordHash from '../../../security/PasswordHash.js';
import AddUserUseCase from '../AddUserUseCase.js';
import InvariantError from '../../../../Commons/exceptions/InvariantError.js';

describe('AddUserUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add user action correctly', async () => {
    // Arrange
    const useCasePayload = {
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };

    const mockRegisteredUser = new RegisteredUser({
      id: 'user-123',
      username: useCasePayload.username,
      fullname: useCasePayload.fullname,
    });

    /** creating dependency of use case */
    const mockUserRepository = new UserRepository();
    const mockPasswordHash = new PasswordHash();

    /** mocking needed function */
    mockUserRepository.verifyAvailableUsername = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockPasswordHash.hash = vi.fn().mockImplementation(() => Promise.resolve('encrypted_password'));
    mockUserRepository.addUser = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockRegisteredUser));

    /** creating use case instance */
    const addUserUseCase = new AddUserUseCase({
      userRepository: mockUserRepository,
      passwordHash: mockPasswordHash,
    });

    // Action
    const registeredUser = await addUserUseCase.execute(useCasePayload);

    // Assert
    expect(registeredUser).toStrictEqual(
      new RegisteredUser({
        id: 'user-123',
        username: useCasePayload.username,
        fullname: useCasePayload.fullname,
      }),
    );

    expect(mockUserRepository.verifyAvailableUsername).toBeCalledWith(useCasePayload.username);
    expect(mockPasswordHash.hash).toBeCalledWith(useCasePayload.password);
    expect(mockUserRepository.addUser).toBeCalledWith(
      new RegisterUser({
        username: useCasePayload.username,
        password: 'encrypted_password',
        fullname: useCasePayload.fullname,
      }),
    );
  });

  it('should throw error when username not available', async () => {
    // Arrange

    /** creating dependency of use case */
    const mockUserRepository = new UserRepository();
    const mockPasswordHash = new PasswordHash();

    /** mocking needed function */
    mockUserRepository.verifyAvailableUsername = vi
      .fn()
      .mockImplementation(() => Promise.reject(new InvariantError('USERNAME_NOT_AVAILABLE')));
    mockPasswordHash.hash = vi.fn().mockImplementation(() => Promise.resolve('encrypted_password'));

    /** creating use case instance */
    const addUserUseCase = new AddUserUseCase({
      userRepository: mockUserRepository,
      passwordHash: mockPasswordHash,
    });

    // Action & Assert
    await expect(
      addUserUseCase.execute({
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      }),
    ).rejects.toThrow(InvariantError);

    expect(mockUserRepository.verifyAvailableUsername).toBeCalled();
    expect(mockPasswordHash.hash).not.toBeCalled();
  });
});
