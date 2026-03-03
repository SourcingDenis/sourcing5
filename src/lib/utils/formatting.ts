export function formatCapacityHours(hours: number): string {
  return `${hours}h`;
}

export function formatPriority(priority: string): string {
  const priorityMap: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };
  return priorityMap[priority] || priority;
}

export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Active',
    paused: 'Paused',
    closed: 'Closed',
  };
  return statusMap[status] || status;
}

export function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    lead: 'Lead',
    sourcer: 'Sourcer',
  };
  return roleMap[role] || role;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatLoadRatio(ratio: number): string {
  return `${(ratio * 100).toFixed(0)}%`;
}
