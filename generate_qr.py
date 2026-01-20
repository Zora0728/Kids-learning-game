import qrcode
import os

url = "https://drive.google.com/file/d/1kbZNX10NL_x6IiG2qMLIfIodK_WpTWFU/view?usp=drive_link"
img = qrcode.make(url)

# Save in the artifacts directory for display
output_path = r"C:\Users\user\.gemini\antigravity\brain\d4674593-b66a-4443-997e-a53c64965c1b\apk_qr_code.png"
img.save(output_path)
print(f"QR code saved to {output_path}")
