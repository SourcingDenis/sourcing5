import { generateAgenda, getManagerDashboardStats } from '@/lib/data/oneOnOne';
import { oneOnOnesRepository } from '@/lib/db/repositories/oneOnOnes';
import { actionItemsRepository } from '@/lib/db/repositories/actionItems';

export const oneOnOneService = {
  generateAgenda,
  getManagerDashboardStats,
  listByManager:          (managerId: string) => oneOnOnesRepository.listByManager(managerId),
  listOpenActionsByOwner: (ownerId: string)   => actionItemsRepository.listOpenByOwner(ownerId),
};
