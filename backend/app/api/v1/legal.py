from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()


@router.get("/privacy", response_class=HTMLResponse)
def get_privacy_policy():
    """Renders the Privacy Policy web page for App Store submission."""
    return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - Triangle Social Events</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 24px; color: #1A1A1A; background: #FFFEFD; }
        h1 { color: #D95F4B; font-size: 28px; margin-bottom: 8px; }
        h2 { color: #075E59; font-size: 20px; margin-top: 24px; }
        p, li { font-size: 15px; color: #444; }
        .last-updated { font-size: 13px; color: #777; margin-bottom: 24px; }
        .box { background: #F5F1EC; padding: 16px; border-radius: 8px; border-left: 4px solid #D95F4B; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Privacy Policy</h1>
    <div class="last-updated">Last Reviewed: August 2026 · Triangle Cohort Events</div>

    <div class="box">
        <strong>Summary:</strong> Triangle Cohort Events collects minimal data necessary to display curated community events, let you RSVP, and receive notifications. We do not sell your personal data.
    </div>

    <h2>1. Information We Collect</h2>
    <ul>
        <li><strong>Account Information:</strong> Name, email address, and optional avatar when creating an account or RSVPing.</li>
        <li><strong>Location Data:</strong> Approximate or precise location if permission is granted, solely to show nearby events.</li>
        <li><strong>User-Generated Content:</strong> Event details, custom photos, and reports submitted through the app.</li>
        <li><strong>Usage Data:</strong> Application interactions, crash logs, and diagnostic telemetry.</li>
    </ul>

    <h2>2. How We Use Information</h2>
    <p>We use collected data to provide event discovery, facilitate cohort attendance, send push notifications, prevent abuse, and improve performance.</p>

    <h2>3. Account Deletion & Data Retention</h2>
    <p>You may initiate permanent deletion of your account directly inside the app under <code>Profile &rarr; Account Privacy &rarr; Delete Account</code>. Upon deletion, all associated personal records are immediately removed from our database.</p>

    <h2>4. Contact Us</h2>
    <p>For privacy inquiries or support, please email us at <a href="mailto:privacy@trianglecohort.org">privacy@trianglecohort.org</a>.</p>
</body>
</html>"""


@router.get("/support", response_class=HTMLResponse)
def get_support_page():
    """Renders the Support web page for App Store Connect submission."""
    return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support - Triangle Social Events</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 24px; color: #1A1A1A; background: #FFFEFD; }
        h1 { color: #D95F4B; font-size: 28px; margin-bottom: 8px; }
        .card { background: #F5F1EC; padding: 20px; border-radius: 12px; border: 1px solid #E5E0D8; margin-top: 20px; }
        a { color: #075E59; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Support & Assistance</h1>
    <p>Need help with Triangle Cohort Events? We are here to assist you!</p>

    <div class="card">
        <h3>📧 Email Support</h3>
        <p>Contact our support team directly at: <a href="mailto:support@trianglecohort.org">support@trianglecohort.org</a></p>
        <p>We typically respond within 24 hours.</p>
    </div>

    <div class="card">
        <h3>🚩 Report Abuse or Inappropriate Content</h3>
        <p>If you encounter offensive content or policy violations, tap the <strong>Report Plan</strong> button on any event card inside the app, or email <a href="mailto:abuse@trianglecohort.org">abuse@trianglecohort.org</a>.</p>
    </div>
</body>
</html>"""
