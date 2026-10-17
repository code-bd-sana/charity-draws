import { Test, TestingModule } from '@nestjs/testing';
import { AdminTicketAssignmentController } from './admin-ticket-assignment.controller';
import { AdminTicketAssignmentService } from './admin-ticket-assignment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('AdminTicketAssignmentController', () => {
  let controller: AdminTicketAssignmentController;
  let service: any;

  const mockService = {
    getActiveCompetitions: jest.fn().mockResolvedValue([]),
    getCompetitionDetails: jest.fn().mockResolvedValue({ id: '1' }),
    searchUsers: jest.fn().mockResolvedValue([]),
    assignTickets: jest.fn().mockResolvedValue({ success: true }),
    getAssignmentHistory: jest.fn().mockResolvedValue({ history: [] }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTicketAssignmentController],
      providers: [
        {
          provide: AdminTicketAssignmentService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminTicketAssignmentController>(
      AdminTicketAssignmentController,
    );
    service = module.get(AdminTicketAssignmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getActiveCompetitions', async () => {
    await controller.getActiveCompetitions({});
    expect(service.getActiveCompetitions).toHaveBeenCalled();
  });

  it('should call getCompetitionDetails', async () => {
    await controller.getCompetitionDetails('raffle-1');
    expect(service.getCompetitionDetails).toHaveBeenCalledWith('raffle-1');
  });

  it('should call searchUsers', async () => {
    await controller.searchUsers('bob');
    expect(service.searchUsers).toHaveBeenCalledWith('bob');
  });

  it('should call assignTickets with user sub', async () => {
    const body = { raffleId: 'r1', userId: 'u1', quantity: 2 };
    const req = { user: { sub: 'admin-123' } };
    await controller.assignTickets(body as any, req);
    expect(service.assignTickets).toHaveBeenCalledWith(body, 'admin-123');
  });

  it('should call getAssignmentHistory', async () => {
    await controller.getAssignmentHistory({});
    expect(service.getAssignmentHistory).toHaveBeenCalled();
  });
});
