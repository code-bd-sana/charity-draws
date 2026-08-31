import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaMock: MockPrismaService;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should generate slug from name and create category', async () => {
      const createDto = { name: 'Tactical Gear', description: 'Guns and Scopes' };
      const mockCategory = { id: 'cat-1', ...createDto, slug: 'tactical-gear' };
      prismaMock.category.create.mockResolvedValue(mockCategory);

      const result = await service.create(createDto as any);
      expect(result.slug).toBe('tactical-gear');
      expect(prismaMock.category.create).toHaveBeenCalledWith({
        data: { ...createDto, slug: 'tactical-gear' },
      });
    });
  });

  describe('findAllActive', () => {
    it('should return only active categories', async () => {
      const mockCategories = [{ id: 'cat-1', name: 'Tactical Gear', isActive: true }];
      prismaMock.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAllActive();
      expect(result).toHaveLength(1);
      expect(prismaMock.category.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if category not found', async () => {
      prismaMock.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
