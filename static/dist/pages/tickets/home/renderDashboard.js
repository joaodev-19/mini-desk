function countTicketsByStatus(list, status) {
    return list.filter((ticket) => ticket.status === status).length;
}
export function renderDashboard(dashboardContainer, data) {
    if (!dashboardContainer)
        return;
    const openTicketCounter = dashboardContainer.querySelector('[data-open-ticket-counter]');
    const analysisTicketCounter = dashboardContainer.querySelector('[data-analysis-ticket-counter]');
    const waitingTicketCounter = dashboardContainer.querySelector('[data-waiting-ticket-counter]');
    const resolvedTicketCounter = dashboardContainer.querySelector('[data-resolved-ticket-counter]');
    if (!openTicketCounter) {
        throw new Error('Contador de chamados abertos não encontrado.');
    }
    if (!analysisTicketCounter) {
        throw new Error('Contador de chamados em análise não encontrado.');
    }
    if (!waitingTicketCounter) {
        throw new Error('Contador de chamados em espera não encontrado.');
    }
    if (!resolvedTicketCounter) {
        throw new Error('Contador de chamados resolvidos não encontrado.');
    }
    openTicketCounter.textContent = String(countTicketsByStatus(data, "open"));
    analysisTicketCounter.textContent = String(countTicketsByStatus(data, "in_analysis"));
    waitingTicketCounter.textContent = String(countTicketsByStatus(data, "waiting_user"));
    resolvedTicketCounter.textContent = String(countTicketsByStatus(data, "resolved"));
}
//# sourceMappingURL=renderDashboard.js.map