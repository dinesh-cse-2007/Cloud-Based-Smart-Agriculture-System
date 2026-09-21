# Cloud-Based Smart Agriculture System
[![Live Demo](https://img.shields.io/badge/🚀_Live-Demo-success?style=for-the-badge)](https://1l0ne3-6y7ykzilo-arcedawebapps1.vercel.app)
📌 Project Overview

The Cloud-Based Smart Agriculture System is a cloud-enabled agricultural management platform designed to help farmers monitor crops, soil conditions, weather information, irrigation, and farm activities using digital technologies.

The system collects agricultural data through sensors or manual inputs and stores it in a cloud database. Farmers can access the information through a web application and make better decisions about irrigation, crop health, and farm management.

---

🎯 Objectives

- Monitor soil moisture and environmental conditions.
- Provide real-time agricultural information.
- Manage irrigation efficiently.
- Store farm and crop data securely in the cloud.
- Help farmers reduce water usage.
- Improve crop productivity.
- Provide a simple dashboard for monitoring farm conditions.
- Enable access to agricultural information from anywhere.

---

🚀 Key Features

👨‍🌾 Farmer Management

- Farmer registration and login.
- Farmer profile management.
- View farm details.

🌾 Crop Management

- Add and manage crops.
- Track crop growth.
- Record sowing and harvesting information.
- View crop-related information.

💧 Smart Irrigation

- Monitor soil moisture.
- Display irrigation status.
- Provide irrigation recommendations.
- Reduce unnecessary water usage.

🌦️ Weather Monitoring

- Display temperature.
- Monitor humidity.
- Track rainfall information.
- Provide weather-based farming information.

📊 Cloud Dashboard

- View farm statistics.
- Monitor sensor data.
- Display crop information.
- View irrigation status.
- Generate useful reports.

🔔 Alerts & Notifications

- Low soil moisture alert.
- High temperature alert.
- Irrigation notification.
- Crop-related warnings.

---

☁️ Cloud Computing

The system uses cloud computing to store and manage agricultural data.

Cloud Architecture

          👨‍🌾 Farmer
              |
              ↓
      🌐 Web Application
              |
              ↓
       ⚙️ Backend Server
              |
       ┌──────┴──────┐
       ↓             ↓
   ☁️ Cloud DB    📡 Sensors
       |             |
       └──────┬──────┘
              ↓
       📊 Smart Dashboard

Benefits of Cloud

- Data can be accessed from anywhere.
- Scalable storage.
- Centralized data management.
- Easy backup and recovery.
- Supports multiple farmers.
- Reduces dependency on local storage.

---

🛠️ Technologies Used

Frontend

- HTML
- CSS
- JavaScript
- Bootstrap

Backend

- Python
- Flask

Database

- MySQL / Cloud Database

Cloud

- AWS / Firebase / Other Cloud Platform

Tools

- Visual Studio Code
- Git
- GitHub

Optional IoT Components

- ESP32 / Arduino
- Soil Moisture Sensor
- Temperature & Humidity Sensor
- Water Pump
- Relay Module

---

📂 Project Structure

Cloud-Smart-Agriculture/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── crops.html
│   └── css/
│       └── style.css
│
├── backend/
│   ├── app.py
│   ├── routes.py
│   ├── database.py
│   └── requirements.txt
│
├── database/
│   └── agriculture.sql
│
├── iot/
│   └── sensor_code.ino
│
├── screenshots/
│
├── README.md
└── .gitignore

---

🗄️ Database Tables

Farmer

Field| Description
farmer_id| Farmer ID
name| Farmer name
email| Email address
password| Login password
phone| Phone number

Crop

Field| Description
crop_id| Crop ID
farmer_id| Farmer ID
crop_name| Name of crop
sowing_date| Sowing date
harvest_date| Harvest date
status| Crop status

Sensor Data

Field| Description
sensor_id| Sensor ID
farm_id| Farm ID
soil_moisture| Soil moisture value
temperature| Temperature
humidity| Humidity
recorded_at| Date and time

Irrigation

Field| Description
irrigation_id| Irrigation ID
farm_id| Farm ID
water_amount| Water quantity
status| ON/OFF
date| Irrigation date

---

🔄 System Workflow

Start
  ↓
Farmer Login
  ↓
Farm Dashboard
  ↓
Collect Agricultural Data
  ↓
Store Data in Cloud
  ↓
Analyze Soil & Weather Data
  ↓
Check Irrigation Requirement
  ↓
Generate Alert / Recommendation
  ↓
Farmer Takes Action
  ↓
View Reports
  ↓
End

---

⚙️ Installation & Setup

1. Clone the Repository

git clone https://github.com/yourusername/Cloud-Smart-Agriculture.git

2. Open the Project

Open the project folder in VS Code.

cd Cloud-Smart-Agriculture

3. Create Virtual Environment

python -m venv venv

Activate it:

Windows:

venv\Scripts\activate

4. Install Dependencies

pip install -r backend/requirements.txt

5. Configure Database

Create a MySQL database:

CREATE DATABASE smart_agriculture;

Import the SQL file:

database/agriculture.sql

6. Configure Database Connection

Update the database settings in:

backend/database.py

Example:

DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "your_password"
DB_NAME = "smart_agriculture"

7. Run the Backend

python backend/app.py

The application will run on:

http://127.0.0.1:5000

8. Open the Frontend

Open:

frontend/index.html

in your browser.

---

📊 Dashboard

The dashboard can display:

┌─────────────────────────────────┐
│     SMART AGRICULTURE           │
├─────────────────────────────────┤
│ 🌱 Crops       💧 Irrigation    │
│                                 │
│ 🌡 Temperature  💦 Soil Moisture│
│                                 │
│ ☁️ Weather     🔔 Alerts        │
├─────────────────────────────────┤
│        Farm Statistics          │
└─────────────────────────────────┘

---

🔐 Security

- Secure farmer authentication.
- Password protection.
- Database access control.
- Input validation.
- Cloud-based data storage.
- User-specific dashboard access.

---

🌟 Advantages

- Smart farm monitoring.
- Efficient irrigation management.
- Reduced water wastage.
- Cloud-based data access.
- Easy-to-use interface.
- Real-time monitoring support.
- Centralized farm information.
- Scalable for multiple farms.

---

🔮 Future Enhancements

- 🤖 AI-based crop disease detection.
- 📱 Mobile application.
- 🛰️ Satellite-based crop monitoring.
- 📈 AI-based crop yield prediction.
- 🌦️ Advanced weather forecasting.
- 🧠 Machine-learning-based irrigation prediction.
- 🛒 Direct farmer-to-market integration.
- 🗣️ Voice assistant for farmers.
- 📡 Large-scale IoT sensor integration.

---

📸 Screenshots

Add your project screenshots here:

screenshots/
├── login.png
├── dashboard.png
├── crop-management.png
├── irrigation.png
└── weather.png

Example Markdown:

![Dashboard](screenshots/dashboard.png)

---

🎯 Use Cases

- Smart farming
- Precision agriculture
- Crop monitoring
- Irrigation management
- Farm data management
- IoT-based agriculture
- Cloud-based agricultural monitoring

---

👨‍💻 Project Team

Project Name: Cloud-Based Smart Agriculture System

Domain: Cloud Computing + IoT + Smart Agriculture

Developed Using: Python, Flask, MySQL, HTML, CSS, JavaScript and Cloud Technologies

---

📄 License

This project is developed for educational and academic purposes.

---

⭐ Conclusion

The Cloud-Based Smart Agriculture System combines Cloud Computing, IoT, and modern web technologies to provide a centralized platform for smart farm management. It helps farmers monitor agricultural conditions, manage irrigation, store data securely, and make informed farming decisions.
