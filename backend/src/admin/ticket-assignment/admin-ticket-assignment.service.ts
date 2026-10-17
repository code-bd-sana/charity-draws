import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RafflesService } from '../../raffles/raffles.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { QueryCompetitionsDto } from './dto/query-competitions.dto';
import { AssignTicketsDto } from './dto/assign-tickets.dto';
import { QueryHistoryDto } from './dto/query-history.dto';
import * as crypto from 'crypto';

@Injectable()
export class AdminTicketAssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => RafflesService))
    private readonly rafflesService: RafflesService,
    @Optional()
    private readonly notificationsService?: NotificationsService,
  ) {}

  /**
   * 1. GET /competitions
   * Returns active competitions with fields: ID, title, slug, mainImage, pricePerTicket,
   * totalTickets, ticketsSold, remainingTickets, host details, and instant win counts.
   */
  async getActiveCompetitions(query: QueryCompetitionsDto) {
    const searchTerm = (query.search || query.q || '').trim();
    const where: any = {
      status: 'ACTIVE',
    };

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { slug: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (query.hostId) {
      where.hostId = query.hostId;
    }

    const raffles = await this.prisma.raffle.findMany({
      where,
      include: {
        host: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        instantWins: {
          select: {
            id: true,
            ticketNumber: true,
            prizeName: true,
            rrpValue: true,
            isClaimed: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return raffles.map((raffle) => {
      const remainingTickets = Math.max(0, raffle.totalTickets - raffle.ticketsSold);
      const totalInstantWins = raffle.instantWins.length;
      const claimedInstantWins = raffle.instantWins.filter((iw) => iw.isClaimed).length;
      const unclaimedInstantWins = totalInstantWins - claimedInstantWins;

      const hostUserName = raffle.host?.user
        ? `${raffle.host.user.firstName || ''} ${raffle.host.user.lastName || ''}`.trim() ||
          raffle.host.user.email
        : 'Unknown Host';

      return {
        id: raffle.id,
        title: raffle.title,
        slug: raffle.slug,
        category: raffle.category,
        mainImage: raffle.mainImage,
        pricePerTicket: Number(raffle.pricePerTicket),
        totalTickets: raffle.totalTickets,
        ticketsSold: raffle.ticketsSold,
        remainingTickets,
        startDate: raffle.startDate,
        endDate: raffle.endDate,
        status: raffle.status,
        isAutoDraw: raffle.isAutoDraw,
        autoDrawSoldOut: raffle.autoDrawSoldOut,
        host: {
          id: raffle.host?.id || '',
          businessName: raffle.host?.businessName || hostUserName,
          slug: raffle.host?.slug || null,
          user: raffle.host?.user
            ? {
                id: raffle.host.user.id,
                name: hostUserName,
                email: raffle.host.user.email,
                avatarUrl: raffle.host.user.avatarUrl,
              }
            : null,
        },
        instantWinCounts: {
          total: totalInstantWins,
          claimed: claimedInstantWins,
          unclaimed: unclaimedInstantWins,
        },
      };
    });
  }

  /**
   * 2. GET /competitions/:id
   * Returns full competition data including:
   * - Total/Sold/Remaining stats and pricing.
   * - All instant wins (ticketNumber, prizeName, rrpValue, isClaimed).
   * - List of all sold tickets with buyer name, email, purchase date, and payment gateway.
   */
  async getCompetitionDetails(id: string) {
    const raffle = await this.prisma.raffle.findUnique({
      where: { id },
      include: {
        host: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        instantWins: {
          orderBy: { ticketNumber: 'asc' },
        },
        tickets: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
            transaction: {
              select: {
                paymentGateway: true,
                createdAt: true,
                amount: true,
              },
            },
          },
          orderBy: { ticketNumber: 'asc' },
        },
      },
    });

    if (!raffle) {
      throw new NotFoundException(`Competition with ID "${id}" was not found`);
    }

    const remainingTickets = Math.max(0, raffle.totalTickets - raffle.ticketsSold);
    const hostUserName = raffle.host?.user
      ? `${raffle.host.user.firstName || ''} ${raffle.host.user.lastName || ''}`.trim() ||
        raffle.host.user.email
      : 'Unknown Host';

    const soldTickets = raffle.tickets.map((t) => {
      const buyerName = t.user
        ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() || t.user.email
        : 'Unknown Buyer';

      return {
        id: t.id,
        ticketNumber: t.ticketNumber,
        purchaseDate: t.createdAt,
        buyer: {
          id: t.user?.id || t.userId,
          name: buyerName,
          email: t.user?.email || 'N/A',
          avatarUrl: t.user?.avatarUrl || null,
        },
        paymentGateway: t.transaction?.paymentGateway || 'SIMULATED',
      };
    });

    const instantWins = raffle.instantWins.map((iw) => ({
      id: iw.id,
      ticketNumber: iw.ticketNumber,
      prizeName: iw.prizeName,
      rrpValue: iw.rrpValue ? Number(iw.rrpValue) : null,
      image: iw.image,
      isClaimed: iw.isClaimed,
    }));

    return {
      id: raffle.id,
      title: raffle.title,
      slug: raffle.slug,
      category: raffle.category,
      description: raffle.description,
      mainImage: raffle.mainImage,
      prizeName: raffle.prizeName,
      mainPrizeValue: raffle.mainPrizeValue ? Number(raffle.mainPrizeValue) : null,
      pricePerTicket: Number(raffle.pricePerTicket),
      totalTickets: raffle.totalTickets,
      ticketsSold: raffle.ticketsSold,
      remainingTickets,
      startDate: raffle.startDate,
      endDate: raffle.endDate,
      status: raffle.status,
      isAutoDraw: raffle.isAutoDraw,
      autoDrawSoldOut: raffle.autoDrawSoldOut,
      host: {
        id: raffle.host?.id || '',
        businessName: raffle.host?.businessName || hostUserName,
        slug: raffle.host?.slug || null,
        user: raffle.host?.user
          ? {
              id: raffle.host.user.id,
              name: hostUserName,
              email: raffle.host.user.email,
              avatarUrl: raffle.host.user.avatarUrl,
            }
          : null,
      },
      instantWins,
      soldTickets,
    };
  }

  /**
   * 3. GET /users/search?q=<term>
   * Live autocomplete search matching user email, firstName, lastName, or id.
   * Returns active users (excluding blocked accounts) with id, name, email, role, and avatar.
   */
  async searchUsers(queryTerm?: string) {
    const term = (queryTerm || '').trim();

    const where: any = {
      isBlocked: false,
    };

    if (term) {
      where.OR = [
        { email: { contains: term, mode: 'insensitive' } },
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { id: { equals: term } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    }));
  }

  /**
   * 4. POST /assign
   * Assigns manual tickets to a user within an atomic $transaction.
   * Handles host crediting, instant win claims, audit logging, and notifications.
   */
  async assignTickets(dto: AssignTicketsDto, adminId: string) {
    const { raffleId, userId, ticketNumbers, quantity, adminNotes } = dto;

    if ((!ticketNumbers || ticketNumbers.length === 0) && (!quantity || quantity <= 0)) {
      throw new BadRequestException('Either specific ticketNumbers or a positive quantity must be provided');
    }

    const result = await this.prisma.$transaction(
      async (tx) => {
        // 1. Verify competition exists & is active
        const raffle = await tx.raffle.findUnique({
          where: { id: raffleId },
          include: {
            instantWins: true,
            host: {
              include: { user: true },
            },
          },
        });

        if (!raffle) {
          throw new NotFoundException('Competition not found');
        }

        if (raffle.status !== 'ACTIVE') {
          throw new BadRequestException(`Competition is not active (current status: ${raffle.status})`);
        }

        const now = new Date();
        if (raffle.endDate && new Date(raffle.endDate) < now) {
          throw new BadRequestException('This competition has already ended');
        }

        // 2. Verify recipient user exists & is active
        const recipientUser = await tx.user.findUnique({
          where: { id: userId },
        });

        if (!recipientUser) {
          throw new NotFoundException('Recipient user not found');
        }

        if (recipientUser.isBlocked) {
          throw new BadRequestException('Recipient account is suspended or blocked');
        }

        // 3. Determine available vs taken ticket numbers
        const existingTickets = await tx.ticket.findMany({
          where: { raffleId },
          select: { ticketNumber: true },
        });
        const soldNumbers = new Set(existingTickets.map((t) => t.ticketNumber));

        let finalAssignedNumbers: number[] = [];

        if (ticketNumbers && ticketNumbers.length > 0) {
          // Specific numbers mode
          // Validate uniqueness inside input
          const uniqueRequested = Array.from(new Set(ticketNumbers));
          if (uniqueRequested.length !== ticketNumbers.length) {
            throw new BadRequestException('Duplicate ticket numbers provided in assignment request');
          }

          // Validate ranges
          for (const num of uniqueRequested) {
            if (num < 1 || num > raffle.totalTickets) {
              throw new BadRequestException(
                `Ticket number ${num} is invalid. Numbers must be between 1 and ${raffle.totalTickets}`,
              );
            }
          }

          // Check if already sold
          const alreadySold = uniqueRequested.filter((n) => soldNumbers.has(n));
          if (alreadySold.length > 0) {
            throw new BadRequestException(
              `The following ticket number(s) have already been sold: ${alreadySold.join(', ')}`,
            );
          }

          // Check total capacity
          if (raffle.ticketsSold + uniqueRequested.length > raffle.totalTickets) {
            throw new BadRequestException(
              `Cannot assign ${uniqueRequested.length} tickets. Only ${raffle.totalTickets - raffle.ticketsSold} remaining.`,
            );
          }

          finalAssignedNumbers = uniqueRequested;
        } else {
          // Random quantity mode
          const requestedQty = quantity!;
          const remainingTicketsCount = raffle.totalTickets - raffle.ticketsSold;

          if (requestedQty > remainingTicketsCount) {
            throw new BadRequestException(
              `Requested ${requestedQty} tickets, but only ${remainingTicketsCount} are remaining.`,
            );
          }

          const availableNumbers: number[] = [];
          for (let i = 1; i <= raffle.totalTickets; i++) {
            if (!soldNumbers.has(i)) {
              availableNumbers.push(i);
            }
          }

          if (availableNumbers.length < requestedQty) {
            throw new BadRequestException('Not enough ticket numbers available in competition pool');
          }

          // Fisher-Yates shuffle
          for (let i = availableNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
          }

          finalAssignedNumbers = availableNumbers.slice(0, requestedQty).sort((a, b) => a - b);
        }

        const assignedCount = finalAssignedNumbers.length;
        const totalAmount = Number(raffle.pricePerTicket) * assignedCount;
        const gatewayTransactionId = `ADMIN_ASSIGN_${Date.now()}_${crypto.randomUUID()}`;

        // 4. Create Transaction record with paymentGateway === 'ADMIN_MANUAL'
        const transaction = await tx.transaction.create({
          data: {
            userId: recipientUser.id,
            type: 'TICKET_PURCHASE',
            amount: totalAmount,
            status: 'COMPLETED',
            paymentGateway: 'ADMIN_MANUAL',
            gatewayTransactionId,
            relatedEntityId: raffle.id,
            adminNotes: adminNotes?.trim() || null,
          },
        });

        // 5. Create Ticket records
        const ticketsData = finalAssignedNumbers.map((num) => ({
          raffleId: raffle.id,
          userId: recipientUser.id,
          transactionId: transaction.id,
          ticketNumber: num,
        }));

        await tx.ticket.createMany({
          data: ticketsData,
        });

        const createdTickets = await tx.ticket.findMany({
          where: { transactionId: transaction.id },
          orderBy: { ticketNumber: 'asc' },
        });

        // 6. Check for Instant Wins
        const unlockedInstantWins: any[] = [];
        for (const ticket of createdTickets) {
          const matchedInstantWin = raffle.instantWins.find(
            (iw) => iw.ticketNumber === ticket.ticketNumber && !iw.isClaimed,
          );

          if (matchedInstantWin) {
            // Claim instant win
            await tx.instantWin.update({
              where: { id: matchedInstantWin.id },
              data: { isClaimed: true },
            });

            // Create Winner record
            const winner = await tx.winner.create({
              data: {
                userId: recipientUser.id,
                raffleId: raffle.id,
                ticketId: ticket.id,
                winType: 'INSTANT_WIN',
                prizeName: matchedInstantWin.prizeName,
                deliveryStatus: 'PENDING',
                verificationStatus: 'VERIFIED',
              },
            });

            unlockedInstantWins.push({
              winnerId: winner.id,
              ticketId: ticket.id,
              ticketNumber: ticket.ticketNumber,
              prizeName: matchedInstantWin.prizeName,
              rrpValue: matchedInstantWin.rrpValue ? Number(matchedInstantWin.rrpValue) : null,
              image: matchedInstantWin.image,
            });
          }
        }

        // 7. Update Raffle ticketsSold & Credit Host Wallet Balance
        const updatedRaffle = await tx.raffle.update({
          where: { id: raffle.id },
          data: {
            ticketsSold: {
              increment: assignedCount,
            },
          },
        });

        if (raffle.hostId) {
          await tx.hostProfile.update({
            where: { id: raffle.hostId },
            data: {
              walletBalance: {
                increment: totalAmount,
              },
            },
          });
        }

        // 8. Record entry in AuditLog
        const recipientDisplayName =
          `${recipientUser.firstName || ''} ${recipientUser.lastName || ''}`.trim() ||
          recipientUser.email;

        const auditLog = await tx.auditLog.create({
          data: {
            adminId,
            action: 'ADMIN_MANUAL_TICKET_ASSIGNMENT',
            targetRaffleId: raffle.id,
            recipientUserId: recipientUser.id,
            ticketNumbers: finalAssignedNumbers,
            totalAmount,
            adminNotes: adminNotes?.trim() || null,
            details: {
              raffleTitle: raffle.title,
              recipientEmail: recipientUser.email,
              recipientName: recipientDisplayName,
              quantity: assignedCount,
              ticketNumbers: finalAssignedNumbers,
              totalAmount,
              instantWinsUnlocked: unlockedInstantWins,
              transactionId: transaction.id,
              gatewayTransactionId,
            },
          },
        });

        return {
          raffle,
          updatedRaffle,
          recipientUser,
          transaction,
          createdTickets,
          finalAssignedNumbers,
          assignedCount,
          totalAmount,
          unlockedInstantWins,
          auditLog,
        };
      },
      {
        maxWait: 5000,
        timeout: 15000,
      },
    );

    // 9. Post-Transaction Automation: Auto-draw if sold out
    if (
      result.updatedRaffle.isAutoDraw &&
      result.updatedRaffle.autoDrawSoldOut &&
      result.updatedRaffle.ticketsSold >= result.updatedRaffle.totalTickets &&
      result.updatedRaffle.status === 'ACTIVE'
    ) {
      try {
        await this.rafflesService.drawWinner(result.updatedRaffle.id);
      } catch (err) {
        console.error('Failed to trigger auto draw on sold out:', err);
      }
    } else if (
      !result.updatedRaffle.isAutoDraw &&
      result.updatedRaffle.ticketsSold >= result.updatedRaffle.totalTickets &&
      result.updatedRaffle.status === 'ACTIVE'
    ) {
      try {
        await this.prisma.raffle.update({
          where: { id: result.updatedRaffle.id },
          data: { status: 'ENDED' },
        });
      } catch (err) {
        console.error('Failed to update manual raffle status on sold out:', err);
      }
    }

    // 10. Notifications
    if (this.notificationsService) {
      const recipientName =
        `${result.recipientUser.firstName || ''} ${result.recipientUser.lastName || ''}`.trim() ||
        result.recipientUser.email;
      const formattedValue = result.totalAmount.toFixed(2);
      const ticketNumbersList = result.finalAssignedNumbers.slice(0, 5).join(', ') +
        (result.finalAssignedNumbers.length > 5 ? ` +${result.finalAssignedNumbers.length - 5} more` : '');

      // In-app notification to recipient
      this.notificationsService
        .create({
          userId: result.recipientUser.id,
          title: 'Tickets Assigned by Admin 🎟️',
          message: `Admin has assigned you ${result.assignedCount} ticket(s) (Ticket #${ticketNumbersList}) for "${result.raffle.title}" (Value: £${formattedValue}). Good luck!`,
          type: 'PAYMENT',
          link: '/dashboard/user/tickets',
        })
        .catch((e) => console.error('Error sending recipient ticket notification:', e));

      // Instant win notification to recipient (if any)
      for (const win of result.unlockedInstantWins) {
        this.notificationsService
          .create({
            userId: result.recipientUser.id,
            title: '🎉 Instant Win Prize Claimed!',
            message: `Congratulations! Ticket #${win.ticketNumber} unlocked instant prize "${win.prizeName}" in "${result.raffle.title}"!`,
            type: 'WIN',
            link: '/dashboard/user/winners',
          })
          .catch((e) => console.error('Error sending instant win notification:', e));
      }

      // Notify host of wallet credit
      if (result.raffle.host?.userId) {
        this.notificationsService
          .create({
            userId: result.raffle.host.userId,
            title: 'Manual Ticket Allocation Credited 💰',
            message: `${result.assignedCount} ticket(s) were manually assigned for "${result.raffle.title}". £${formattedValue} credited to your wallet balance.`,
            type: 'PAYMENT',
            link: '/dashboard/host/sales',
          })
          .catch((e) => console.error('Error sending host wallet notification:', e));
      }
    }

    return {
      success: true,
      message: `Successfully assigned ${result.assignedCount} ticket(s) to ${result.recipientUser.email}`,
      transaction: {
        id: result.transaction.id,
        gatewayTransactionId: result.transaction.gatewayTransactionId,
        paymentGateway: result.transaction.paymentGateway,
        amount: Number(result.transaction.amount),
        createdAt: result.transaction.createdAt,
        adminNotes: result.transaction.adminNotes,
      },
      assignedTickets: result.createdTickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
      })),
      ticketNumbers: result.finalAssignedNumbers,
      totalAmount: result.totalAmount,
      hostCreditAmount: result.totalAmount,
      instantWins: result.unlockedInstantWins,
      recipient: {
        id: result.recipientUser.id,
        name:
          `${result.recipientUser.firstName || ''} ${result.recipientUser.lastName || ''}`.trim() ||
          result.recipientUser.email,
        email: result.recipientUser.email,
        avatarUrl: result.recipientUser.avatarUrl,
      },
      competition: {
        id: result.updatedRaffle.id,
        title: result.updatedRaffle.title,
        slug: result.updatedRaffle.slug,
        ticketsSold: result.updatedRaffle.ticketsSold,
        totalTickets: result.updatedRaffle.totalTickets,
        status: result.updatedRaffle.status,
      },
    };
  }

  /**
   * 5. GET /history
   * Paginated history of all ADMIN_MANUAL transactions showing:
   * Date, Transaction ID, Recipient, Competition, Assigned Numbers, Total Value, and Admin Notes.
   */
  async getAssignmentHistory(query: QueryHistoryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;
    const searchTerm = query.search?.trim();

    const where: any = {
      paymentGateway: 'ADMIN_MANUAL',
    };

    if (searchTerm) {
      where.OR = [
        { gatewayTransactionId: { contains: searchTerm, mode: 'insensitive' } },
        { id: { contains: searchTerm, mode: 'insensitive' } },
        { adminNotes: { contains: searchTerm, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { email: { contains: searchTerm, mode: 'insensitive' } },
              { firstName: { contains: searchTerm, mode: 'insensitive' } },
              { lastName: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          tickets: {
            select: {
              id: true,
              ticketNumber: true,
              winners: {
                select: {
                  id: true,
                  prizeName: true,
                  winType: true,
                },
              },
            },
            orderBy: { ticketNumber: 'asc' },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    // Fetch related raffles in batch
    const raffleIds = Array.from(
      new Set(
        transactions
          .map((t) => t.relatedEntityId)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const raffles =
      raffleIds.length > 0
        ? await this.prisma.raffle.findMany({
            where: { id: { in: raffleIds } },
            select: {
              id: true,
              title: true,
              slug: true,
              mainImage: true,
              status: true,
            },
          })
        : [];

    const raffleMap = new Map(raffles.map((r) => [r.id, r]));

    // Fetch audit log entries if any to map admin actor
    const transactionIds = transactions.map((t) => t.id);
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        action: 'ADMIN_MANUAL_TICKET_ASSIGNMENT',
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const items = transactions.map((t) => {
      const raffle = t.relatedEntityId ? raffleMap.get(t.relatedEntityId) : null;
      const recipientName = t.user
        ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() || t.user.email
        : 'Unknown User';

      const assignedNumbers = t.tickets.map((tck) => tck.ticketNumber);
      const instantWins = t.tickets
        .flatMap((tck) => tck.winners.filter((w) => w.winType === 'INSTANT_WIN'))
        .map((w) => w.prizeName);

      // Match audit log by recipient and target raffle
      const matchingAudit = auditLogs.find(
        (log) =>
          log.recipientUserId === t.userId &&
          log.targetRaffleId === t.relatedEntityId &&
          Math.abs(new Date(log.createdAt).getTime() - new Date(t.createdAt).getTime()) < 30000,
      );

      return {
        id: t.id,
        orderId: t.gatewayTransactionId || `#TRN-${t.id.slice(0, 8).toUpperCase()}`,
        date: t.createdAt,
        totalValue: Number(t.amount),
        status: t.status,
        paymentGateway: t.paymentGateway,
        adminNotes: t.adminNotes,
        adminId: matchingAudit?.adminId || null,
        recipient: {
          id: t.user.id,
          name: recipientName,
          email: t.user.email,
          avatarUrl: t.user.avatarUrl,
        },
        competition: {
          id: raffle?.id || t.relatedEntityId || '',
          title: raffle?.title || 'Competition',
          slug: raffle?.slug || null,
          mainImage: raffle?.mainImage || null,
          status: raffle?.status || 'UNKNOWN',
        },
        assignedNumbers,
        ticketCount: assignedNumbers.length,
        instantWins,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      history: items,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
