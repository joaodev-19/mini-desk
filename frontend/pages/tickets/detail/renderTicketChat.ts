import type { TicketComment, TicketDetail } from "../../../api/tickets/types";
import type { CurrentUser } from "../../../api/users/types";
import { getInitials, formatDateTime } from "../../../shared/utils/utils.js";

export function createComment(comment: TicketComment, currentUser: CurrentUser): HTMLElement {
    const isMine = comment.author.id === currentUser.id;

    const messageItem = document.createElement('div');
    messageItem.classList.add(
        "message-item",
        isMine ? "message-mine" : "message-other",
    );

    const initialsDiv = document.createElement('div');
    initialsDiv.textContent = getInitials(comment.author.full_name);
    initialsDiv.classList.add('message-avatar');
    messageItem.appendChild(initialsDiv);

    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message-bubble');

    const messageMeta = document.createElement('div');
    messageMeta.classList.add('message-meta');

    const nameStrong = document.createElement('strong');
    nameStrong.textContent = comment.author.full_name;
    messageMeta.appendChild(nameStrong);

    const dateSpan = document.createElement('span');
    dateSpan.textContent = formatDateTime(comment.created_at);
    messageMeta.appendChild(dateSpan);
    
    const messageText = document.createElement('p');
    messageText.textContent = comment.content;

    messageBubble.appendChild(messageMeta);
    messageBubble.appendChild(messageText);
    messageItem.appendChild(messageBubble);

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
    comments: TicketComment[],
    user: CurrentUser
): void {
    const fragment = document.createDocumentFragment();

    comments.forEach((comment) => {
        const commentEl = createComment(comment, user);

        fragment.appendChild(commentEl);
    });

    container.replaceChildren(fragment);
}