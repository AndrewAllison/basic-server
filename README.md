
## LOCAL SSL
When developing locally we still want to use ssl certificates. Do so by following thse instructions.

Using mkcert is a straightforward process. It simplifies the creation and installation of trusted SSL certificates for local development. Here are the steps to use mkcert:

Step 1: Install mkcert  
```bash
brew install mkcert # mac
---- or ---
choco install mkcert # windows
```
Step 2: Install the Local CA
This command installs the local CA into your system's trust store, making certificates generated by mkcert trusted by default.
```bash
mkcert -install
```
Step 3: Generate SSL Certificates for Your Local Development
Navigate to your project directory then into the ssl folder and run:

Generate a certificate for your local development domain (e.g., localhost)
```bash
cd ./ssl
mkcert -key-file key.pem -cert-file cert.pem localhost basic-server.local
```
