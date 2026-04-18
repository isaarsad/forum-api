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
  it('should orchestrate the add user action correctly', async () => {
    // Arrange
    const useCasePayload = {
      username: 'arsadisa',
      password: 'secret',
      fullname: 'Isa Arsad',
    };

    const mockRegisteredUser = {
      id: 'user-123',
      username: useCasePayload.username,
      fullname: useCasePayload.fullname,
    };

    /** creating dependency of use case */
    const mockUserRepository = new UserRepository();
    const mockPasswordHash = new PasswordHash();

    /** mocking needed function */
    mockUserRepository.verifyAvailableUsername = vi.fn().mockResolvedValue();
    mockPasswordHash.hash = vi.fn().mockResolvedValue('encrypted_password');
    mockUserRepository.addUser = vi.fn().mockResolvedValue(mockRegisteredUser);

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
        id: mockRegisteredUser.id,
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
    const useCasePayload = {
      username: 'arsadisa',
      password: 'secret',
      fullname: 'Isa Arsad',
    };
    /** creating dependency of use case */
    const mockUserRepository = new UserRepository();
    const mockPasswordHash = new PasswordHash();

    /** mocking needed function */
    mockUserRepository.verifyAvailableUsername = vi
      .fn()
      .mockRejectedValue(new InvariantError('USERNAME_NOT_AVAILABLE'));
    mockPasswordHash.hash = vi.fn().mockResolvedValue('encrypted_password');
    mockUserRepository.addUser = vi.fn();

    /** creating use case instance */
    const addUserUseCase = new AddUserUseCase({
      userRepository: mockUserRepository,
      passwordHash: mockPasswordHash,
    });

    // Action & Assert
    await expect(addUserUseCase.execute(useCasePayload)).rejects.toThrow(InvariantError);

    expect(mockUserRepository.verifyAvailableUsername).toBeCalledWith(useCasePayload.username);
    expect(mockPasswordHash.hash).not.toBeCalled();
    expect(mockUserRepository.addUser).not.toBeCalled();
  });
});
