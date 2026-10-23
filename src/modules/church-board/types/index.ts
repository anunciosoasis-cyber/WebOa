export interface ChurchBoardSession {
  id: string;
  title: string;
  date: string;
  quorumMin: number;
  status: 'draft' | 'active' | 'closed';
  agendaPoints: AgendaPoint[];
  description?: string; // HTML format from rich text editor
}

export interface AgendaPoint {
  id: string;
  title: string;
  description: string; // HTML format from rich text editor
  requiresVoting: boolean;
  votingResult?: VotingResult;
}

export interface VotingResult {
  onlineVotes: { inFavor: number; against: number; abstentions: number };
  manualVotes: { inFavor: number; against: number; abstentions: number };
  totalInFavor: number;
  totalAgainst: number;
  totalAbstentions: number;
  isPassed: boolean;
}
