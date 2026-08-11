import type { TicketDetail, ChatItem, AttachmentPreviewElements } from "../../../api/tickets/types";
import type { CurrentUser } from "../../../api/users/types";
import { getInitials, formatDateTime } from "../../../shared/utils/utils.js";


export function createComment(
    item: ChatItem, 
    currentUser: CurrentUser
): HTMLElement {
    const author = item.type === "comment" ? item.data.author : item.data.uploaded_by;

    const isMine = author.id === currentUser.id;

    const createdAt = item.data.created_at;

    const messageItem =
        document.createElement("div");

    messageItem.classList.add(
        "message-item",
        isMine
            ? "message-mine"
            : "message-other",
    );

    const initialsDiv =
        document.createElement("div");

    initialsDiv.textContent =
        getInitials(author.full_name);

    initialsDiv.classList.add(
        "message-avatar",
    );

    const messageBubble =
        document.createElement("div");

    messageBubble.classList.add(
        "message-bubble",
    );


    const messageMeta =
        document.createElement("div");

    messageMeta.classList.add(
        "message-meta",
    );


    const nameStrong =
        document.createElement("strong");

    nameStrong.textContent =
        author.full_name;


    const dateSpan =
        document.createElement("span");

    dateSpan.textContent =
        formatDateTime(createdAt);


    messageMeta.append(
        nameStrong,
        dateSpan,
    );

    messageBubble.appendChild(
        messageMeta,
    );

    if (item.type === "comment") {
        const messageText =
            document.createElement("p");

        messageText.textContent =
            item.data.content;

        messageBubble.appendChild(
            messageText,
        );
    }

    if (item.type === "attachment") {
        const attachmentLink =
            document.createElement("a");

        attachmentLink.href =
            item.data.file;

        attachmentLink.target = "_blank";
        attachmentLink.rel =
            "noopener noreferrer";

        attachmentLink.classList.add(
            "message-attachment-link",
        );


        const image =
            document.createElement("img");

        image.src =
            item.data.file;

        image.alt =
            "Anexo enviado no chamado";

        image.classList.add(
            "message-attachment-image",
        );


        attachmentLink.appendChild(image);

        messageBubble.appendChild(
            attachmentLink,
        );
    }

    messageItem.append(
        initialsDiv,
        messageBubble,
    );

    return messageItem;
}

export function createTimelineEvent(event: TicketDetail): HTMLElement {
    const eventItem = document.createElement('div');
    eventItem.classList.add('timeline-event');

    const statusSpan = document.createElement('span');
    statusSpan.textContent = 'Status';
    statusSpan.classList.add('timeline-event-badge');

    const title = document.createElement("p");

    title.append("Chamado movido para ");

    const statusStrong = document.createElement("strong");
    statusStrong.textContent = event.status_display;

    title.appendChild(statusStrong);
    title.append(".");

    const timeEl = document.createElement('time');
    const newDate = new Date(event.created_at);
    timeEl.dateTime = newDate.toISOString();
    timeEl.textContent = formatDateTime(newDate);

    eventItem.appendChild(statusSpan);
    eventItem.appendChild(title);
    eventItem.appendChild(timeEl);

    return eventItem
}

export function renderConversation(
    container: HTMLElement,
    comments: ChatItem[],
    user: CurrentUser
): void {
    const fragment = document.createDocumentFragment();

    comments.forEach((comment) => {
        const commentEl = createComment(comment, user);

        fragment.appendChild(commentEl);
    });

    container.replaceChildren(fragment);
}

export function renderAttachmentPreview(
    file: File,
    elements: AttachmentPreviewElements,
): string | null {
    elements.fileName.textContent =
        file.name;

    elements.fileSize.textContent =
        `${(file.size / 1024).toFixed(1)} KB`;

    const isImage =
        file.type.startsWith("image/");

    let previewUrl: string | null = null;

    if (isImage) {
        previewUrl =
            URL.createObjectURL(file);

        elements.image.src =
            previewUrl;

        elements.image.hidden = false;
        elements.fileIcon.hidden = true;
    } else {
        elements.image.src = "";
        elements.image.hidden = true;

        elements.fileIcon.hidden = false;
    }

    elements.container.classList.remove(
        "d-none",
    );

    return previewUrl;
}