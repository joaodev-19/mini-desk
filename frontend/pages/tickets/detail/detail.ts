import {
    getTicket,
} from "../../../api/tickets/api.js";


async function main(): Promise<void> {
    const detailPage = document.getElementById(
        "ticket-detail-page",
    );

    if (!detailPage) {
        throw new Error(
            "Container da página de detalhes não encontrado.",
        );
    }

    const ticketIdValue =
        detailPage.dataset.ticketId;

    if (!ticketIdValue) {
        throw new Error(
            "ID do chamado não foi informado na página.",
        );
    }

    const ticketId = Number(ticketIdValue);

    if (
        !Number.isInteger(ticketId) ||
        ticketId <= 0
    ) {
        throw new Error(
            "ID do chamado inválido.",
        );
    }

    const response = await getTicket(ticketId);

    console.log(response.data);
}


main().catch((error) => {
    console.error(
        "Erro ao inicializar os detalhes do chamado:",
        error,
    );
});