export const AUTH = {
	// General
	UNAUTHORIZED: "User unauthorized to perform this action/operation.",
	NOT_VERIFIED: "User not verified.",
	INVALID_ACCESS_TOKEN: "Invalid or expired access token.",

	// Registration
	REGISTERED: "User registered successfully!",
	USER_ALREADY_EXISTS: "User already exists.",

	// Login
	LOGGED_IN: "User successfully logged in!",
	USER_NOT_FOUND: "User not found.",
	ACCOUNT_NOT_VERIFIED: "Account not verified.",
	INVALID_CREDENTIALS: "Invalid credentials.",

	// Logout
	LOGGED_OUT: "User successfully logged out!",

	// Refresh Token
	REFRESHED_TOKEN: "Token(s) refreshed successfully.",
	NO_REFRESH_TOKEN: "No refresh token provided.",
	INVALID_REFRESH_TOKEN: "Invalid or expired refresh token.",

	// Email Verification
	EMAIL_VERIFIED: "Email verified successfully!",
	USER_ALREADY_VERIFIED: "User already verified",

	// Password Reset
	// FORGOT_PASSWORD_SENT: "Password reset email sent successfully!",
	PASSWORD_RESET_SUCCESS: "Password reset successfully!",
	// INVALID_PASSWORD_RESET_TOKEN: "Invalid or expired password reset token",
	// PASSWORD_RESET_EMAIL_FAILED: "Password reset email could not be sent",
	// PASSWORD_SAME_AS_OLD: "New password must be different from the old password",
} as const;
