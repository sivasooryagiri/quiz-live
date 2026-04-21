# Host on AWS EC2

Run QuizLive on an EC2 instance so anyone on the internet can join.  
Uses the free tier — costs $0 for light use.

**You need:** An AWS account, basic comfort with a Linux terminal over SSH, a Firebase project (free).

---

## Step 1 — Firebase setup

### Create a project & get config keys

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Give it a name → disable Google Analytics → **Create project**
3. Left sidebar → **Firestore Database → Create database** → **Start in production mode** → pick a region → **Done**
4. Click the **gear icon** → **Project settings** → scroll to **Your apps** → click **`</>`** (Web)
5. Give the app any nickname → **Register app** → copy the `firebaseConfig` values shown

### Create the admin user

1. Left sidebar → **Authentication → Get started** → **Email/Password → Enable → Save**
2. **Users → Add user** → Email: **`admin@quizlive.internal`** → set a password → **Add user**

> The email must be exactly `admin@quizlive.internal`. Password is never stored in code or env vars.

### Deploy Firestore security rules (REQUIRED)

1. Open [`firestore.rules`](../firestore.rules) → copy all contents
2. Firebase Console → **Firestore Database → Rules** tab → delete everything → paste → **Publish**

---

## Step 2 — Launch an EC2 instance

1. Go to [EC2 Console](https://console.aws.amazon.com/ec2) → **Launch Instance**
2. Settings:
   - **AMI:** Ubuntu Server 22.04 LTS (free tier eligible)
   - **Instance type:** `t2.micro` (free tier)
   - **Key pair:** Create new → download the `.pem` file
   - **Security group — add inbound rules:**
     | Type | Port | Source |
     |------|------|--------|
     | SSH | 22 | My IP |
     | HTTP | 80 | 0.0.0.0/0 |
     | Custom TCP | 3000 | 0.0.0.0/0 |
3. **Launch instance**

---

## Step 3 — Connect & install dependencies

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>
```

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
```

---

## Step 4 — Clone, configure & build

```bash
git clone https://github.com/sivasooryagiri/quizlive.git
cd quizlive
npm install
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
VITE_JOIN_URL=http://<your-ec2-public-ip>:3000
```

Save: `Ctrl+O` → Enter → `Ctrl+X`

```bash
npm run build
```

---

## Step 5 — Serve & keep running

```bash
sudo npm install -g serve pm2
pm2 start "serve -s dist -l 3000" --name quizlive
pm2 save && pm2 startup
```

Run the command PM2 prints. App now survives reboots.

| URL | Purpose |
|-----|---------|
| `http://<ec2-ip>:3000` | Player join |
| `http://<ec2-ip>:3000/admin` | Admin panel |
| `http://<ec2-ip>:3000/host` | Host / projector |

---

## Optional — Custom domain + HTTPS

**DNS:** Add an **A record** in your DNS provider pointing to your EC2 public IP.

**HTTPS with nginx + Certbot:**

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo nano /etc/nginx/sites-available/quizlive
```

Paste:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/quizlive /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com
```

Update `.env` → `VITE_JOIN_URL=https://yourdomain.com`, then rebuild:

```bash
npm run build && pm2 restart quizlive
```

---

## Notes

- EC2 public IPs change on stop/start — attach an **Elastic IP** (free while instance is running) to keep it stable: EC2 Console → **Elastic IPs → Allocate → Associate**
- Free tier: 750 hours/month of `t2.micro` — enough to run 24/7
