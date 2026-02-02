export function formatTime12h(timeStr: string) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

export function formatValueTo12h(val: number) {
    const h = Math.floor(val);
    const m = (val % 1) * 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    if (m === 0) return `${displayH} ${period}`;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}
