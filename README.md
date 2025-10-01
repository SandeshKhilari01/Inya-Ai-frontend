# Curie - AI Lab Test Booking Assistant

[![Demo Video](https://img.shields.io/badge/YouTube-Demo-red)](https://youtu.be/rV4apeHEY-c?si=hlkml_6ZFYpid-cv)

Curie is a voice-enabled AI agent built on Inya.ai that simplifies diagnostic test bookings through natural language conversations. Users can describe symptoms, receive test recommendations, and book appointments via home collection or lab visits.

## ✨ Key Features

- **Natural Language Processing**: Detects test intent from conversational input and handles synonyms
- **Multi-modal Support**: Voice, chat, and phone call interfaces
- **Smart Validation**: Address, pincode, and landmark verification
- **Intelligent Scheduling**: Lab availability and technician slot management
- **Multi-test Booking**: Book multiple tests with unified instructions
- **Secure Authentication**: OTP-based verification via SMS
- **Automated Notifications**: SMS and email confirmations via Twilio
- **Bilingual Support**: English and Hindi language options
- **Error Recovery**: Handles edge cases like invalid addresses, ambiguous test names, and capacity issues

## 🎥 Demo Videos

- [Workflow Explanation](https://youtu.be/rV4apeHEY-c?si=hlkml_6ZFYpid-cv)
- [Web-based Voice Interface](https://youtu.be/HY_Wzoi2g3o?si=LqvP3BvuXON3IEtg)
- [Trigger Agent Call](https://youtu.be/vqnJ23g7a4o?si=-vxOaDfKterYZx6f)
- [Chat Window Interface](https://youtu.be/jSAWu7_Rqbo?si=M-Kwu_mSyOjdcGhP)

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| LLM/NLP | GPT-4, Gnani |
| Voice Transcription | Gnani AI |
| Database | MongoDB |
| Notifications | Twilio (SMS & Email) |
| Backend Services | Node.js |

## 📊 Architecture

The system comprises six main components:
- **Input Processing**: Text/voice input handling with NLP interpretation
- **Voice Processing**: Audio transcription via Gnani AI
- **Core Agent**: Orchestrates booking workflow and validation
- **Communication Services**: SMS/email confirmations through Twilio
- **Security**: OTP generation and verification
- **Data Storage**: MongoDB for bookings, tests, labs, and technician data

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Twilio account (for SMS/Email)
- Gnani AI API access

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/curie-lab-assistant.git
cd curie-lab-assistant

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start the server
npm start
```

### Configuration

Create a `.env` file with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
PORT=3000
```

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Bookings

```bash
# Create booking
POST /bookings

# Get bookings by phone
GET /bookings/phone/:phone

# Update booking
PUT /bookings/phone/:phone

# Cancel booking
DELETE /bookings/phone/:phone
```

### OTP

```bash
# Send OTP
POST /otp/send

# Verify OTP
POST /otp/verify

# Get OTP status
GET /otp/status/:phone_number
```

### Email

```bash
# Send confirmation email
POST /email/confirmation
```

## 📁 Dataset Structure

### tests.json
Contains 10 common diagnostic tests with details including test codes, prices, sample types, processing times, guidelines, and synonyms.

### labs.json
80 labs across major cities (Pune, Mumbai, Bengaluru, Delhi, Gujarat) with location coordinates, operating hours, facilities, and service pincodes.

### technicians.json
160 technicians (2 per lab) with service areas and available shift slots.

[Download Mock Dataset](https://drive.google.com/drive/folders/1ZXg-t9IsjteAvxdAUwU52ezIq949tHdD?usp=share_link)

## 💬 Usage Examples

### Home Collection
```
User: I need a sugar test and blood count
Curie: Found HbA1c (₹180) and CBC (₹200). Book both?
User: Yes, home collection
Curie: Total ₹460. Your pincode?
User: 411033
[Continues with address, slot selection, OTP verification]
```

### Lab Visit
```
User: Lipid profile test
Curie: Lipid Profile ₹350. Home or lab visit?
User: Lab visit
Curie: Your pincode?
[Shows nearest labs, available slots, confirms booking]
```

## ⚠️ Known Limitations

- **Synthetic Data**: Current datasets are mock data; real-world LIS integration pending
- **Geographic Coverage**: Limited to major cities
- **Test Catalog**: Only 10 common tests included
- **Payment**: Mock payment confirmation only

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

**Team Avinya_Inya_Final**

Agent ID: `1c3460d8d6454d05a8109033e64d7ff7`

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Note**: This is a demonstration project built for educational purposes. For production use, integrate with real healthcare systems and ensure HIPAA/healthcare compliance.
