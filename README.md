## Setup Instructions

### 1. Clone the repository

git clone <your-repo-link>

### 2. Backend Setup

cd server
npm install
node app.js

Backend will run on: http://localhost:5000

---

### 3. Frontend Setup

cd client
npm install
npm run dev

Frontend will run on: http://localhost:5173

---

### 4. How to Use

1. Open http://localhost:5173
2. Click "Login to Salesforce"
3. Login with your Salesforce Developer account
4. Click "Get Validation Rules"
5. Toggle rules (Enable/Disable)
6. Click "Deploy Changes" to update in Salesforce

---

### Features Implemented

* OAuth 2.0 Salesforce Login
* Fetch Validation Rules (Tooling API)
* Enable/Disable Rules
* Deploy changes to Salesforce

---

### Technologies Used

* React.js
* Node.js
* Express.js
* Salesforce Tooling API
