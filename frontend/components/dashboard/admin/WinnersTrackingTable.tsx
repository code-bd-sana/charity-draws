'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Winner, winnerService } from '../../../services/winner.service';
import VerifyWinnerModal from './VerifyWinnerModal';

export default function WinnersTrackingTable() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [winTypeFilter, setWinTypeFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);

  const queryClient = useQueryClient();

  const filters = ['All', 'Pending Verification', 'Verified & Published', 'Prize Delivered'];
  const winTypeFilters = ['All', 'Main Draw', 'Instant Win'];

  const getVerificationQuery = (filter: string) => {
    switch (filter) {
      case 'Pending Verification':
        return 'PENDING';
      case 'Verified & Published':
        return 'VERIFIED';
      default:
        return 'All';
    }
  };

  const getDeliveryQuery = (filter: string) => {
    if (filter === 'Prize Delivered') return 'DELIVERED';
    return 'All';
  };

  const getWinTypeQuery = (filter: string) => {
    switch (filter) {
      case 'Main Draw':
        return 'MAIN_DRAW';
      case 'Instant Win':
        return 'INSTANT_WIN';
      default:
        return 'All';
    }
  };

  const { data: winnersResponse, isLoading } = useQuery({
    queryKey: ['adminWinners', activeFilter, winTypeFilter],
    queryFn: () =>
      winnerService.getAdminWinners({
        verificationStatus: getVerificationQuery(activeFilter),
        status: getDeliveryQuery(activeFilter),
        winType: getWinTypeQuery(winTypeFilter),
      }),
  });

  const winners = winnersResponse?.data || [];

  const handleVerify = (winner: Winner) => {
    setSelectedWinner(winner);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    if (winners.length === 0) return;

    const headers = [
      "ID",
      "Winner Name",
      "User Email",
      "Competition Won",
      "Win Type",
      "Prize Name",
      "Draw Date",
      "Verification Status",
      "Delivery Status"
    ];

    const rows = winners.map((winner: Winner) => {
      const name = `${winner.user?.firstName || ''} ${winner.user?.lastName || ''}`.trim() || 'Unknown';
      const email = winner.user?.email || 'N/A';
      const competition = winner.raffle?.title || 'Unknown Raffle';
      const winType = winner.winType === 'INSTANT_WIN' ? 'Instant Win' : 'Main Draw';
      const prize = winner.prizeName || 'N/A';
      const drawDate = winner.createdAt ? format(new Date(winner.createdAt), 'dd MMM yyyy HH:mm') : 'N/A';
      const verificationStatus = winner.verificationStatus || 'N/A';
      const deliveryStatus = winner.deliveryStatus || 'N/A';

      return [
        winner.id,
        name,
        email,
        competition,
        winType,
        prize,
        drawDate,
        verificationStatus,
        deliveryStatus
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const filterTag = activeFilter.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const winTypeTag = winTypeFilter.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.setAttribute("download", `winners_export_${filterTag}_${winTypeTag}_${new Date().toISOString().slice(0, 10)}.csv`);

    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['adminWinners'] });
  };

  const getStatusStyle = (winner: Winner) => {
    if (winner.deliveryStatus === 'DELIVERED')
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (winner.verificationStatus === 'VERIFIED')
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (winner.verificationStatus === 'PENDING')
      return 'border-amber-200 bg-amber-50 text-amber-700';
    return 'border-border bg-accent-bg text-text-muted';
  };

  const getDisplayStatus = (winner: Winner) => {
    if (winner.deliveryStatus === 'DELIVERED') return 'Prize Delivered';
    if (winner.verificationStatus === 'VERIFIED') return 'Verified';
    if (winner.verificationStatus === 'PENDING') return 'Pending Verification';
    return 'Unknown';
  };

  return (
    <div className='flex flex-col gap-6 w-full mt-4 select-none'>
      {/* Filters Container */}
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-4 rounded-card border border-border shadow-card'>
        {/* Status Filters */}
        <div className='flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0'>
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-badge font-sans font-semibold text-[12px] whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-primary border-primary text-primary-text font-bold shadow-sm'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Win Type Filters & Export CSV */}
        <div className='flex flex-wrap items-center gap-4'>
          <div className='flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0'>
            {winTypeFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setWinTypeFilter(filter)}
                className={`px-4 py-2 rounded-badge font-sans font-semibold text-[12px] whitespace-nowrap transition-all cursor-pointer ${
                  winTypeFilter === filter
                    ? 'bg-primary border-primary text-primary-text font-bold shadow-sm'
                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button 
            onClick={handleExportCSV}
            disabled={winners.length === 0}
            className="group h-[36px] px-4 bg-accent-bg border border-border-medium hover:bg-primary rounded-button flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
            title="Export filtered winners to CSV"
          >
            <svg className="w-4 h-4 text-text-brand group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="font-sans font-semibold text-[12px] text-text-brand group-hover:text-white transition-colors">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className='w-full bg-surface border border-border rounded-card overflow-hidden shadow-card overflow-x-auto mt-2'>
        <table className='w-full min-w-[1050px] text-left border-collapse'>
          <thead>
            <tr className='border-b border-border bg-accent-bg/50'>
              <th className='py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]'>
                WINNER
              </th>
              <th className='py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]'>
                COMPETITION WON
              </th>
              <th className='py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%] text-center'>
                WIN TYPE
              </th>
              <th className='py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%] text-center'>
                DRAW DATE
              </th>
              <th className='py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%] text-center'>
                PRIZE VALUE
              </th>
              <th className='py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%] text-center'>
                STATUS
              </th>
              <th className='py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[13%] text-right'>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className='py-8 text-center text-text-muted font-sans text-sm font-medium'>
                  Loading winners...
                </td>
              </tr>
            ) : winners.length === 0 ? (
              <tr>
                <td colSpan={7} className='py-8 text-center text-text-muted font-sans text-sm font-medium'>
                  No winners found.
                </td>
              </tr>
            ) : (
              winners.map((winner, i) => {
                const name =
                  `${winner.user?.firstName || ''} ${winner.user?.lastName || ''}`.trim() ||
                  'Unknown';
                const initials = name.substring(0, 2).toUpperCase();

                return (
                  <tr
                    key={winner.id}
                    className={`${i !== winners.length - 1 ? 'border-b border-divider' : ''} hover:bg-accent-bg/30 transition-colors`}
                  >
                    <td className='py-4 px-6'>
                      <div className='flex items-center gap-3'>
                        <div className='w-7 h-7 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0 overflow-hidden'>
                          {winner.user?.avatarUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={winner.user.avatarUrl}
                              alt='Winner'
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <span className='font-sans font-bold text-[10px] text-text-brand'>
                              {initials}
                            </span>
                          )}
                        </div>
                        <span className='font-sans font-semibold text-[13px] text-text-primary'>
                          {name}
                        </span>
                      </div>
                    </td>
                    <td className='py-4 px-6'>
                      <span className='font-sans text-[13px] text-text-muted font-medium'>
                        {winner.raffle?.title || 'Unknown Raffle'}
                      </span>
                    </td>
                    <td className='py-4 px-6 text-center'>
                      {winner.winType === 'INSTANT_WIN' ? (
                        <span className='font-sans font-bold text-[12px] text-text-brand'>
                          Instant Win
                        </span>
                      ) : (
                        <span className='font-sans font-bold text-[12px] text-amber-700'>
                          Main Draw
                        </span>
                      )}
                    </td>
                    <td className='py-4 px-6 text-center'>
                      <span className='font-sans text-[13px] text-text-muted font-medium'>
                        {format(new Date(winner.createdAt), 'dd MMM yyyy')}
                      </span>
                    </td>
                    <td className='py-4 px-6 text-center'>
                      <span className='font-sans font-bold text-[13px] text-text-primary'>
                        {winner.prizeName}
                      </span>
                    </td>
                    <td className='py-4 px-6 text-center'>
                      <span
                        className={`px-3 py-1 rounded-badge border font-sans font-semibold text-[10px] whitespace-nowrap shadow-sm ${getStatusStyle(winner)}`}
                      >
                        {getDisplayStatus(winner)}
                      </span>
                    </td>
                    <td className='py-4 px-6'>
                      <div className='flex items-center justify-end gap-3'>
                        {winner.verificationStatus === 'PENDING' && (
                          <button
                            onClick={() => handleVerify(winner)}
                            className='h-[32px] px-5 rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[12px] transition-all shadow-sm cursor-pointer'
                          >
                            Verify
                          </button>
                        )}
                        {winner.verificationStatus === 'VERIFIED' &&
                          winner.deliveryStatus === 'PENDING' && (
                            <button className='h-[32px] px-5 rounded-button bg-surface border border-border text-text-muted font-sans font-semibold text-[12px] cursor-not-allowed opacity-60'>
                              Awaiting Delivery
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <VerifyWinnerModal isOpen={isModalOpen} onClose={handleModalClose} winner={selectedWinner} />
    </div>
  );
}
