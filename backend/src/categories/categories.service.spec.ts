import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: MockPrismaService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new CategoriesService(prisma as any);
  });

  it('creates categories with generated slugs', async () => {
    prisma.category.create.mockResolvedValue({ id: 'cat-1', slug: 'cash-prizes' });

    await service.create({ name: 'Cash Prizes' } as any);

    expect(prisma.category.create).toHaveBeenCalledWith({
      data: { name: 'Cash Prizes', slug: 'cash-prizes' },
    });
  });

  it('lists active categories for public consumers', async () => {
    prisma.category.findMany.mockResolvedValue([{ id: 'cat-1' }]);

    await expect(service.findAllActive()).resolves.toEqual([{ id: 'cat-1' }]);
    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('updates category slugs when names change', async () => {
    prisma.category.findUnique.mockResolvedValue({ id: 'cat-1' });
    prisma.category.update.mockResolvedValue({ id: 'cat-1', slug: 'new-name' });

    await expect(service.update('cat-1', { name: 'New Name' } as any)).resolves.toEqual({
      id: 'cat-1',
      slug: 'new-name',
    });
    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 'cat-1' },
      data: { name: 'New Name', slug: 'new-name' },
    });
  });

  it('throws when removing missing categories', async () => {
    prisma.category.findUnique.mockResolvedValue(null);

    await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
