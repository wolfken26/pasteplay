# Code Signing Guide for PastePlay

## What is Code Signing?

Code signing is the process of digitally signing your Windows application with a certificate to verify:
1. **Publisher Identity**: Proves you are the legitimate creator
2. **File Integrity**: Ensures the installer hasn't been tampered with
3. **Windows SmartScreen Trust**: Prevents "Unknown Publisher" warnings

## Why Code Signing Matters

### Without Code Signing
When users download and run your installer, Windows SmartScreen shows:
```
Windows protected your PC
Microsoft Defender SmartScreen prevented an unrecognized app from starting.
Running this app might put your PC at risk.

Publisher: Unknown Publisher
```

Most users will click "Don't run" and abandon the installation.

### With Code Signing
- ✅ Shows your verified company/developer name
- ✅ No scary warnings for users
- ✅ Builds trust and credibility
- ✅ Required for Windows Store distribution
- ✅ Improves download/install conversion rates

## How to Get a Code Signing Certificate

### Option 1: Standard Code Signing Certificate ($100-300/year)
**Providers:**
- [DigiCert](https://www.digicert.com/signing/code-signing-certificates)
- [Sectigo (formerly Comodo)](https://sectigo.com/ssl-certificates-tls/code-signing)
- [SSL.com](https://www.ssl.com/certificates/code-signing/)

**Requirements:**
- Business registration documents
- Verification of identity (phone, email, documents)
- Processing time: 1-5 business days

### Option 2: EV Code Signing Certificate ($300-500/year) - RECOMMENDED
**Benefits:**
- **Immediate SmartScreen reputation** (no waiting period)
- Higher trust level
- Required for kernel-mode drivers

**Providers:** Same as above

**Requirements:**
- All standard requirements
- Physical USB token (FIPS 140-2 compliant)
- More stringent identity verification

## Signing Your PastePlay Installer

### Step 1: Install Your Certificate

#### For Standard Certificate (.pfx file):
1. Double-click the `.pfx` file
2. Follow the Certificate Import Wizard
3. Choose "Current User" or "Local Machine"
4. Enter the password provided by your CA
5. Select "Automatically select the certificate store"

#### For EV Certificate (USB Token):
1. Insert the USB token
2. Install the driver software from your CA
3. The certificate will be available in your Windows Certificate Store

### Step 2: Configure electron-builder

Update your `package.json`:

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": "YOUR_PASSWORD",
      "signingHashAlgorithms": ["sha256"],
      "sign": "./sign.js"
    }
  }
}
```

**⚠️ SECURITY WARNING**: Never commit certificates or passwords to git!

Use environment variables instead:

```json
{
  "build": {
    "win": {
      "certificateFile": "${env.CERTIFICATE_FILE}",
      "certificatePassword": "${env.CERTIFICATE_PASSWORD}",
      "signingHashAlgorithms": ["sha256"]
    }
  }
}
```

### Step 3: Create Custom Signing Script (Optional)

Create `sign.js` in your project root:

```javascript
const { execSync } = require('child_process');
const path = require('path');

exports.default = async function(configuration) {
  const signtool = 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.22621.0\\x64\\signtool.exe';
  const file = configuration.path;
  
  console.log(`Signing ${file}...`);
  
  execSync(`"${signtool}" sign /f "${process.env.CERTIFICATE_FILE}" /p "${process.env.CERTIFICATE_PASSWORD}" /tr http://timestamp.digicert.com /td sha256 /fd sha256 "${file}"`, {
    stdio: 'inherit'
  });
  
  console.log('Signing complete!');
};
```

### Step 4: Build and Sign

```bash
# Set environment variables (PowerShell)
$env:CERTIFICATE_FILE="C:\path\to\cert.pfx"
$env:CERTIFICATE_PASSWORD="your_password"

# Build
npm run build
```

The installer will be automatically signed during the build process.

### Step 5: Verify Signature

Right-click the `.exe` file → Properties → Digital Signatures tab

You should see:
- ✅ Your company/developer name
- ✅ Timestamp
- ✅ "This digital signature is OK"

## Windows SmartScreen Reputation

### For Standard Certificates
Even with a valid signature, new certificates need to build "reputation":
- **Initial**: Users may still see warnings
- **After ~100-1000 downloads**: Warnings decrease
- **After ~3-6 months**: Full trust established

### For EV Certificates
- ✅ **Immediate trust** - no reputation building needed
- This is why EV certificates are recommended for new software

## Testing Without a Certificate

For development/testing, you can:

1. **Self-sign** (users will still see warnings):
```bash
# Create self-signed certificate
New-SelfSignedCertificate -Type CodeSigning -Subject "CN=PastePlay Dev" -CertStoreLocation Cert:\CurrentUser\My
```

2. **Disable SmartScreen** on test machines (not recommended for production)

3. **Distribute via trusted channels** (Microsoft Store handles signing)

## Best Practices

1. ✅ **Use EV certificates** for new applications
2. ✅ **Timestamp your signatures** (they remain valid after cert expires)
3. ✅ **Store certificates securely** (never in git, use hardware tokens)
4. ✅ **Sign all executables** (installer + app binaries)
5. ✅ **Renew before expiration** (typically 1-3 years)
6. ✅ **Use CI/CD signing** (Azure SignTool, GitHub Actions)

## Cost Summary

| Item | Cost | Frequency |
|------|------|-----------|
| Standard Code Signing | $100-300 | Annual |
| EV Code Signing | $300-500 | Annual |
| USB Token (EV) | Included | One-time |

## Alternative: Microsoft Store

If code signing costs are prohibitive:
- Publish to **Microsoft Store** (free)
- Microsoft handles signing automatically
- Built-in distribution and updates
- No SmartScreen warnings

## For PastePlay Users

If you're distributing PastePlay without code signing:
1. Clearly document the SmartScreen warning in your README
2. Provide SHA256 checksums for verification
3. Host on trusted platforms (GitHub Releases)
4. Consider open-source builds (users can verify source)

## Resources

- [Microsoft: Code Signing Best Practices](https://docs.microsoft.com/en-us/windows-hardware/drivers/dashboard/code-signing-best-practices)
- [electron-builder Code Signing](https://www.electron.build/code-signing)
- [Windows SignTool Documentation](https://docs.microsoft.com/en-us/windows/win32/seccrypto/signtool)
