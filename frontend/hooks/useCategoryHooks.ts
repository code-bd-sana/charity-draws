import { useQuery } from '@tanstack/react-query';
import { categoryService, Category } from '../services/category.service';
import { categoryKeys } from './queryKeys';

export const usePublicCategories = () => {
  return useQuery({
    queryKey: categoryKeys.public(),
    queryFn: () => categoryService.getPublicCategories(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminCategories = () => {
  return useQuery({
    queryKey: categoryKeys.admin(),
    queryFn: () => categoryService.getAllCategories(),
  });
};

export type { Category };
