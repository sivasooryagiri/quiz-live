# Host on AWS with a Public IP

Run QuizLive on an AWS EC2 instance so anyone on the internet can join.  
Uses the free tier — costs $0 for light use.

---

## Prerequisites

- An AWS account (free tier eligible)
- A domain or just the raw EC2 public IP is fine
- Basic comfort with a Linux terminal over SSH

---

## Step 1 — Launch an EC2 instance

1. Go to [EC2 Console](https://console.aws.amazon.com/ec2)
2. Click **Launch Instance**
3. Settings:
   - **AMI:** Ubuntu Server 22.04 LTS (free tier eligible)
   - **Instance type:** `t2.micro` (free tier)
   - **Key pair:** Create a new key pair, download the `.pem` file
   - **Security group:** Add these inbound rules:
     | Type | Port | Source |
     |------|------|--------|
     | SSH  | 22   | My IP |
     | HTTP | 80   | 0.0.0.0/0 |
     | Custom TCP | 3000 | 0.0.0.0/0 |
4. Launch the instance

---

## Step 2 — Connect via SSH

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>
```

---

## Step 3 — Install dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install git
sudo apt install -y git

# Verify
node -v
npm -v
```

---

## Step 4 — Clone and build the app

```bash
git clone https://github.com/sivasooryagiri/quiz-live.git
cd quiz-live
npm install
```

---

## Step 5 — Configure environment

```bash
cp .env.example .env
nano .env
```

Fill in your Firebase values and set the join URL to your EC2 public IP:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:xxxx

VITE_ADMIN_PASSWORD=your_secure_password
VITE_JOIN_URL=http://<your-ec2-public-ip>
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Step 6 — Build the app

```bash
npm run build
```

This creates a `dist/` folder with the static files.

---

## Step 7 — Serve with a simple HTTP server

Install `serve`:

```bash
sudo npm install -g serve
```

Run it:

```bash
serve -s dist -l 80
```

App is now live at `http://<your-ec2-public-ip>`

- **Player join:** `http://<your-ec2-public-ip>`
- **Admin panel:** `http://<your-ec2-public-ip>/admin`
- **Host screen:** `http://<your-ec2-public-ip>/host`

---

## Step 8 — Keep it running after you close SSH (PM2)

```bash
sudo npm install -g pm2
pm2 start "serve -s dist -l 80" --name quiz-live
pm2 save
pm2 startup
```

Run the command PM2 prints at the end. App now survives reboots.

---

## Optional — Point a domain to it

If you have a domain:

1. In your DNS provider, add an **A record** pointing to your EC2 public IP
2. Update `.env` → `VITE_JOIN_URL=http://yourdomain.com`
3. Rebuild: `npm run build && pm2 restart quiz-live`

For HTTPS (recommended if using a domain):

```bash
sudo apt install -y nginx certbot python3-certbot-nginx

# Set up nginx as a reverse proxy (proxy port 3000 → 80/443)
# Then run:
sudo certbot --nginx -d yourdomain.com
```

---

## Notes

- EC2 public IPs change on stop/start unless you attach an **Elastic IP** (free while instance is running)
- To attach an Elastic IP: EC2 Console → **Elastic IPs → Allocate → Associate**
- Free tier gives 750 hours/month of t2.micro — more than enough to run 24/7 for a month
