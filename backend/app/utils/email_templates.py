EMAIL_TEMPLATES = {
    "email_confirmation_token": {
        "subject": "Confirm Your Email Address",
        "heading": "Email Verification Code",
        "template_name": "email/general_email.html",
        "message": """
            <p style="font-size: 16px; color: #333;">
                Your verification code is:
            </p>
            <div style="font-size: 24px; font-weight: bold; color: #2c3e50; margin: 10px 0;">
                {token}
            </div>
            <p style="font-size: 14px; color: #555;">
                Please enter this code in the application to verify your email address.
            </p>
        """,
    },

    "password_reset_code": {
        "subject": "Reset Your Password",
        "heading": "Password Reset Code",
        "template_name": "email/general_email.html",
        "message": """
            <p style="font-size: 16px; color: #333;">
                You requested to reset your password. Use the code below:
            </p>
            <div style="font-size: 24px; font-weight: bold; color: #c0392b; margin: 10px 0;">
                {token}
            </div>
            <p style="font-size: 14px; color: #555;">
                If you didn’t request a password reset, please ignore this email.
            </p>
        """,
    },

    "send_organization_member_invite_email": {
        "subject": "Invited to join Organization",
        "heading": "Invite Your Email Address",
        "template_name": "email/general_email.html",
        "message": """
        <p style="font-size: 16px; color: #333;">
        <p>You have been invited to join our Organization. Please click the link below to accept the
        invitation:</p>
        <div style="font-size: 24px; font-weight: bold; color: #c0392b; margin: 10px 0;">
                {invitation_link}
            </div>
        <p>If you have any questions or concerns, feel free to contact us.</p>
        <p>Best regards,<br> {{ company_name }}</p> <br>
        """,

    }
}
