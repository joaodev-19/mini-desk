export function formatDate(date: Date | string | number): string {
    const inputDate = new Date(date);

    if (isNaN(inputDate.getTime())) {
        throw new Error("Date input is invalid.");
    }

    const today = new Date();

    if (inputDate.setHours(0,0,0,0) === today.setHours(0,0,0,0)) {
        return "Hoje";
    }

    const day = String(inputDate.getDate()).padStart(2, "0");
    const month = String(inputDate.getMonth() + 1).padStart(2, "0");
    const year = String(inputDate.getFullYear());

    return `${day}/${month}/${year}`;
}

export function formatTime(datetime: Date | string | number): string {
    const formattedTime = new Date(datetime);

    if (isNaN(formattedTime.getTime())){
        throw new Error("Datetime input is invalid.");
    }

    const hours = String(formattedTime.getHours()).padStart(2, "0");
    const minutes = String(formattedTime.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
}

export function formatDateTime(datetime: Date | string | number): string {
    return `${formatDate(datetime)} às ${formatTime(datetime)}`;
}

export function getInitials(name: string): string {
    const names = name.trim().split(/\s+/);

    if (!names[0]) {
        throw new Error("O nome está vazio.");
    }

    const firstName = names[0];

    if (!firstName) {
        throw new Error("O nome está vazio.");
    }

    const firstInitial = firstName.charAt(0);

    const lastName = names[names.length - 1] ?? firstName;

    const lastInitial =
        names.length > 1
            ? lastName.charAt(0)
            : "";

    return `${firstInitial}${lastInitial}`.toUpperCase();
}

export function closeModal(modal: HTMLElement): void {
    window.bootstrap.Modal.getOrCreateInstance(modal).hide();
}