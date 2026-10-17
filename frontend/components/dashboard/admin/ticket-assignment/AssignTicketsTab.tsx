"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  useAdminAssignmentCompetitions,
  useAdminAssignmentCompetitionDetails,
  useAdminAssignmentUserSearch,
  useAdminAssignTicketsMutation,
} from "../../../../hooks/useAdminHooks";
import {
  AssignmentSearchUser,
  AssignTicketsResponse,
} from "../../../../services/admin.service";
import AssignmentConfirmModal from "./AssignmentConfirmModal";
import AssignmentSuccessModal from "./AssignmentSuccessModal";
import {
  Search,
  Trophy,
  Zap,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  UserCheck,
  RefreshCw,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";

export default function AssignTicketsTab() {
  // Competition Selection State
  const [competitionSearch, setCompetitionSearch] = useState("");
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("");
  const [isCompDropdownOpen, setIsCompDropdownOpen] = useState(false);
  const compDropdownRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: competitions = [], isLoading: isLoadingComps } =
    useAdminAssignmentCompetitions();

  const { data: compDetails, isLoading: isLoadingDetails } =
    useAdminAssignmentCompetitionDetails(selectedCompetitionId, Boolean(selectedCompetitionId));

  // Auto-select first active competition if none selected
  useEffect(() => {
    if (!selectedCompetitionId && competitions.length > 0) {
      setSelectedCompetitionId(competitions[0].id);
    }
  }, [competitions, selectedCompetitionId]);

  // Mode Selection: "specific" | "random"
  const [selectionMode, setSelectionMode] = useState<"specific" | "random">("specific");

  // Mode A: Specific Numbers
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [gridFilter, setGridFilter] = useState<"all" | "available" | "instant" | "sold">("all");
  const [gridSearch, setGridSearch] = useState("");
  const [gridPage, setGridPage] = useState(1);
  const GRID_PAGE_SIZE = 150;

  // Mode B: Random Quantity
  const [randomQuantity, setRandomQuantity] = useState<number>(1);

  // Recipient User Search State
  const [userQuery, setUserQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AssignmentSearchUser | null>(null);
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
  const userSearchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults = [], isFetching: isSearchingUsers } =
    useAdminAssignmentUserSearch(userQuery, userQuery.trim().length >= 1 && !selectedUser);

  // Admin Notes
  const [adminNotes, setAdminNotes] = useState("");

  // Modals
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<AssignTicketsResponse | null>(null);

  const assignMutation = useAdminAssignTicketsMutation();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        compDropdownRef.current &&
        !compDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCompDropdownOpen(false);
      }
      if (
        userSearchRef.current &&
        !userSearchRef.current.contains(event.target as Node)
      ) {
        setIsUserSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered competitions for dropdown
  const filteredCompetitions = useMemo(() => {
    if (!competitionSearch.trim()) return competitions;
    const term = competitionSearch.toLowerCase();
    return competitions.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        (c.host?.businessName && c.host.businessName.toLowerCase().includes(term))
    );
  }, [competitions, competitionSearch]);

  // Sets of sold and instant win numbers for fast lookups
  const soldTicketsMap = useMemo(() => {
    if (!compDetails?.soldTickets) return new Map();
    const map = new Map();
    for (const st of compDetails.soldTickets) {
      map.set(st.ticketNumber, st);
    }
    return map;
  }, [compDetails]);

  const instantWinsMap = useMemo(() => {
    if (!compDetails?.instantWins) return new Map();
    const map = new Map();
    for (const iw of compDetails.instantWins) {
      map.set(iw.ticketNumber, iw);
    }
    return map;
  }, [compDetails]);

  // Handle direct manual typing / pasting of comma-separated numbers
  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setManualInput(val);

    if (!compDetails) return;

    // Parse comma or space separated numbers
    const parts = val
      .split(/[\s,]+/)
      .map((s) => s.trim().replace(/^#/, ""))
      .filter((s) => /^\d+$/.test(s))
      .map(Number);

    const validNewNumbers = parts.filter(
      (n) =>
        n >= 1 &&
        n <= compDetails.totalTickets &&
        !soldTicketsMap.has(n)
    );

    const uniqueSet = Array.from(new Set(validNewNumbers));
    setSelectedNumbers(uniqueSet);
  };

  // Toggle single ticket tile in the grid
  const handleToggleTile = (num: number) => {
    if (soldTicketsMap.has(num)) {
      const soldData = soldTicketsMap.get(num);
      toast.error(`Ticket #${num} is already sold to ${soldData?.buyer?.name || "another participant"}`);
      return;
    }

    setSelectedNumbers((prev) => {
      const next = prev.includes(num)
        ? prev.filter((n) => n !== num)
        : [...prev, num].sort((a, b) => a - b);
      setManualInput(next.join(", "));
      return next;
    });
  };

  // 1-Click quick select available instant win ticket
  const handleQuickSelectInstantWin = (ticketNum: number) => {
    if (soldTicketsMap.has(ticketNum)) {
      toast.error(`Ticket #${ticketNum} is already sold`);
      return;
    }
    setSelectedNumbers((prev) => {
      if (prev.includes(ticketNum)) return prev;
      const next = [...prev, ticketNum].sort((a, b) => a - b);
      setManualInput(next.join(", "));
      toast.success(`Selected Instant Win Ticket #${ticketNum}`);
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedNumbers([]);
    setManualInput("");
  };

  // Filtered ticket tiles for grid
  const totalTicketsCount = compDetails?.totalTickets || 0;
  const filteredGridTiles = useMemo(() => {
    if (!compDetails) return [];
    const tiles: number[] = [];

    const searchNum = gridSearch.trim() ? parseInt(gridSearch.trim(), 10) : null;

    for (let i = 1; i <= compDetails.totalTickets; i++) {
      if (searchNum !== null && !isNaN(searchNum) && i !== searchNum) {
        continue;
      }

      const isSold = soldTicketsMap.has(i);
      const isInstant = instantWinsMap.has(i);

      if (gridFilter === "available" && isSold) continue;
      if (gridFilter === "sold" && !isSold) continue;
      if (gridFilter === "instant" && !isInstant) continue;

      tiles.push(i);
    }
    return tiles;
  }, [compDetails, gridFilter, gridSearch, soldTicketsMap, instantWinsMap]);

  const totalGridPages = Math.ceil(filteredGridTiles.length / GRID_PAGE_SIZE) || 1;
  const paginatedGridTiles = useMemo(() => {
    const start = (gridPage - 1) * GRID_PAGE_SIZE;
    return filteredGridTiles.slice(start, start + GRID_PAGE_SIZE);
  }, [filteredGridTiles, gridPage]);

  // Calculations for Step 5 Accounting Breakdown
  const finalQuantity =
    selectionMode === "specific" ? selectedNumbers.length : randomQuantity;
  const unitPrice = compDetails?.pricePerTicket || 0;
  const totalFinancialAmount = finalQuantity * unitPrice;

  const instantWinsTriggeredCount = useMemo(() => {
    if (selectionMode !== "specific" || !compDetails) return 0;
    return selectedNumbers.filter(
      (num) => instantWinsMap.has(num) && !instantWinsMap.get(num)?.isClaimed
    ).length;
  }, [selectionMode, selectedNumbers, compDetails, instantWinsMap]);

  // Validation before triggering confirmation modal
  const handleOpenConfirm = () => {
    if (!selectedCompetitionId || !compDetails) {
      toast.error("Please select an active competition");
      return;
    }
    if (!selectedUser) {
      toast.error("Please search and select a recipient user");
      return;
    }
    if (selectionMode === "specific" && selectedNumbers.length === 0) {
      toast.error("Please select at least one ticket number");
      return;
    }
    if (selectionMode === "random" && (randomQuantity <= 0 || isNaN(randomQuantity))) {
      toast.error("Please specify a valid ticket quantity");
      return;
    }
    if (
      selectionMode === "random" &&
      randomQuantity > compDetails.remainingTickets
    ) {
      toast.error(
        `Quantity cannot exceed remaining tickets (${compDetails.remainingTickets})`
      );
      return;
    }

    setIsConfirmOpen(true);
  };

  // Execution
  const handleExecuteAssignment = async () => {
    if (!selectedCompetitionId || !selectedUser) return;

    try {
      const payload = {
        raffleId: selectedCompetitionId,
        userId: selectedUser.id,
        ticketNumbers: selectionMode === "specific" ? selectedNumbers : undefined,
        quantity: selectionMode === "random" ? randomQuantity : undefined,
        adminNotes: adminNotes.trim() || undefined,
      };

      const res = await assignMutation.mutateAsync(payload);
      setIsConfirmOpen(false);
      setAssignmentResult(res);
      setIsSuccessOpen(true);

      // Reset selection
      setSelectedNumbers([]);
      setManualInput("");
      setAdminNotes("");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to assign tickets";
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fadeIn select-none">
      {/* ======================================================== */}
      {/* STEP 1: COMPETITION SELECTION */}
      {/* ======================================================== */}
      <section className="bg-surface border border-border rounded-card p-6 shadow-card flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 text-text-brand font-mono font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="font-heading font-bold text-lg text-text-primary">
              Select Live Competition
            </h2>
          </div>
          {compDetails && (
            <span className="px-3 py-1 rounded-badge bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 font-bold text-xs">
              Live & Active
            </span>
          )}
        </div>

        {/* Dropdown Selector */}
        <div className="relative w-full" ref={compDropdownRef}>
          <button
            type="button"
            onClick={() => setIsCompDropdownOpen((prev) => !prev)}
            className="w-full h-12 bg-bg border border-border rounded-button px-4 flex items-center justify-between text-left hover:border-primary transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 truncate">
              {compDetails?.mainImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={compDetails.mainImage}
                  alt={compDetails.title}
                  className="w-7 h-7 rounded object-cover shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded bg-accent-bg flex items-center justify-center text-xs shrink-0">
                  🎟️
                </div>
              )}
              <span className="font-semibold text-text-primary text-sm truncate">
                {compDetails ? compDetails.title : "Choose an active competition..."}
              </span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-text-muted transition-transform ${
                isCompDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isCompDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-card shadow-xl z-30 max-h-80 overflow-hidden flex flex-col animate-fadeIn">
              <div className="p-3 border-b border-border bg-bg">
                <div className="relative">
                  <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search competitions by title or host..."
                    value={competitionSearch}
                    onChange={(e) => setCompetitionSearch(e.target.value)}
                    className="w-full h-9 bg-surface border border-border rounded-button pl-9 pr-3 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-primary"
                    autoFocus
                  />
                </div>
              </div>

              <div className="overflow-y-auto max-h-60 p-2 flex flex-col gap-1">
                {filteredCompetitions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-text-muted font-medium">
                    No active competitions match your search.
                  </div>
                ) : (
                  filteredCompetitions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCompetitionId(c.id);
                        setIsCompDropdownOpen(false);
                        setSelectedNumbers([]);
                        setManualInput("");
                      }}
                      className={`p-2.5 rounded-button text-left flex items-center justify-between transition-colors cursor-pointer ${
                        c.id === selectedCompetitionId
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-accent-bg"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate pr-2">
                        {c.mainImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={c.mainImage}
                            alt={c.title}
                            className="w-9 h-9 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded bg-accent-bg flex items-center justify-center text-sm shrink-0">
                            🎟️
                          </div>
                        )}
                        <div className="flex flex-col truncate">
                          <span className="font-semibold text-text-primary text-xs truncate">
                            {c.title}
                          </span>
                          <span className="text-[11px] text-text-muted truncate">
                            Host: {c.host?.businessName || "Host"} • Remaining: {c.remainingTickets}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-xs text-text-brand block">
                          £{c.pricePerTicket.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {c.ticketsSold}/{c.totalTickets}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected Competition Preview Card */}
        {compDetails && (
          <div className="p-4 rounded-card bg-bg border border-border flex flex-col md:flex-row items-center gap-5">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-accent-bg border border-border shrink-0 relative">
              {compDetails.mainImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={compDetails.mainImage}
                  alt={compDetails.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  🎟️
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-2 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="font-heading font-bold text-base text-text-primary">
                  {compDetails.title}
                </h3>
                <span className="font-mono font-bold text-primary text-base">
                  £{compDetails.pricePerTicket.toFixed(2)}{" "}
                  <span className="text-xs font-normal text-text-muted">/ ticket</span>
                </span>
              </div>

              <p className="text-xs text-text-muted">
                Host: <strong className="text-text-primary">{compDetails.host?.businessName || "Verified Host"}</strong>{" "}
                ({compDetails.host?.user?.email || "N/A"})
              </p>

              {/* Progress Bar */}
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex justify-between items-center text-[11px] font-medium text-text-muted">
                  <span>Sold: {compDetails.ticketsSold} / {compDetails.totalTickets}</span>
                  <span className="font-bold text-text-primary">
                    {compDetails.remainingTickets} Remaining
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface border border-border overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (compDetails.ticketsSold / compDetails.totalTickets) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* STEP 2: INSTANT WIN VISUALIZER */}
      {/* ======================================================== */}
      {compDetails && (
        <section className="bg-surface border border-border rounded-card p-6 shadow-card flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 font-mono font-bold text-xs flex items-center justify-center">
                2
              </span>
              <div>
                <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2">
                  <span>Instant Win Prize Visualizer</span>
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                </h2>
                <p className="text-xs text-text-muted">
                  Configured instant win tickets for this competition. Click any available prize to auto-select its ticket!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-text-muted">
                Total: <strong>{compDetails.instantWins.length}</strong>
              </span>
              <span className="text-emerald-700">
                Available: <strong>{compDetails.instantWins.filter((w) => !w.isClaimed).length}</strong>
              </span>
              <span className="text-text-muted">
                Claimed: <strong>{compDetails.instantWins.filter((w) => w.isClaimed).length}</strong>
              </span>
            </div>
          </div>

          {compDetails.instantWins.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-muted bg-bg rounded-card border border-border">
              No instant wins configured for this competition.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {compDetails.instantWins.map((iw) => {
                const isSelected = selectedNumbers.includes(iw.ticketNumber);
                const isSold = soldTicketsMap.has(iw.ticketNumber);

                return (
                  <div
                    key={iw.id}
                    className={`p-3 rounded-card border transition-all flex items-center justify-between gap-3 ${
                      iw.isClaimed || isSold
                        ? "bg-bg/60 border-border opacity-60"
                        : isSelected
                        ? "bg-amber-500/15 border-amber-500 shadow-sm"
                        : "bg-bg border-amber-500/30 hover:border-amber-500"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          iw.isClaimed || isSold
                            ? "bg-accent-bg text-text-muted"
                            : "bg-amber-500/20 text-amber-700 border border-amber-500/40"
                        }`}
                      >
                        #{iw.ticketNumber}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="font-semibold text-xs text-text-primary truncate" title={iw.prizeName}>
                          {iw.prizeName}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {iw.rrpValue ? `RRP £${iw.rrpValue.toFixed(2)} • ` : ""}
                          {iw.isClaimed ? "Claimed" : isSold ? "Sold" : "Available"}
                        </span>
                      </div>
                    </div>

                    {!iw.isClaimed && !isSold && (
                      <button
                        type="button"
                        onClick={() => handleQuickSelectInstantWin(iw.ticketNumber)}
                        disabled={isSelected}
                        className={`px-2.5 py-1 rounded-badge text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 text-white"
                            : "bg-amber-500/10 hover:bg-amber-500 hover:text-white border border-amber-500/30 text-amber-700"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select ⚡"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ======================================================== */}
      {/* STEP 3: TICKET NUMBER SELECTION */}
      {/* ======================================================== */}
      {compDetails && (
        <section className="bg-surface border border-border rounded-card p-6 shadow-card flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 text-text-brand font-mono font-bold text-xs flex items-center justify-center">
                3
              </span>
              <div>
                <h2 className="font-heading font-bold text-lg text-text-primary">
                  Select Ticket Numbers
                </h2>
                <p className="text-xs text-text-muted">
                  Choose specific numbers from the interactive grid or specify a random quantity
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center p-1 bg-bg border border-border rounded-badge shrink-0">
              <button
                type="button"
                onClick={() => setSelectionMode("specific")}
                className={`px-4 py-1.5 rounded-badge text-xs font-bold transition-all cursor-pointer ${
                  selectionMode === "specific"
                    ? "bg-primary text-primary-text shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Specific Numbers
              </button>
              <button
                type="button"
                onClick={() => setSelectionMode("random")}
                className={`px-4 py-1.5 rounded-badge text-xs font-bold transition-all cursor-pointer ${
                  selectionMode === "random"
                    ? "bg-primary text-primary-text shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Random Quantity
              </button>
            </div>
          </div>

          {/* MODE A: SPECIFIC NUMBERS */}
          {selectionMode === "specific" ? (
            <div className="flex flex-col gap-4">
              {/* Direct comma-separated input */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Type or paste comma-separated numbers (e.g. 5, 12, 42)..."
                    value={manualInput}
                    onChange={handleManualInputChange}
                    className="w-full h-11 bg-bg border border-border rounded-button px-4 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-primary"
                  />
                </div>
                {selectedNumbers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="h-11 px-4 rounded-button bg-surface border border-border hover:bg-accent-bg text-text-muted hover:text-red-600 text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              {/* Grid Controls & Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {(["all", "available", "instant", "sold"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setGridFilter(filter);
                        setGridPage(1);
                      }}
                      className={`px-3 py-1 rounded-badge text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        gridFilter === filter
                          ? "bg-primary text-primary-text shadow-sm"
                          : "bg-surface border border-border text-text-muted hover:text-text-primary"
                      }`}
                    >
                      {filter === "all"
                        ? "Show All"
                        : filter === "available"
                        ? "Available Only"
                        : filter === "instant"
                        ? "Instant Wins ⚡"
                        : "Sold Only"}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search ticket #..."
                    value={gridSearch}
                    onChange={(e) => {
                      setGridSearch(e.target.value);
                      setGridPage(1);
                    }}
                    className="w-full h-8 bg-bg border border-border rounded-button pl-8 pr-3 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Interactive Ticket Grid */}
              <div className="p-4 rounded-card bg-bg border border-border">
                {paginatedGridTiles.length === 0 ? (
                  <div className="py-12 text-center text-xs text-text-muted">
                    No tickets match the selected filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2">
                    {paginatedGridTiles.map((num) => {
                      const isSold = soldTicketsMap.has(num);
                      const isInstant = instantWinsMap.has(num);
                      const isSelected = selectedNumbers.includes(num);
                      const soldData = isSold ? soldTicketsMap.get(num) : null;

                      let tileClasses =
                        "h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs transition-all relative cursor-pointer ";

                      if (isSold) {
                        tileClasses +=
                          "bg-surface/40 text-text-muted line-through opacity-50 cursor-not-allowed border border-divider";
                      } else if (isSelected) {
                        tileClasses +=
                          "bg-primary text-primary-text border-2 border-primary ring-2 ring-primary/40 shadow-glow scale-105";
                      } else if (isInstant) {
                        tileClasses +=
                          "bg-surface hover:bg-amber-500/20 text-amber-600 border-2 border-amber-500/80 shadow-sm";
                      } else {
                        tileClasses +=
                          "bg-surface hover:bg-accent-bg text-text-primary border border-border hover:border-border-medium";
                      }

                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleToggleTile(num)}
                          disabled={isSold}
                          title={
                            isSold
                              ? `Ticket #${num} (Sold to ${soldData?.buyer?.name || "Participant"})`
                              : isInstant
                              ? `Ticket #${num} (Instant Win: ${instantWinsMap.get(num)?.prizeName})`
                              : `Ticket #${num}`
                          }
                          className={tileClasses}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : isInstant ? (
                            <div className="flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                              <span>{num}</span>
                            </div>
                          ) : (
                            num
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Grid Pagination */}
                {totalGridPages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-border text-xs text-text-muted">
                    <span>
                      Showing tickets {(gridPage - 1) * GRID_PAGE_SIZE + 1} to{" "}
                      {Math.min(gridPage * GRID_PAGE_SIZE, filteredGridTiles.length)} of{" "}
                      {filteredGridTiles.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGridPage((p) => Math.max(1, p - 1))}
                        disabled={gridPage === 1}
                        className="px-3 py-1 rounded-button bg-surface border border-border hover:bg-accent-bg disabled:opacity-30 cursor-pointer"
                      >
                        Prev
                      </button>
                      <span className="font-semibold text-text-primary">
                        Page {gridPage} of {totalGridPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGridPage((p) => Math.min(totalGridPages, p + 1))}
                        disabled={gridPage === totalGridPages}
                        className="px-3 py-1 rounded-button bg-surface border border-border hover:bg-accent-bg disabled:opacity-30 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Numbers Chip Bar */}
              {selectedNumbers.length > 0 && (
                <div className="p-4 rounded-card bg-primary/5 border border-primary/20 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-brand uppercase tracking-wider">
                      Selected Numbers ({selectedNumbers.length} tickets • Total: £
                      {(selectedNumbers.length * unitPrice).toFixed(2)})
                    </span>
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-xs text-text-muted hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {selectedNumbers.map((num) => {
                      const isInstant = instantWinsMap.has(num);
                      return (
                        <span
                          key={num}
                          className={`px-2.5 py-1 rounded-badge text-xs font-mono font-bold flex items-center gap-1.5 ${
                            isInstant
                              ? "bg-amber-500/20 text-amber-700 border border-amber-500"
                              : "bg-surface text-text-primary border border-border"
                          }`}
                        >
                          {isInstant && <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          #{num}
                          <button
                            type="button"
                            onClick={() => handleToggleTile(num)}
                            className="text-text-muted hover:text-red-500 transition-colors ml-0.5 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* MODE B: RANDOM QUANTITY */
            <div className="flex flex-col gap-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRandomQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 rounded-button bg-surface border border-border hover:bg-accent-bg flex items-center justify-center text-text-primary cursor-pointer transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={compDetails.remainingTickets}
                    value={randomQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setRandomQuantity(isNaN(val) ? 1 : Math.max(1, Math.min(val, compDetails.remainingTickets)));
                    }}
                    className="w-24 h-12 text-center font-mono font-bold text-xl bg-bg border border-border rounded-button text-text-primary outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRandomQuantity((q) => Math.min(compDetails.remainingTickets, q + 1))
                    }
                    className="w-12 h-12 rounded-button bg-surface border border-border hover:bg-accent-bg flex items-center justify-center text-text-primary cursor-pointer transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Preset quick buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {[1, 5, 10, 25, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setRandomQuantity((q) =>
                          Math.min(compDetails.remainingTickets, q + preset)
                        )
                      }
                      className="px-3.5 py-2 rounded-button bg-surface border border-border hover:border-primary hover:bg-accent-bg text-xs font-mono font-bold text-text-primary transition-all cursor-pointer"
                    >
                      +{preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setRandomQuantity(compDetails.remainingTickets)}
                    className="px-3.5 py-2 rounded-button bg-primary/10 border border-primary/30 text-xs font-bold text-text-brand hover:bg-primary hover:text-white transition-all cursor-pointer"
                  >
                    Max ({compDetails.remainingTickets})
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-card bg-bg border border-border text-xs text-text-muted flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                <span>
                  The server will randomly pick {randomQuantity} currently available ticket numbers
                  from the remaining pool without any collision or duplicate assignment.
                </span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ======================================================== */}
      {/* STEP 4: RECIPIENT USER SEARCH */}
      {/* ======================================================== */}
      <section className="bg-surface border border-border rounded-card p-6 shadow-card flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 text-text-brand font-mono font-bold text-xs flex items-center justify-center">
            4
          </span>
          <div>
            <h2 className="font-heading font-bold text-lg text-text-primary">
              Recipient User Search
            </h2>
            <p className="text-xs text-text-muted">
              Search by user name, email, or user ID to assign complimentary tickets
            </p>
          </div>
        </div>

        {selectedUser ? (
          <div className="p-4 rounded-card bg-bg border border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 truncate">
              <div className="w-12 h-12 rounded-full bg-accent-bg border border-border flex items-center justify-center font-bold text-sm text-text-brand shrink-0 overflow-hidden">
                {selectedUser.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedUser.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary text-sm truncate">
                    {selectedUser.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-badge bg-primary/10 text-text-brand font-bold text-[10px]">
                    {selectedUser.role}
                  </span>
                </div>
                <span className="text-xs text-text-muted truncate">
                  {selectedUser.email}
                </span>
                <span className="font-mono text-[10px] text-text-muted truncate">
                  ID: {selectedUser.id}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedUser(null);
                setUserQuery("");
              }}
              className="px-4 py-2 rounded-button bg-surface border border-border hover:bg-accent-bg text-text-secondary font-semibold text-xs transition-colors cursor-pointer shrink-0"
            >
              Change User
            </button>
          </div>
        ) : (
          <div className="relative w-full" ref={userSearchRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type name, email, or user ID to search active participants..."
                value={userQuery}
                onChange={(e) => {
                  setUserQuery(e.target.value);
                  setIsUserSearchOpen(true);
                }}
                onFocus={() => setIsUserSearchOpen(true)}
                className="w-full h-12 bg-bg border border-border rounded-button pl-11 pr-10 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary"
              />
              {isSearchingUsers && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <RefreshCw className="w-4 h-4 text-text-muted animate-spin" />
                </div>
              )}
            </div>

            {isUserSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-card shadow-xl z-30 max-h-72 overflow-y-auto flex flex-col p-2 animate-fadeIn">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-text-muted">
                    {userQuery.trim().length === 0
                      ? "Start typing to search users..."
                      : "No active users found matching your search."}
                  </div>
                ) : (
                  searchResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(u);
                        setIsUserSearchOpen(false);
                      }}
                      className="p-3 rounded-button text-left flex items-center justify-between hover:bg-accent-bg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-9 h-9 rounded-full bg-accent-bg border border-border flex items-center justify-center font-bold text-xs text-text-brand shrink-0 overflow-hidden">
                          {u.avatarUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={u.avatarUrl}
                              alt={u.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            u.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="font-semibold text-text-primary text-xs truncate">
                            {u.name}
                          </span>
                          <span className="text-[11px] text-text-muted truncate">
                            {u.email}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-badge bg-accent-bg border border-border text-[10px] text-text-brand font-bold shrink-0">
                        {u.role}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* STEP 5: ACCOUNTING BREAKDOWN & ACTION */}
      {/* ======================================================== */}
      <section className="bg-surface border border-border rounded-card p-6 shadow-card flex flex-col gap-6">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 text-text-brand font-mono font-bold text-xs flex items-center justify-center">
            5
          </span>
          <div>
            <h2 className="font-heading font-bold text-lg text-text-primary">
              Accounting Breakdown & Assignment
            </h2>
            <p className="text-xs text-text-muted">
              Complete financial consistency review and host wallet crediting
            </p>
          </div>
        </div>

        {/* Warning if instant wins triggered */}
        {instantWinsTriggeredCount > 0 && (
          <div className="p-4 rounded-card bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-heading font-bold text-amber-600 text-sm">
                Instant Win Warning!
              </span>
              <p className="text-xs text-text-secondary leading-relaxed">
                {instantWinsTriggeredCount} of the selected ticket number(s) will immediately trigger and claim an Instant Win prize for recipient{" "}
                <strong>{selectedUser?.name || "the user"}</strong>. Winner records will be generated automatically.
              </p>
            </div>
          </div>
        )}

        {/* Financial Summary Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-card bg-bg border border-border flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Assignment Summary
            </span>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Recipient:</span>
              <span className="font-semibold text-text-primary">
                {selectedUser ? selectedUser.name : "Not selected"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Competition:</span>
              <span className="font-semibold text-text-primary truncate max-w-[200px]">
                {compDetails ? compDetails.title : "Not selected"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Assigned Quantity:</span>
              <span className="font-bold text-text-primary">{finalQuantity} Ticket(s)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Unit Price:</span>
              <span className="font-bold text-text-primary">£{unitPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-4 rounded-card bg-bg border border-border flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Host Financial Impact
            </span>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Target Host:</span>
              <span className="font-semibold text-text-primary">
                {compDetails?.host?.businessName || "Host"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Wallet Credited:</span>
              <span className="font-bold text-emerald-600">
                +£{totalFinancialAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Payment Channel:</span>
              <span className="px-2 py-0.5 rounded-badge bg-primary/10 border border-primary/30 text-text-brand font-bold text-[10px]">
                ADMIN_MANUAL
              </span>
            </div>
            <div className="h-px bg-divider my-0.5" />
            <div className="flex justify-between items-center text-sm">
              <span className="font-heading font-bold text-text-primary">Total Order Value:</span>
              <span className="font-heading font-bold text-text-brand text-lg">
                £{totalFinancialAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Optional Admin Notes Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Admin Notes / Allocation Reason (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. VIP Giveaway winner, Loyalty compensation, Social media giveaway..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="w-full h-11 bg-bg border border-border rounded-button px-4 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-primary"
          />
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleOpenConfirm}
          disabled={finalQuantity === 0 || !selectedUser || !compDetails}
          className="w-full h-13 rounded-button bg-primary hover:bg-primary-hover text-primary-text font-heading font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          <span>Assign Tickets ({finalQuantity} Tickets • £{totalFinancialAmount.toFixed(2)})</span>
        </button>
      </section>

      {/* Confirmation Modal */}
      <AssignmentConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleExecuteAssignment}
        isLoading={assignMutation.isPending}
        competition={compDetails || null}
        recipient={selectedUser}
        mode={selectionMode}
        selectedNumbers={selectedNumbers}
        randomQuantity={randomQuantity}
        adminNotes={adminNotes}
      />

      {/* Success Modal */}
      <AssignmentSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        result={assignmentResult}
      />
    </div>
  );
}
