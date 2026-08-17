'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Raffle } from '../../../../services/raffle.service';
import ManualWinnerSelectModal from '../../shared/ManualWinnerSelectModal';

export default function DrawsTable({
  draws,
  onSelectDraw,
}: {
  draws: Raffle[];
  onSelectDraw: (draw: Raffle) => void;
}) {
  const getStatusPill = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <span className='px-3 py-1 rounded-badge border border-amber-200 bg-amber-50 text-amber-700 font-sans font-semibold text-[10px] shadow-sm'>
            Pending Approval
          </span>
        );
      case 'DRAFT':
        return (
          <span className='px-3 py-1 rounded-badge border border-border-medium bg-accent-bg text-text-muted font-sans font-semibold text-[10px] shadow-sm'>
            Draft
          </span>
        );
      case 'ENDED':
        return (
          <span className='px-3 py-1 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-sans font-semibold text-[10px] shadow-sm'>
            Completed
          </span>
        );
      case 'ACTIVE':
        return (
          <span className='px-3 py-1 rounded-badge border border-amber-200 bg-amber-50 text-amber-700 font-sans font-semibold text-[10px] shadow-sm'>
            In Progress
          </span>
        );
      case 'CANCELLED':
        return (
          <span className='px-3 py-1 rounded-badge border border-red-200 bg-red-50 text-red-700 font-sans font-semibold text-[10px] shadow-sm'>
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getDrawType = (draw: Raffle) => {
    if (!draw.isAutoDraw) return 'Manual (Host)';
    if (draw.isAutoDraw && draw.autoDrawSoldOut) return 'Auto (Sold Out)';
    return 'Auto (Date)';
  };

  const getTypeStyle = (type: string) => {
    if (type.includes('Auto')) return 'text-emerald-700 font-bold';
    if (type.includes('Manual')) return 'text-amber-700 font-bold';
    return 'text-text-primary font-semibold';
  };

  const [selectedDrawForWinner, setSelectedDrawForWinner] = useState<Raffle | null>(null);

  return (
    <div className='w-full bg-surface border border-border rounded-card overflow-hidden shadow-card overflow-x-auto select-none'>
      <table className='w-full min-w-[900px] text-left border-collapse'>
        <thead>
          <tr className='border-b border-border bg-accent-bg/50'>
            <th className='py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[20%]'>
              COMPETITION NAME
            </th>
            <th className='py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[20%]'>
              HOST
            </th>
            <th className='py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%] text-center'>
              DRAW TYPE
            </th>
            <th className='py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%] text-center'>
              END DATE
            </th>
            <th className='py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center'>
              TOTAL TICKETS
            </th>
            <th className='py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center'>
              STATUS
            </th>
            <th className='py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-right'>
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody>
          {draws.map((draw, i) => {
            const hostName = draw.host?.businessName || 'Unknown Host';
            const hostInitials = hostName.substring(0, 2).toUpperCase();
            const drawType = getDrawType(draw);

            return (
              <tr
                key={draw.id}
                className={`${i !== draws.length - 1 ? 'border-b border-divider' : ''} hover:bg-accent-bg/30 transition-colors`}
              >
                <td className='py-4 px-6'>
                  <span className='font-sans font-semibold text-[13px] text-text-primary'>
                    {draw.title}
                  </span>
                </td>
                <td className='py-4 px-6'>
                  <div className='flex items-center gap-3'>
                    <div className='w-6 h-6 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0 overflow-hidden'>
                      {draw.host?.user?.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={draw.host.user.avatarUrl}
                          alt='Host'
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <span className='font-sans font-bold text-[9px] text-text-brand'>
                          {hostInitials}
                        </span>
                      )}
                    </div>
                    <span className='font-sans text-[13px] text-text-muted font-medium'>{hostName}</span>
                  </div>
                </td>
                <td className='py-4 px-6 text-center'>
                  <span className={`font-sans text-[12px] ${getTypeStyle(drawType)}`}>
                    {drawType}
                  </span>
                </td>
                <td className='py-4 px-6 text-center'>
                  <span className='font-sans font-medium text-[12px] text-text-muted'>
                    {draw.endDate ? format(new Date(draw.endDate), 'dd MMM yyyy HH:mm') : 'N/A'}
                  </span>
                </td>
                <td className='py-4 px-6 text-center'>
                  <span className='font-sans font-bold text-[13px] text-text-primary'>
                    {draw.totalTickets}
                  </span>
                </td>
                <td className='py-4 px-6 text-center flex justify-center'>
                  {getStatusPill(draw.status)}
                </td>
                <td className='py-4 px-6'>
                  <div className='flex items-center justify-end gap-3'>
                    <button
                      onClick={() => onSelectDraw(draw)}
                      className='px-3 py-1.5 rounded-button bg-surface border border-border hover:bg-accent-bg text-text-primary font-sans font-semibold text-[12px] transition-all cursor-pointer shadow-sm'
                    >
                      Details
                    </button>
                    {(() => {
                      const hasWinner = Boolean(
                        (draw as any).winners?.some((w: any) => w.winType === 'MAIN_DRAW')
                      );
                      const isSoldOut = (draw.ticketsSold || 0) >= (draw.totalTickets || 1);
                      const isExpired = draw.endDate ? new Date(draw.endDate) <= new Date() : false;
                      const canDraw = !hasWinner && (isSoldOut || isExpired);

                      if (hasWinner) {
                        return (
                          <span className='px-3 py-1.5 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-sans font-semibold text-[11px] flex items-center gap-1 shrink-0 shadow-sm'>
                            <span>✓</span> Winner Selected
                          </span>
                        );
                      }

                      if (canDraw) {
                        return (
                          <button
                            onClick={() => setSelectedDrawForWinner(draw)}
                            className='px-3 py-1.5 rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[12px] shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer'
                          >
                            <span>🏆</span>
                            <span>Select Winner</span>
                          </button>
                        );
                      }

                      return (
                        <span className='px-3 py-1 rounded-badge border border-border bg-bg text-text-muted font-sans font-medium text-[11px] shrink-0' title="Available when sold out or expired">
                          Live (In Progress)
                        </span>
                      );
                    })()}
                  </div>
                </td>
              </tr>
            );
          })}
          {draws.length === 0 && (
            <tr>
              <td colSpan={7} className='py-8 text-center text-text-muted font-sans text-sm font-medium'>
                No draws found for this filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedDrawForWinner && (
        <ManualWinnerSelectModal
          isOpen={!!selectedDrawForWinner}
          onClose={() => setSelectedDrawForWinner(null)}
          raffle={selectedDrawForWinner}
          isAdmin={true}
          onSuccess={() => {
            // Optional callback
          }}
        />
      )}
    </div>
  );
}
