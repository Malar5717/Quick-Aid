# Quick-Aid (Concept + MVP)

A lightweight showcase of an emergency coordination platform focused on smarter hospital routing and live capacity awareness.

## Highlights

- Geo-prioritized hospital recommendation logic
- Real-time status and department updates
- Health-check endpoints and structured API flow
- Validation-focused backend patterns and status logs

## Repo scope

This repository is a code snippet showcase, not the full production codebase.

## Stack

Node.js, Express, MongoDB, React, Vite

## System Architecture

![Quick-Aid system architecture](screenshots/system-architecture.png)

Flow summary:
- Hospital staff update live status through the Quick-Aid API server.
- API persists hospital and status data in MongoDB.
- Recommendation engine performs geospatial matching and scoring.
- Dispatch layer consumes ranked hospital options for emergency routing.

## Screenshots

### Admin panel

![Admin panel](screenshots/admin-panel.png)

Role-based control surface for hospital admin operations.

### Hospital profile onboarding

![Hospital profile onboarding](screenshots/hospital-profile-onboarding.png)

Structured profile and location capture with map-assisted address handling.

### Staff access management

![Staff access management](screenshots/staff-access-management.png)

Centralized staff identity and access provisioning workflow.

### Dispatcher search

![Dispatcher search](screenshots/dispatcher-search.png)

Emergency-type and location-driven hospital discovery interface.
