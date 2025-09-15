# Playwright Session Management and CI Setup

This is a demo showing how to set up session locally and then reuse that session in Playwright tests using encrypted files for CI/CD.

## Steps to Setup Session Management

### 1. Setup Environment Variables and Login

First, create your environment file and generate an encryption key:

```bash
# Copy the example environment file
cp .env.example .env

# Generate a secure encryption key and replace the placeholder in .env file
ENCRYPT_KEY=$(openssl rand -base64 32)
sed -i "" "s/ENCRYPT_SECRET_KEY=your-base64-encryption-key-here/ENCRYPT_SECRET_KEY=$ENCRYPT_KEY/" .env
```

Now edit your `.env` file and fill in your Sigma Computing credentials:

- `SIGMA_USERNAME`: Your Sigma Computing email
- `SIGMA_PASSWORD`: Your Sigma Computing password
- `ENCRYPT_SECRET_KEY`: (already generated above)

Then install dependencies and run the login test locally to authenticate and save your session in storageState.json file:

```bash
# Install all dependencies
npm install

# Run the login test with browser visible (chromium only)
npx playwright test sigma-login.spec.js --project=chromium --headed
```

Note: The `.env` and `storageState.json` files should never be committed since they contain your secrets

This test will:

- Navigate to the Sigma Computing login page
- Use credentials from your `.env` file
- Pause for manual 2FA entry
- Save the authenticated session to `storageState.json`

### 2. Generate Encrypted File with Secret Key

After obtaining your `storageState.json` file, encrypt it for secure storage in version control using the environment variable:

```bash
# Encrypt the storage state using the environment variable
echo "$ENCRYPT_SECRET_KEY" | openssl enc -aes-256-cbc -pbkdf2 -in storageState.json -out storageState.json.enc -pass stdin

# Commit the encrypted file to the repository
git add storageState.json.enc
git commit -m "Add encrypted storage state file"
```

### 3. Store Encryption Key in GitHub Secrets

1. Copy the `ENCRYPT_SECRET_KEY` value from your `.env` file
2. Go to your GitHub repository Settings > Secrets and variables > Actions
3. Create a new repository secret named: **`STORAGE_STATE_KEY`**
4. Paste your encryption key as the value (the same value as `ENCRYPT_SECRET_KEY` from your `.env` file)

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/playwright.yml`) automatically:

1. **Decrypts the storage state** using the secret key:

   ```yaml
   - name: Decrypt and create storage state
     run: |
       echo "${{ secrets.STORAGE_STATE_KEY }}" | openssl enc -d -aes-256-cbc -pbkdf2 -in storageState.json.enc -out storageState.json -pass stdin
   ```

2. **Runs tests** with the restored session:
   ```yaml
   - name: Run Playwright tests
     run: npx playwright test sigma-workbook.spec.js --project=chromium
   ```

## Running the CI Test

To see this in action, trigger the GitHub Actions workflow:

1. Go to the **Actions** tab in your GitHub repository
2. Select **"Playwright Tests"** workflow
3. Click **"Run workflow"** button
4. The test will run using the decrypted session state, bypassing login requirements

The workflow will automatically reuse the saved authentication session, making your tests faster and more reliable in CI environments.
