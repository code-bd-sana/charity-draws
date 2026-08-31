jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('new-hash'),
  compare: jest.fn().mockResolvedValue(true),
}));

import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: MockPrismaService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new UsersService(prisma as any);
  });

  it('changes passwords after validating the current password', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', passwordHash: 'old-hash' });

    await expect(
      service.changePassword('user-1', {
        currentPassword: 'old-password',
        newPassword: 'NewPassword123!',
      }),
    ).resolves.toEqual({ message: 'Password updated successfully' });

    expect(bcrypt.compare).toHaveBeenCalledWith('old-password', 'old-hash');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { passwordHash: 'new-hash' },
    });
  });

  it('rejects invalid current password changes', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', passwordHash: 'old-hash' });

    await expect(
      service.changePassword('user-1', {
        currentPassword: 'wrong',
        newPassword: 'NewPassword123!',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates host profile fields alongside user profile data', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'HOST', hostProfile: {} });
    prisma.user.update.mockResolvedValue({ id: 'user-1', role: 'HOST', hostProfile: {} });
    prisma.hostProfile.update.mockResolvedValue({});
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1', role: 'HOST', hostProfile: {} });
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'host@example.com',
      passwordHash: 'hash',
      role: 'HOST',
      hostProfile: { businessName: 'New Host' },
    });

    const result = await service.updateProfile('user-1', {
      firstName: 'Host',
      businessName: 'New Host',
      bio: 'Bio',
    } as any);

    expect(prisma.hostProfile.update).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: { businessName: 'New Host', bio: 'Bio' },
    });
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('throws when updating a missing avatar owner', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.updateAvatar('missing-user', '/avatar.jpg')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('maps winner records with instant-win details', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    prisma.winner.findMany.mockResolvedValue([
      {
        id: 'winner-1',
        raffleId: 'raffle-1',
        ticketId: 'ticket-1',
        winType: 'INSTANT_WIN',
        prizeName: null,
        deliveryStatus: 'PENDING',
        verificationStatus: 'PENDING',
        trackingNumber: null,
        createdAt,
        ticket: { ticketNumber: 5, createdAt },
        raffle: {
          id: 'raffle-1',
          title: 'Prize Draw',
          slug: 'prize-draw',
          mainImage: '/main.jpg',
          mainPrizeValue: 100,
          status: 'ENDED',
          host: { businessName: 'Host Ltd' },
          instantWins: [
            {
              id: 'instant-1',
              ticketNumber: 5,
              prizeName: 'Instant Prize',
              image: '/instant.jpg',
              rrpValue: 25,
            },
          ],
        },
      },
    ]);

    await expect(service.getMyWinners('user-1')).resolves.toEqual([
      expect.objectContaining({
        id: 'winner-1',
        prizeName: 'Instant Prize',
        prizeImage: '/instant.jpg',
        rrpValue: 25,
        ticketNumber: 5,
      }),
    ]);
  });
});
