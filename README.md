# 🔐 CryptWebApp

A secure, full-stack cryptography utility built with **Next.js**, **TailwindCSS**, **Firebase**, and a **Flask backend**. This web application enables users to:

- Encrypt and decrypt files (AES, 3DES, RSA)
- Hash files (SHA-2, SHA-3)
- Compare file hashes
- Generate and share cryptographic keys
- Simulate Diffie-Hellman key exchange
- Generate secure passwords
- Save keys/files securely to Firebase

---

## 🚀 Technologies Used

### Frontend
- Next.js 13 (App Router)
- TailwindCSS
- Firebase Auth
- Firebase Firestore
- Firebase Storage

### Backend
- Python Flask
- Cryptography library
- CORS enabled for frontend-backend communication

---

## 📦 Project Structure
```
crypt-webapp/      # Next.js frontend
  ├── src/app/
  │   ├── encrypt/      # File encryption page
  │   ├── decrypt/      # File decryption page
  │   ├── hash/         # File hashing & comparison
  │   ├── keygen/       # Key generation & DH simulation
  │   ├── dashboard/    # Authenticated user dashboard
  │   └── firebase/     # Firebase config

backend/          # Flask backend
  ├── app.py          # Flask app routes
  └── crypto_utils.py # AES, 3DES, RSA, Hashing logic
```

---

## 📋 Features

### 🔐 Encryption / Decryption
- AES (128-bit, 256-bit)
- 3DES
- RSA (2048-bit public/private key)

### 🧪 Hashing
- SHA-256
- SHA3-512
- Upload two files and compare hashes

### 🔑 Key & Password Generation
- AES & RSA key generation
- Password generator (length, symbols, uppercase)
- Diffie-Hellman key exchange simulation

### 🗂 File/Key Management
- Upload files to encrypt or hash
- Save encrypted files to Firebase Storage
- Save key metadata to Firestore
- View saved items in dashboard

### 👤 User Authentication
- Firebase Auth (email/password)
- Login, register, logout
- Authenticated dashboard access

---

## 🔧 Running the Project

### 1. Clone the Repo
```
git clone https://github.com/your-username/cryptoencrypt-webapp.git
cd cryptoencrypt-webapp
```

### 2. Start Backend (Flask)
```
cd backend
pip install -r requirements.txt
python app.py
```
Server will run at `http://localhost:5000`

### 3. Start Frontend (Next.js)
```
cd crypt-webapp
npm install
npm run dev
```
App runs at `http://localhost:3000`

---

## 🛡️ Security Notes
- AES/3DES uses CBC mode and random IV
- RSA keys are generated client-side (private keys never leave the browser)
- All user data is scoped per user in Firebase
- Backend protected via CORS and file validation

---

## ✨ Credits
Created by Bobby [or Your Name Here] for an Information Security project

---

## 📄 License
MIT