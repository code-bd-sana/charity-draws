import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AdminReportsAnalytics {
  period: string;
  summary: {
    totalRevenue: number;
    ticketsSold: number;
    newUsers: number;
    activeCompetitions: number;
  };
  revenueTrend: {
    name: string;
    value: number;
  }[];
  salesByCategory: {
    name: string;
    value: number;
    amount: number;
    color: string;
  }[];
  popularCompetitions: {
    name: string;
    value: number;
    totalTickets: number;
    revenue: number;
    hostName: string;
  }[];
  userGrowth: {
    name: string;
    users: number;
  }[];
  hostPerformance: {
    name: string;
    percent: number;
    revenue: number;
    rafflesCount: number;
    ticketsSold: number;
    totalTickets: number;
  }[];
  geographicDistribution: {
    name: string;
    value: number;
    count: number;
  }[];
}

const CATEGORY_COLORS = [
  '#7131C8',
  '#8A46E4',
  '#A866F4',
  '#CDAFEA',
  '#4F46E5',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
];

@Injectable()
export class AdminReportsService {
  constructor(private prisma: PrismaService) {}

  private getDateBuckets(period: string = '3M') {
    const now = new Date();
    const normalized = period?.toUpperCase() || '3M';

    if (normalized === '7D') {
      const buckets: { name: string; start: Date; end: Date; value: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
        const name = d.toLocaleDateString('en-GB', { weekday: 'short' });
        buckets.push({ name, start, end, value: 0 });
      }
      return { buckets, startDate: buckets[0].start };
    }

    if (normalized === '1M') {
      const buckets: { name: string; start: Date; end: Date; value: number }[] = [];
      for (let i = 3; i >= 0; i--) {
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7, 23, 59, 59, 999);
        const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6, 0, 0, 0, 0);
        buckets.push({ name: `W${4 - i}`, start, end, value: 0 });
      }
      return { buckets, startDate: buckets[0].start };
    }

    if (normalized === '3M') {
      const buckets: { name: string; start: Date; end: Date; value: number }[] = [];
      for (let i = 2; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
        const name = start.toLocaleString('en-US', { month: 'short' });
        buckets.push({ name, start, end, value: 0 });
      }
      return { buckets, startDate: buckets[0].start };
    }

    // Default '1Y': 12 months
    const buckets: { name: string; start: Date; end: Date; value: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const name = start.toLocaleString('en-US', { month: 'short' });
      buckets.push({ name, start, end, value: 0 });
    }
    return { buckets, startDate: buckets[0].start };
  }

  async getAnalytics(period: string = '3M'): Promise<AdminReportsAnalytics> {
    const { buckets, startDate } = this.getDateBuckets(period);

    const [
      periodTransactions,
      newUsersCount,
      ticketsSoldCount,
      activeRafflesCount,
      raffles,
      allUsers,
      hosts,
      categories,
    ] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          status: 'COMPLETED',
          type: { in: ['TICKET_PURCHASE', 'SUBSCRIPTION_FEE'] },
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.ticket.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.raffle.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.raffle.findMany({
        include: {
          host: { select: { businessName: true } },
        },
        orderBy: { ticketsSold: 'desc' },
      }),
      this.prisma.user.findMany({
        select: { location: true, address: true, createdAt: true },
      }),
      this.prisma.hostProfile.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          raffles: {
            select: {
              ticketsSold: true,
              totalTickets: true,
              pricePerTicket: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.category.findMany(),
    ]);

    const txList = periodTransactions || [];
    const raffleList = raffles || [];
    const userList = allUsers || [];
    const hostList = hosts || [];
    const catList = categories || [];

    // 1. Summary
    const totalRevenue = txList.reduce(
      (sum, tx) => sum + (Number(tx.amount) || 0),
      0,
    );

    // 2. Revenue Trend
    txList.forEach((tx) => {
      const txTime = new Date(tx.createdAt).getTime();
      const bucket = buckets.find(
        (b) => txTime >= b.start.getTime() && txTime <= b.end.getTime(),
      );
      if (bucket) {
        bucket.value += Number(tx.amount) || 0;
      }
    });

    const revenueTrend = buckets.map((b) => ({
      name: b.name,
      value: Number(b.value.toFixed(2)),
    }));

    // 3. User Growth Over Time (cumulative count at end of each bucket)
    const userGrowth = buckets.map((b) => {
      const count = userList.filter(
        (u) => new Date(u.createdAt) <= b.end,
      ).length;
      return { name: b.name, users: count };
    });

    // 4. Sales by Category
    const categoryTotals: Record<string, { tickets: number; amount: number }> = {};
    let totalCatTickets = 0;

    raffleList.forEach((r) => {
      const cat = r.category || 'General';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { tickets: 0, amount: 0 };
      }
      categoryTotals[cat].tickets += r.ticketsSold;
      categoryTotals[cat].amount += r.ticketsSold * Number(r.pricePerTicket || 0);
      totalCatTickets += r.ticketsSold;
    });

    let salesByCategory: { name: string; value: number; amount: number; color: string }[] = [];

    const catEntries = Object.entries(categoryTotals);
    if (catEntries.length > 0 && totalCatTickets > 0) {
      salesByCategory = catEntries
        .sort((a, b) => b[1].tickets - a[1].tickets)
        .slice(0, 6)
        .map(([name, data], idx) => ({
          name,
          value: Math.round((data.tickets / totalCatTickets) * 100),
          amount: Number(data.amount.toFixed(2)),
          color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
        }));
    } else {
      salesByCategory = [];
    }

    // 5. Popular Competitions
    const popularCompetitions = raffleList.slice(0, 5).map((r) => ({
      name: r.title,
      value: r.ticketsSold,
      totalTickets: r.totalTickets,
      revenue: Number((r.ticketsSold * Number(r.pricePerTicket || 0)).toFixed(2)),
      hostName: r.host?.businessName || 'Verified Host',
    }));

    // 6. Host Performance
    const hostPerformance = hostList
      .map((h) => {
        const hRaffles = h.raffles || [];
        const totalTicketsOffered = hRaffles.reduce(
          (sum: number, r: any) => sum + (Number(r.totalTickets) || 0),
          0,
        );
        const totalTicketsSold = hRaffles.reduce(
          (sum: number, r: any) => sum + (Number(r.ticketsSold) || 0),
          0,
        );
        const revenue = hRaffles.reduce(
          (sum: number, r: any) => sum + (Number(r.ticketsSold) || 0) * Number(r.pricePerTicket || 0),
          0,
        );
        const percent =
          totalTicketsOffered > 0
            ? Math.min(100, Math.round((totalTicketsSold / totalTicketsOffered) * 100))
            : 0;

        const businessName =
          h.businessName?.trim() ||
          `${h.user?.firstName || ''} ${h.user?.lastName || ''}`.trim() ||
          'Verified Host';

        return {
          name: businessName,
          percent,
          revenue: Number(revenue.toFixed(2)),
          rafflesCount: hRaffles.length,
          ticketsSold: totalTicketsSold,
          totalTickets: totalTicketsOffered,
        };
      })
      .sort((a, b) => b.revenue - a.revenue || b.percent - a.percent || b.rafflesCount - a.rafflesCount)
      .slice(0, 5);

    // 7. Geographic Distribution
    const regionCounts: Record<string, number> = {
      England: 0,
      Scotland: 0,
      Wales: 0,
      'N. Ireland': 0,
      Other: 0,
    };

    userList.forEach((u) => {
      const loc = `${u.location || ''} ${u.address || ''}`.toLowerCase();
      if (
        loc.includes('england') ||
        loc.includes('london') ||
        loc.includes('manchester') ||
        loc.includes('birmingham') ||
        loc.includes('leeds') ||
        loc.includes('bristol')
      ) {
        regionCounts.England++;
      } else if (
        loc.includes('scotland') ||
        loc.includes('edinburgh') ||
        loc.includes('glasgow') ||
        loc.includes('aberdeen')
      ) {
        regionCounts.Scotland++;
      } else if (
        loc.includes('wales') ||
        loc.includes('cardiff') ||
        loc.includes('swansea')
      ) {
        regionCounts.Wales++;
      } else if (
        loc.includes('ireland') ||
        loc.includes('belfast') ||
        loc.includes('derry')
      ) {
        regionCounts['N. Ireland']++;
      } else {
        regionCounts.Other++;
      }
    });

    const totalGeos = Object.values(regionCounts).reduce((a, b) => a + b, 0);
    const geographicDistribution = Object.entries(regionCounts).map(
      ([name, count]) => ({
        name,
        count,
        value: totalGeos > 0 ? Math.round((count / totalGeos) * 100) : 0,
      }),
    );

    return {
      period: normalizedPeriod(period),
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        ticketsSold: ticketsSoldCount,
        newUsers: newUsersCount,
        activeCompetitions: activeRafflesCount,
      },
      revenueTrend,
      salesByCategory,
      popularCompetitions,
      userGrowth,
      hostPerformance,
      geographicDistribution,
    };
  }

  async generateCsvReport(period: string = '3M'): Promise<string> {
    const data = await this.getAnalytics(period);

    const rows: string[] = [];
    rows.push(`"CHARITY DRAWS - ANALYTICS & PERFORMANCE REPORT"`);
    rows.push(`"Generated Period:","${data.period}"`);
    rows.push(`"Generated At:","${new Date().toISOString()}"`);
    rows.push('');

    // Summary
    rows.push(`"KEY PERFORMANCE METRICS"`);
    rows.push(`"Metric","Value"`);
    rows.push(`"Total Period Revenue","£${data.summary.totalRevenue.toLocaleString()}"`);
    rows.push(`"Tickets Sold","${data.summary.ticketsSold.toLocaleString()}"`);
    rows.push(`"New Members Registered","${data.summary.newUsers.toLocaleString()}"`);
    rows.push(`"Active Competitions","${data.summary.activeCompetitions.toLocaleString()}"`);
    rows.push('');

    // Revenue Trend
    rows.push(`"REVENUE TREND"`);
    rows.push(`"Timeline Bucket","Revenue (£)"`);
    data.revenueTrend.forEach((pt) => {
      rows.push(`"${pt.name}","${pt.value}"`);
    });
    rows.push('');

    // Sales by Category
    rows.push(`"SALES BY CATEGORY"`);
    rows.push(`"Category","Share (%)","Revenue (£)"`);
    data.salesByCategory.forEach((cat) => {
      rows.push(`"${cat.name}","${cat.value}%","${cat.amount}"`);
    });
    rows.push('');

    // Popular Competitions
    rows.push(`"MOST POPULAR COMPETITIONS"`);
    rows.push(`"Competition Title","Host","Tickets Sold","Total Capacity","Revenue (£)"`);
    data.popularCompetitions.forEach((comp) => {
      rows.push(
        `"${comp.name.replace(/"/g, '""')}","${comp.hostName}","${comp.value}","${comp.totalTickets}","${comp.revenue}"`,
      );
    });
    rows.push('');

    // Host Performance
    rows.push(`"HOST PERFORMANCE"`);
    rows.push(`"Host Business Name","Raffles Count","Sell-Through (%)","Total Revenue (£)"`);
    data.hostPerformance.forEach((host) => {
      rows.push(
        `"${host.name.replace(/"/g, '""')}","${host.rafflesCount}","${host.percent}%","${host.revenue}"`,
      );
    });
    rows.push('');

    // Geographic Distribution
    rows.push(`"GEOGRAPHIC ENTRY DISTRIBUTION"`);
    rows.push(`"Region","Share (%)","User Count"`);
    data.geographicDistribution.forEach((geo) => {
      rows.push(`"${geo.name}","${geo.value}%","${geo.count}"`);
    });

    return rows.join('\n');
  }
}

function normalizedPeriod(period: string = '3M'): string {
  const p = period?.toUpperCase();
  if (['7D', '1M', '3M', '1Y'].includes(p)) return p;
  return '3M';
}
