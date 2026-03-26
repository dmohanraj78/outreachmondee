# Miraee Agentic OS: System Documentation

This document provides a technical and operational breakdown of the Miraee Agentic OS ecosystem, following the "Closer Agent" integration.

## 1. Backend: n8n Workflow Nodes (The "Closer" & Research Swarm)

This table covers the primary logic within your active n8n workflows.

| Node Name | Function | Detailed Logic |
| :--- | :--- | :--- |
| **Webhook: linkedin-closer** | Entry Point | Receives POST requests from the dashboard containing lead details (Name, LinkedIn URL, Row Number) and research context. |
| **Step 1: Get Provider** | API Auth | Calls `GET /accounts` to Unipile to verify the active LinkedIn session and retrieve the specific `provider_id`. |
| **AI Personal Note** | Intelligence | Uses LLM to synthesize "Daily Research" context with the lead's profile to create a hyper-personalized connection note. |
| **Smart Batch Parser** | Data Cleaning | A high-speed JS node that cleans AI output, removes markdown, and strictly truncates messages to **< 240 characters** for LinkedIn compliance. |
| **Step 2: Send Invite** | Execution | Calls Unipile's `/users/invite` endpoint using `Form-Data` to send the invite directly to the lead's LinkedIn handle. |
| **Step 3: Update Sheet** | Data Integrity | Updates the Google Sheet using the `row_number` match to mark the status as **"Invitations sent"** for real-time tracking. |
| **Lead Finder Swarm** | Acquisition | Targets LinkedIn via Serper.dev, filters by "Management" titles using LLM, and retrieves verified emails via Hunter.io. |
| **Email Personalizer** | Personalization | Merges lead metadata with company research to generate high-conversion email drafts (Subject + Body). |
| **Daily Social Research** | Intelligence | Scrapes live industry trends via Serper.dev and scripts to provide the "ammunition" for the Closer agent. |

---

## 2. Frontend: Dashboard Command Center

This table explains the user experience and the "Agentic" value behind each tab.

| Page / Tab | User Action & Features | Behind the Scenes (Reaction) | Business Value |
| :--- | :--- | :--- | :--- |
| **Lead Finder** | Search by industry/title to build your prospect database. | Triggers a multi-stage swarm (Serper + Ollama) to identify and verify management profiles. | **Zero-Cost Sourcing**: Replaces expensive subscriptions like Sales Navigator with verified data. |
| **LinkedIn Authority** | Enter a topic (e.g., "AI Travel") to find trending posts and draft expert comments. | Scrapes LinkedIn "Perspectives", analyzes sentiment, and drafts responses that match your brand DNA. | **Thought Leadership**: Builds massive social authority automatically by appearing in the right industry conversations. |
| **Closer Agent** | View "Ready to Close" leads and send personalized invitations with one click. | Matches a specific lead with a specific research trend, then triggers the Unipile + n8n outreach chain. | **High Conversion**: Moves beyond "spam" by sending invites that reference real-time industry news the lead cares about. |
| **AI Personalization** | Refine and edit AI-generated email drafts before sending. | Pulls lead metadata and maps it into custom email templates via LLM text completion. | **Scalable Personalization**: Allows 1 human to do the high-quality outreach work of 10 SDRs. |
| **Mail Sender** | Review final drafts and queue them for sending via Gmail/SMTP. | Interfaces with Hunter.io for final verification and SMTP nodes for delivery tracking. | **Reliable Delivery**: Ensures outreach hits the inbox with verified status tracking. |
| **Activity Log** | View history of all agent actions, successes, and errors. | Aggregates logs from the n8n backend and local storage to provide a unified "Source of Truth". | **Full Transparency**: Allows for auditing of AI decisions and debugging of connectivity issues. |

---

## 3. High-Security Configuration

The system uses a centralized **Command & Control** structure for security and performance:
- **Central Config**: All agent endpoints are managed in `src/config.js`.
- **API Guard**: The n8n backend enforces character limits and data validation before any external API (Unipile/Google) is touched.
- **Row-Based Tracking**: Every action is tied to a `row_number` to ensure zero data duplication in your sheets.
