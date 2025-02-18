Speedo

Overview

Speedo is a trip-tracking application that allows users to record and manage their trip details. It is built using a MERN stack and utilizes Redux Toolkit Query (RTK Query) for state management.



Tech Stack

Frontend: React.js, Redux, RTK Query

Backend: Node.js, Express.js, MongoDB

Other Services: Cloudinary (for file storage)

Deployment: Vercel




Project Structure

TRAVEL-TRACKING/
│── frontend/  # React.js (Client)
│── backend/   # Node.js, Express.js (Server)
│── README.md  # Project Documentation





Setup Instructions

1. Clone the Repository

git clone git@github.com:rafirafi03/travel-tracking.git
cd speedo


2. Install Dependencies

Frontend:

cd frontend
npm install

Backend:

cd backend
npm install


3. Configure Environment Variables

Create a .env file inside the backend/ directory and add the following variables:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=your_jwt_expiry_time
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_NAME=your_cloudinary_name


4. Run the Application

Start the Backend Server

cd backend
npm run dev

Start the Frontend

cd frontend
npm run dev

The frontend should be accessible at http://localhost:5713, and the backend at http://localhost:4000.

Deployment

The project is deployed on Vercel.

Frontend Deployment: https://travel-tracking.vercel.app

Backend Deployment: https://travel-tracking-uw9n.vercel.app/



Additional Information

If you encounter any issues, ensure that your .env variables are correctly set up.

Make sure MongoDB is running before starting the backend.