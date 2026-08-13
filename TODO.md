# 📌 Mini Desk — Próximo Ponto

> **Documentação de Workflow:** Mapeamento de estados do ticket e tarefas pendentes.

---

## 🔄 Lifecycle (Ciclo de Vida)

### Diagrama de Estados

```text
  [ open ] ──(start)──> [ in_analysis ] ──(wait_user)──> [ waiting_user ]
                             │                                  │
                         (resolve)                          (resume)
                             │                                  │
                             ▼                                  ▼
                          [ resolved ] <────────────────────────┘
                             │      ▲
                          (close) (reopen)
                             │      │
                             ▼      │
                          [ closed ]┘