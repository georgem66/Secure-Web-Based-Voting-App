You are an expert full-stack software architect and network security engineer. Your task is to design and generate a production-grade “Secure Web-Based Voting App” with a strong network security backbone, suitable for a final-year student project in network & security engineering that demonstrates advanced cybersecurity, encryption, and scalable web application architecture.

Core Objectives
	1.	Platform: Responsive web application that works flawlessly on desktop and mobile browsers.
	2.	Security-First Architecture:
	•	End-to-end encryption for all vote transactions (AES-256 payload encryption + RSA for key exchange).
	•	Enforce HTTPS with TLS 1.3.
	•	Multi-factor authentication (password + OTP/email/mobile verification).
	•	Blockchain-inspired immutable vote ledger (append-only hash chain).
	3.	User Workflow:
	•	Sign-up/Login with secure password hashing (bcrypt or Argon2).
	•	Identity verification before voting.
	•	Secure voting page with candidate selection.
	•	Confirmation receipt showing unique vote transaction hash.
	•	Encrypted vote storage with blockchain-style verification.
	•	Real-time results dashboard (secured with Role-Based Access Control).
	4.	Network Security Backbone:
	•	API gateway with JWT authentication, rate limiting, and IP filtering.
	•	Intrusion Detection System (basic anomaly logging).
	•	SQL Injection prevention, CSRF tokens, and strong input sanitization.
	•	Audit logs for all security-relevant events.
	5.	Architecture & Data Flow:
	•	Backend: Node.js + Express or Python + FastAPI with secure REST APIs.
	•	Frontend: React.js (with Material UI for professional look) or Vue.js for clean SPA design.
	•	Database: PostgreSQL (pgcrypto for encryption) or MongoDB (field-level encryption).
	•	Votes stored in chained hashes for immutability.
	•	Follow OWASP Top 10 security guidelines.
	6.	Testing & Demonstration:
	•	Unit tests for all modules.
	•	Basic automated penetration testing scripts for XSS, SQLi, and MITM.
	•	Architecture diagram showing network layers, encryption flow, and API security.

Development Requirements
	•	Frontend: React.js + Vite or Next.js, Material UI.
	•	Backend: Node.js (Express + Helmet.js) or FastAPI.
	•	Security Libraries: OpenSSL, bcrypt/argon2, JWT, helmet, csrf protection middleware.
	•	Blockchain Ledger Simulation: Append-only linked hash records.
	•	Deployment: Docker Compose for easy setup; documentation for hosting on cloud (AWS/GCP/Azure).

Deliverables
	•	Full frontend & backend source code.
	•	Secure API documentation (Swagger/OpenAPI).
	•	Dockerized local deployment.
	•	README with project setup, security features, and demonstration guide.
	•	Mock data for testing.

Goal: Produce a highly secure, professional-grade voting system accessible via any web browser that highlights expertise in secure software development, network security, and encryption—ready to impress industry reviewers and align with modern e-voting best practices.
