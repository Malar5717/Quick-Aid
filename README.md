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

<img width="709" height="424" alt="image" src="https://github.com/user-attachments/assets/e063c3cf-8ee9-4134-800c-3c2e0a22b68e" />

Flow summary:
- Hospital staff update live status through the Quick-Aid API server.
- API persists hospital and status data in MongoDB.
- Recommendation engine performs geospatial matching and scoring.
- Dispatch layer consumes ranked hospital options for emergency routing.

## Screenshots

#### Admin panel

<img width="1919" height="907" alt="image" src="https://github.com/user-attachments/assets/3174c0a4-f537-419c-81a2-b6252be12398" />

Role-based control surface for hospital admin operations.

#### Hospital profile onboarding

<img width="1900" height="915" alt="image" src="https://github.com/user-attachments/assets/9c0529a9-62d7-4f1b-bb09-736245f179a3" />

Structured profile and location capture with map-assisted address handling.

#### Staff access management

<img width="1918" height="916" alt="image" src="https://github.com/user-attachments/assets/5b7bc2af-a422-4522-9f90-156f8665e40e" />

Centralized staff identity and access provisioning workflow.

#### Dispatcher search

<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/9f4748cc-5bc0-4f16-8631-447e85f25e26" />



Emergency-type and location-driven hospital discovery interface.
