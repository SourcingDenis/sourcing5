export interface Team {
  id: string;
  name: string;
  leadId: string;
  createdAt: string;
}

export interface CreateTeamInput {
  name: string;
  leadId: string;
}

export interface UpdateTeamInput {
  name?: string;
  leadId?: string;
}
