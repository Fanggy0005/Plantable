# Project Context

## Project Name

Soil Recommendation System

---

# Overview

This project is a full-stack web application that analyzes soil nutrient values and recommends crops suitable for cultivation.

The goal is to transform laboratory soil analysis into actionable recommendations for farmers and general users.

The application does not use AI to determine crop suitability. Instead, it uses a rule-based recommendation engine built from agricultural knowledge.

Artificial Intelligence is only used to explain results, answer user questions, and provide soil improvement suggestions.

---

# Objectives

* Analyze soil nutrients
* Recommend suitable crops
* Explain recommendation results
* Suggest soil improvements
* Store analysis history
* Support OCR for importing soil reports
* Support future AI features

---

# Target Users

* Farmers
* Agricultural students
* Researchers
* Home gardeners
* General users

---

# Tech Stack

Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

Backend

* ElysiaJS
* Prisma ORM
* PostgreSQL

Authentication

* Better Auth

Storage

* Cloudflare R2

Deployment

Frontend

* Vercel

Backend

* Railway

Database

* PostgreSQL

---

# Core Features

## Soil Analysis

Input

* Nitrogen (N)
* Phosphorus (P)
* Potassium (K)
* pH
* Organic Matter (future)
* Moisture (future)

Output

* Suitable crops
* Suitability score
* Recommendation level
* Explanation
* Soil improvement suggestion

---

## Crop Recommendation

Recommendations are calculated using predefined crop requirements stored in the database.

The recommendation engine compares soil values against the acceptable ranges for each crop.

Results are sorted by suitability score.

No machine learning model is used in the MVP.

---

## Suitability Score

Score range

* 90–100 Excellent
* 75–89 Good
* 60–74 Fair
* 40–59 Poor
* 0–39 Not Recommended

The score is calculated from:

* Nitrogen
* Phosphorus
* Potassium
* pH

Future versions may also include:

* Organic Matter
* Moisture
* Weather
* Temperature
* Rainfall

---

# AI Responsibilities

AI is responsible for

* Explaining recommendation results
* Explaining nutrient deficiencies
* Suggesting soil improvements
* Answering agricultural questions

AI is NOT responsible for

* Calculating suitability score
* Selecting crops
* Replacing the recommendation engine

---

# OCR

Future feature

Users can upload

* PDF
* Image

OCR extracts soil values and automatically fills the input form.

---

# Coding Guidelines

Use

* TypeScript
* Functional programming
* Async/await
* Prisma ORM
* REST API

Avoid

* Business logic inside UI components
* Raw SQL unless necessary
* Duplicated code
* Hardcoded recommendation values

---

# Architecture

Frontend

↓

REST API

↓

Backend

↓

Recommendation Engine

↓

Database

---

# Recommendation Engine Rules

The recommendation engine must

* Compare soil values with crop requirements
* Calculate suitability score
* Generate recommendation level
* Generate reasons
* Generate improvement suggestions

The recommendation engine must not call AI.

---

# Database Rules

Crop requirement data is treated as master data.

Recommendation results are stored for history.

Users may perform multiple analyses.

Each analysis can generate multiple crop recommendations.

---

# Future Roadmap

Phase 1

* MVP
* Recommendation engine
* Suitability score

Phase 2

* Authentication
* Analysis history
* Export PDF

Phase 3

* OCR
* AI explanation
* Soil improvement

Phase 4

* Weather integration
* Cost estimation
* Yield prediction

---

# Development Principles

* Keep the code modular.
* Prefer reusable components.
* Maintain separation of concerns.
* Prioritize readability over cleverness.
* Follow clean architecture principles.
* Design with future scalability in mind.
* Keep business logic inside services.
* Ensure all APIs are typed and validated.
* Write code that is easy for humans and AI agents to understand.
