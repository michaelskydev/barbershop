const startHour = 9, startMin = 0;
const endHour = 20, endMin = 0;
const dateStr = "2026-06-03";
const [year, month, day] = dateStr.split('-').map(Number);
const date = new Date(Date.UTC(year, month - 1, day));

const current = new Date(date);
current.setUTCHours(startHour, startMin, 0, 0);

const end = new Date(date);
end.setUTCHours(endHour, endMin, 0, 0);

const slots = [];
while (current < end) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);
    
    slots.push(slotStart.toISOString().substring(11, 16));
    current.setUTCMinutes(current.getUTCMinutes() + 30);
}

console.log(slots);
