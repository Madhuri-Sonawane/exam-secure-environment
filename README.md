Online Exam Secure Environment – Backend


📌 Overview

This backend service powers the secure online assessment system.

It handles:

Exam attempt creation

IP monitoring

Event logging

IP classification

Immutable event storage

Employer audit dashboard

All security validations and monitoring logic are enforced server-side.

🛠 Tech Stack

Node.js

Express.js

MongoDB

Mongoose

UUID

node-fetch

📂 Project Structure
src/
 ├── config/
 │    └── db.js
 ├── models/
 │    ├── Attempt.js
 │    └── Event.js
 ├── routes/
 │    ├── attempt.routes.js
 │    └── event.routes.js
 ├── services/
 │    ├── event.service.js
 │    └── ip.service.js
 ├── dashboard/
 │    ├── index.html
 │    ├── dashboard.js
 │    └── styles.css
 ├── app.js
 └── server.js

🗃 Database Models
Attempt Model

Stores:

attemptId

name

email

initialIp

isp

region

userAgent

sessionId

ipChanges

startTime

endTime

Event Model

Stores:

eventType

attemptId

timestamp

questionId (optional)

metadata (object)

All events are stored permanently in MongoDB.

🔌 API Endpoints
Start Exam
POST /attempt/start


Creates new attempt and stores initial metadata.

Check IP
POST /attempt/check-ip


Compares current IP with baseline IP and classifies changes.

End Exam
POST /attempt/end


Marks attempt as completed and blocks further logging.

Get All Attempts
GET /attempt/all


Returns all attempts with calculated behavior counts.

Log Events (Batch)
POST /events/log


Stores multiple events in one request.

Rejects logging if exam already ended.

Get Events by Attempt
GET /events/:attemptId


Returns raw event timeline.

🔐 Event Handling

Events supported include:

IP_CAPTURED_INITIAL

IP_CHECK_PERFORMED

IP_CHANGE_DETECTED

IP_CHANGE_CLASSIFIED

IP_CHANGE_WARNING_SHOWN

COPY_ATTEMPT

PASTE_ATTEMPT

TAB_SWITCH

FULLSCREEN_ENTER

FULLSCREEN_EXIT

QUESTION_ANSWERED

TIMER_STARTED

TIMER_ENDED

EXAM_ENDED

Events are stored with timestamp and metadata.

📊 Employer Dashboard

Available at:

/employer


Provides:

Attempt list

Attempt details

Raw event log

Copy/Paste/Tab counts

IP change count

Risk level calculation

⚙️ Setup Instructions
1️⃣ Clone Repository
git clone https://github.com/Madhuri-Sonawane/exam-secure-environment
cd exam-secure-environment

2️⃣ Install Dependencies
npm install

3️⃣ Create .env File
MONGO_URI=mongodb://127.0.0.1:27017/secure_exam
PORT=4000

4️⃣ Run Development Server
npm run dev


Server runs on:

http://localhost:4000

🌍 Deployment Notes

Use MongoDB Atlas for production

Configure environment variables

Secure employer dashboard route if needed

Enable proper CORS configuration

👤 Author

Madhuri Rajendra Sonawane
