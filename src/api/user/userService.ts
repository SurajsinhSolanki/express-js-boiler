import { CreateUserBody, UpdateUserBody, User } from '@/api/user/userModel';
import { UserRepository } from '@/api/user/userRepository';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { createChildLogger } from '@/common/utils/logger';
import { hashPassword, comparePasswords } from '@/common/utils/security';
import { generateAccessToken, generateRefreshToken, extractJwtPayload, verifyRefreshToken } from '@/common/utils/jwt';
import { StatusCodes } from '@/common/utils/statusCodes';
import ms from 'ms';
import { ENV } from '@/common/utils/config';
import { StringValue } from 'ms';
import { sendEmail } from '@/common/utils/emailService';

function excludePassword<T extends User | User[]>(
  user: T
): T extends User[] ? Omit<User, 'password'>[] : Omit<T, 'password'> {
  if (Array.isArray(user)) {
    return user.map(({ password: _password, ...rest }) => rest) as T extends User[]
      ? Omit<User, 'password'>[]
      : Omit<T, 'password'>;
  }
  const { password: _password, ...rest } = user;
  return rest as T extends User[] ? Omit<User, 'password'>[] : Omit<T, 'password'>;
}

export class UserService {
  private userRepository: UserRepository;
  private userLogger = createChildLogger('user-service');

  constructor(repository: UserRepository = new UserRepository()) {
    this.userRepository = repository;
  }

  async findAll(): Promise<ServiceResponse<Omit<User, 'password'>[] | null>> {
    try {
      const users = await this.userRepository.findAllAsync();
      if (!users || users.length === 0) {
        return ServiceResponse.failure('No Users found', null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<Omit<User, 'password'>[]>('Users found', excludePassword(users));
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

  async findById(id: number): Promise<ServiceResponse<Omit<User, 'password'> | null>> {
    try {
      this.userLogger.info(`Finding user with id ${id}`);
      const user = await this.userRepository.findByIdAsync(id);
      if (!user) {
        return ServiceResponse.failure('User not found', null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<Omit<User, 'password'>>('User found', excludePassword(user));
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure('An error occurred while finding user.', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findByEmail(email: string): Promise<ServiceResponse<Omit<User, 'password'> | null>> {
    try {
      this.userLogger.info(`Finding user with email ${email}`);
      const user = await this.userRepository.findByEmailAsync(email);
      if (!user) {
        return ServiceResponse.failure('User not found', null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<Omit<User, 'password'>>('User found', excludePassword(user));
    } catch (ex) {
      const errorMessage = `Error finding user with email ${email}:, ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure('An error occurred while finding user.', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findByPhoneNumber(phoneNumber: string): Promise<ServiceResponse<Omit<User, 'password'> | null>> {
    try {
      this.userLogger.info(`Finding user with phone number ${phoneNumber}`);
      const user = await this.userRepository.findByPhoneNumberAsync(phoneNumber);
      if (!user) {
        return ServiceResponse.failure('User not found', null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<Omit<User, 'password'>>('User found', excludePassword(user));
    } catch (ex) {
      const errorMessage = `Error finding user with phone number ${phoneNumber}:, ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure('An error occurred while finding user.', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async create(userData: CreateUserBody): Promise<ServiceResponse<Omit<User, 'password'> | null>> {
    try {
      if (userData.email) {
        const existingUser = await this.userRepository.findByEmailAsync(userData.email);
        if (existingUser) {
          return ServiceResponse.failure('User with this email already exists', null, StatusCodes.CONFLICT);
        }
      }
      if (userData.phoneNumber) {
        const existingUser = await this.userRepository.findByPhoneNumberAsync(userData.phoneNumber);
        if (existingUser) {
          return ServiceResponse.failure('User with this phone number already exists', null, StatusCodes.CONFLICT);
        }
      }

      const hashedPassword = await hashPassword(userData.password);

      this.userLogger.info(`Creating user with email ${userData.email || userData.phoneNumber}`);
      const createdUser = await this.userRepository.createAsync({
        ...userData,
        password: hashedPassword
      } as User); // Cast to User as Prisma expects the full model

      return ServiceResponse.success<Omit<User, 'password'>>('User created', excludePassword(createdUser));
    } catch (ex) {
      const errorMessage = `Error creating user: ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure('An error occurred while creating user.', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, userData: UpdateUserBody): Promise<ServiceResponse<Omit<User, 'password'> | null>> {
    try {
      this.userLogger.info(`Updating user with id ${id}`);

      const allowedUpdates: Partial<Omit<User, 'password' | 'email' | 'phoneNumber'>> = {};

      if (userData.isVerified !== undefined) allowedUpdates.isVerified = userData.isVerified;
      if (userData.isAdmin !== undefined) allowedUpdates.isAdmin = userData.isAdmin;

      if (Object.keys(allowedUpdates).length === 0) {
        return ServiceResponse.failure(
          'No valid fields provided for update. Only isVerified and isAdmin can be updated directly.',
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      const updatedUser = await this.userRepository.updateAsync(id, allowedUpdates as User);
      if (!updatedUser) {
        return ServiceResponse.failure('User not found for update', null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<Omit<User, 'password'>>('User updated', excludePassword(updatedUser));
    } catch (ex) {
      const errorMessage = `Error updating user with id ${id}:, ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure('An error occurred while updating user.', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: number): Promise<ServiceResponse<Omit<User, 'password'> | null>> {
    try {
      this.userLogger.info(`Deleting user with id ${id}`);
      const deletedUser = await this.userRepository.deleteAsync(id);
      return ServiceResponse.success<Omit<User, 'password'>>('User deleted', excludePassword(deletedUser));
    } catch (ex) {
      const errorMessage = `Error deleting user with id ${id}:, ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure('An error occurred while deleting user.', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async requestEmailChange(id: number, newEmail: string): Promise<ServiceResponse<Omit<User, 'password'> | null>> {
    try {
      this.userLogger.info(`Requesting email change for user id ${id} to ${newEmail}`);

      const user = await this.userRepository.findByIdAsync(id);
      if (!user) {
        return ServiceResponse.failure('User not found', null, StatusCodes.NOT_FOUND);
      }

      const existingUserWithNewEmail = await this.userRepository.findByEmailAsync(newEmail);
      if (existingUserWithNewEmail && existingUserWithNewEmail.id !== id) {
        return ServiceResponse.failure('This email is already registered to another user.', null, StatusCodes.CONFLICT);
      }

      const verificationServiceResponse = await this.userRepository.createVerificationTokenAsync(
        user.id,
        'CHANGE_EMAIL'
      );

      if (!verificationServiceResponse) {
        return ServiceResponse.failure(
          'Failed to generate email change verification token.',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      this.userLogger.info(
        `Email change verification token generated for user ${id}. Token: ${verificationServiceResponse.token}`
      );

      // Send email verification link
      const verificationLink = `${ENV.FRONTEND_URL}/verify-email-change?token=${verificationServiceResponse.token}`;
      const expiresInMinutes = ms(ENV.JWT_EXPIRY as StringValue) / (1000 * 60); // Assuming JWT_EXPIRY is used for token expiry
      const currentYear = new Date().getFullYear();

      await sendEmail({
        to: newEmail, // Send to the new email address
        subject: 'Verify Your Email Change',
        template: 'email-verification', // EJS template name
        context: {
          name: user.email || user.phoneNumber || 'User', // Use existing email/phone or generic name
          verificationLink,
          expiresInMinutes,
          year: currentYear
        }
      });

      return ServiceResponse.success<Omit<User, 'password'>>(
        'Email change verification initiated. Please check your new email for a verification link.',
        excludePassword(user)
      );
    } catch (ex) {
      const errorMessage = `Error requesting email change for user id ${id}: ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while requesting email change.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyEmailChange(token: string): Promise<ServiceResponse<Omit<User, 'password'> | null>> {
    try {
      this.userLogger.info(`Verifying email change with token: ${token}`);

      const verificationToken = await this.userRepository.findVerificationTokenAsync(token, 'CHANGE_EMAIL');
      if (
        !verificationToken ||
        verificationToken.isUsed ||
        (verificationToken.expiresAt && verificationToken.expiresAt < new Date())
      ) {
        return ServiceResponse.failure('Invalid or expired email change token.', null, StatusCodes.BAD_REQUEST);
      }

      const user = await this.userRepository.findByIdAsync(verificationToken.userId);
      if (!user) {
        return ServiceResponse.failure('User not found for verification.', null, StatusCodes.NOT_FOUND);
      }

      const newEmail = verificationToken.token;

      const updatedUser = await this.userRepository.updateAsync(user.id, {
        email: newEmail,
        emailVerified: true
      } as User);

      if (!updatedUser) {
        return ServiceResponse.failure('Failed to verify email change.', null, StatusCodes.INTERNAL_SERVER_ERROR);
      }

      await this.userRepository.markVerificationTokenAsUsedAsync(verificationToken.id);

      return ServiceResponse.success<Omit<User, 'password'>>(
        'Email changed and verified successfully.',
        excludePassword(updatedUser)
      );
    } catch (ex) {
      const errorMessage = `Error verifying email change with token: ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while verifying email change.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async login(credentials: {
    email?: string;
    phoneNumber?: string;
    password: string;
  }): Promise<ServiceResponse<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string } | null>> {
    try {
      let user: User | null = null;

      if (credentials.email) {
        user = await this.userRepository.findByEmailAsync(credentials.email);
      } else if (credentials.phoneNumber) {
        user = await this.userRepository.findByPhoneNumberAsync(credentials.phoneNumber);
      }

      if (!user) {
        return ServiceResponse.failure('Invalid credentials', null, StatusCodes.UNAUTHORIZED);
      }

      const isPasswordValid = await comparePasswords(credentials.password, user.password);

      if (!isPasswordValid) {
        return ServiceResponse.failure('Invalid credentials', null, StatusCodes.UNAUTHORIZED);
      }

      const jwtPayload = extractJwtPayload(user);
      const accessToken = generateAccessToken(jwtPayload);
      const refreshTokenString = generateRefreshToken(jwtPayload);

      // Store the refresh token in the database
      const refreshTokenExpiresAt = new Date(Date.now() + ms(ENV.REFRESH_TOKEN_EXPIRY as StringValue));
      const storedRefreshToken = await this.userRepository.createRefreshTokenAsync(
        user.id,
        refreshTokenString,
        refreshTokenExpiresAt
      );

      if (!storedRefreshToken) {
        return ServiceResponse.failure('Failed to store refresh token', null, StatusCodes.INTERNAL_SERVER_ERROR);
      }

      const userWithoutPassword = excludePassword(user);
      return ServiceResponse.success<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string }>(
        'Login successful',
        { user: userWithoutPassword, accessToken, refreshToken: refreshTokenString }
      );
    } catch (ex) {
      const errorMessage = `Error during login: ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure('An error occurred during login.', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async refreshAccessToken(
    oldRefreshToken: string
  ): Promise<ServiceResponse<{ accessToken: string; refreshToken: string } | null>> {
    try {
      this.userLogger.info('Attempting to refresh access token');

      // 1. Verify the old refresh token
      const decodedRefreshToken = verifyRefreshToken(oldRefreshToken);
      if (!decodedRefreshToken) {
        return ServiceResponse.failure('Invalid refresh token', null, StatusCodes.UNAUTHORIZED);
      }

      // 2. Check if the refresh token exists in the database and is not revoked
      const storedRefreshToken = await this.userRepository.findRefreshTokenAsync(oldRefreshToken);

      if (!storedRefreshToken || storedRefreshToken.isUsed || storedRefreshToken.expiresAt < new Date()) {
        // If token is found but revoked/expired, or not found, consider it invalid
        if (storedRefreshToken && storedRefreshToken.isUsed) {
          this.userLogger.warn(`Attempt to use a revoked refresh token for user ID: ${decodedRefreshToken.userId}`);
        }
        return ServiceResponse.failure('Invalid or expired refresh token', null, StatusCodes.UNAUTHORIZED);
      }

      // 3. Revoke the old refresh token
      await this.userRepository.markVerificationTokenAsUsedAsync(storedRefreshToken.id);

      // 4. Get user details to generate new tokens
      const user = await this.userRepository.findByIdAsync(decodedRefreshToken.userId);
      if (!user) {
        return ServiceResponse.failure('User not found for token refresh', null, StatusCodes.NOT_FOUND);
      }

      // 5. Generate new access and refresh tokens
      const newJwtPayload = extractJwtPayload(user);
      const newAccessToken = generateAccessToken(newJwtPayload);
      const newRefreshTokenString = generateRefreshToken(newJwtPayload);

      // 6. Store the new refresh token in the database
      const newRefreshTokenExpiresAt = new Date(Date.now() + ms(ENV.REFRESH_TOKEN_EXPIRY as StringValue));
      const newStoredRefreshToken = await this.userRepository.createRefreshTokenAsync(
        user.id,
        newRefreshTokenString,
        newRefreshTokenExpiresAt
      );

      if (!newStoredRefreshToken) {
        return ServiceResponse.failure('Failed to store new refresh token', null, StatusCodes.INTERNAL_SERVER_ERROR);
      }

      this.userLogger.info(`Access token refreshed for user ID: ${user.id}`);
      return ServiceResponse.success<{ accessToken: string; refreshToken: string }>('Tokens refreshed successfully', {
        accessToken: newAccessToken,
        refreshToken: newRefreshTokenString
      });
    } catch (ex) {
      const errorMessage = `Error during token refresh: ${(ex as Error).message}`;
      this.userLogger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred during token refresh.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const userService = new UserService();
