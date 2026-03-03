/**
 * Returns a human-readable relative time string in French.
 * Examples: "IL Y A 5 MIN", "IL Y A 3H", "IL Y A 2J"
 */
export function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `IL Y A ${mins} MIN`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `IL Y A ${hours}H`;
    const days = Math.floor(hours / 24);
    return `IL Y A ${days}J`;
}

/**
 * Lowercase variant for contexts that need it.
 * Examples: "5 min", "3h", "2j"
 */
export function timeAgoShort(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}j`;
}
