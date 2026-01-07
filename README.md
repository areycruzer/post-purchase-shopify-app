# Post-Purchase Shopify App

This repository contains a Shopify App built as a technical assignment. It features a custom post-purchase checkout extension managed by a Node.js/Express backend and React admin interface.

## 📋 Project Overview

The goal was to build a simple app that:
1.  Installs on a development store.
2.  Saves basic shop information to MongoDB.
3.  Allows the merchant to configure a "Thank you" message via an Admin UI.
4.  Displays that message to customers immediately after checkout using a Post-Purchase Extension.

**Tech Stack:**
- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, Shopify Polaris, React Query
- **Extension**: Shopify Checkout UI Extensions
- **Tooling**: Shopify CLI, Vite

## 🎥 Demo

Check out the full walkthrough of the app and storefront integration:
[![Storefront Purchase Demo](/home/cruzer/.gemini/antigravity/brain/e5988e8d-61fc-4555-af0a-dc0631387130/storefront_demo_1767790275514.webp)](https://github.com/areycruzer/post-purchase-shopify-app)

> Note: The full video walkthrough is available in the `walkthrough.md` artifact locally.

## 📂 Project Structure

```bash
.
├── web/                    # Backend & Frontend
│   ├── index.js            # Express server (API & Shopify Auth)
│   ├── db.js               # MongoDB Connection
│   ├── models/             # Mongoose Models (Shop Schema)
│   └── frontend/           # React Admin App (Vite)
│       └── pages/index.jsx # Main Admin Interface
└── extensions/             # Shopify Extensions
    └── post-purchase-ui/   # The Checkout UI Extension
        ├── shopify.extension.toml # Config & Metafield access
        └── src/index.jsx   # Extension Render Logic
```

## 🚀 Setup & Installation
<img width="1320" height="694" alt="image" src="https://github.com/user-attachments/assets/ffd28704-31b8-40a9-9cee-8fb3c8b9fc59" />

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or cloud URI)
- Shopify Partner Account
- Shopify CLI installed globally (`npm install -g @shopify/cli`)

### Quick Start

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd post-purchase-app
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    cd web && npm install
    cd frontend && npm install
    cd ../../extensions/post-purchase-ui && npm install
    ```

3.  **Environment Setup**:
    - Ensure MongoDB is running on `mongodb://localhost:27017` (or set `MONGODB_URI` in `web/.env`).
    - The app uses the Shopify CLI for environment variables (`SHOPIFY_API_KEY`, etc.) which are handled during `npm run dev`.

4.  **Run the App**:
    ```bash
    npm run dev
    ```
    - Follow the CLI prompts to log in to Shopify and select your Organization/App.
    - Install the app on your Development Store when the URL is generated.

## ⚙️ How it Works

1.  **Installation**:
    - When installed, the app captures the `shop` domain and saves it to MongoDB with an `installedAt` timestamp.

2.  **Configuration (Admin)**:
    - Navigate to the App in your Shopify Admin.
    - Enter a custom message (e.g., "Thanks! Next time use SAVE20").
    - Clicking **Save** persists the message to:
        - **MongoDB**: For permanent record.
        - **Shop Metafield**: Namespace `post_purchase`, Key `message`. This allows the extension to read it efficiently.

3.  **Checkout Experience**:
    - The `post-purchase-ui` extension reads the Metafield directly.
    - It renders a `CalloutBanner` with your message on the post-purchase page (between payment and the final thank you page).

## 🧪 Verification

To verify the flow:
1.  **Admin**: Save a message "Hello Test".
2.  **Settings**: In Shopify Admin, go to **Settings > Checkout > Post-purchase page** and select this app.
3.  **Storefront**: Place a test order. After payment, verify the message appears.

## 📝 Notes & Decisions

- **MongoDB vs SQLite**: Switched from the template's default SQLite to MongoDB as per assignment requirements.
- **Metafields**: I chose to sync the message to a Shop Metafield. This is a best practice for Checkout Extensions to avoid network latency and authentication complexity during the time-sensitive checkout flow.

---
*Built for Technical Assignment*
