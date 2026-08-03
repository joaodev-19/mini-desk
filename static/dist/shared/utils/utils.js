export function formatDate(date) {
    const formattedDate = new Date(date);
    if (isNaN(formattedDate.getTime())) {
        throw new Error("Date input is invalid.");
    }
    const day = String(formattedDate.getDate()).padStart(2, "0");
    const month = String(formattedDate.getMonth() + 1).padStart(2, "0");
    const year = String(formattedDate.getFullYear());
    return `${day}/${month}/${year}`;
}
export function formatTime(datetime) {
    const formattedTime = new Date(datetime);
    if (isNaN(formattedTime.getTime())) {
        throw new Error("Datetime input is invalid.");
    }
    const hours = String(formattedTime.getHours()).padStart(2, "0");
    const minutes = String(formattedTime.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}
export function formatDateTime(datetime) {
    return `${formatDate(datetime)} às ${formatTime(datetime)}`;
}
//# sourceMappingURL=utils.js.map