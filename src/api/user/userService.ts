import type { User } from '@/api/user/userModel';
import { UserRepository } from '@/api/user/userRepository';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { createChildLogger } from '@/common/utils/logger';
import { StatusCodes } from '@/common/utils/statusCodes';

export class UserService {
  private userRepository: UserRepository;
  private userLogger = createChildLogger('user-service');

  constructor(repository: UserRepository = new UserRepository()) {
    this.userRepository = repository;
  }

  // Retrieves all users from the database
  async findAll(): Promise<ServiceResponse<User[] | null>> {
    try {
      const users = await this.userRepository.findAllAsync();
      if (!users || users.length === 0) {
        return ServiceResponse.failure('No Users found', null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<User[]>('Users found', users);
    } catch (ex) {
      const errorMessage = `Error finding all users: $${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while retrieving users.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Retrieves a single user by their ID
  async findById(id: number): Promise<ServiceResponse<User | null>> {
    try {
      this.userLogger.info(`Finding user with id ${id}`);
      const user = await this.userRepository.findByIdAsync(id);
      if (!user) {
        return ServiceResponse.failure('User not found', null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<User>('User found', user);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure('An error occurred while finding user.', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Retrieves a single user by their email
  async findByEmail(email: string): Promise<ServiceResponse<User | null>> {
    try {
      this.userLogger.info(`Finding user with email ${email}`);
      const user = await this.userRepository.findByEmailAsync(email);
      if (!user) {
        return ServiceResponse.failure('User not found', null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<User>('User found', user);
    } catch (ex) {
      const errorMessage = `Error finding user with email ${email}:, ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure('An error occurred while finding user.', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Retrieves a single user by their phone number
  async findByPhoneNumber(phoneNumber: string): Promise<ServiceResponse<User | null>> {
    try {
      this.userLogger.info(`Finding user with phone number ${phoneNumber}`);
      const user = await this.userRepository.findByPhoneNumberAsync(phoneNumber);
      if (!user) {
        return ServiceResponse.failure('User not found', null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<User>('User found', user);
    } catch (ex) {
      const errorMessage = `Error finding user with phone number ${phoneNumber}:, ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure('An error occurred while finding user.', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Creates a new user
  async create(user: User): Promise<ServiceResponse<User | null>> {
    try {
      this.userLogger.info(`Creating user with email ${user.email}`);
      const createdUser = await this.userRepository.createAsync(user);
      return ServiceResponse.success<User>('User created', createdUser);
    } catch (ex) {
      const errorMessage = `Error creating user with email ${user.email}:, ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure('An error occurred while creating user.', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Updates an existing user
  async update(id: number, user: User): Promise<ServiceResponse<User | null>> {
    try {
      this.userLogger.info(`Updating user with id ${id}`);
      const updatedUser = await this.userRepository.updateAsync(id, user);
      return ServiceResponse.success<User>('User updated', updatedUser);
    } catch (ex) {
      const errorMessage = `Error updating user with id ${id}:, ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure('An error occurred while updating user.', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Deletes a user by their ID
  async delete(id: number): Promise<ServiceResponse<User | null>> {
    try {
      this.userLogger.info(`Deleting user with id ${id}`);
      const deletedUser = await this.userRepository.deleteAsync(id);
      return ServiceResponse.success<User>('User deleted', deletedUser);
    } catch (ex) {
      const errorMessage = `Error deleting user with id ${id}:, ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure('An error occurred while deleting user.', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const userService = new UserService();
