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
} as const;

export const USER = {
	DELETED_SUCCESS: "User deleted successfully!",
	UPDATED_SUCCESS: "User updated successfully!",
	NOT_FOUND: "User not found",
} as const;

export const RESOURCE = {
	DELETED_SUCCESS: "Deleted successfully!",
	CREATED_FOLDER_SUCCESS: "Folder created successfully!",
	UPLOADED_FILE_SUCCESS: "File uploaded successfully!",
	DOWNLOADED_FILE_SUCCESS: "File downloaded successfully!",
	UPDATED_RESOURCE: "Metadata updated successfully!",
	MOVED_SUCCESS: "Resource moved successfully!",
	TRASHED_SUCCESS: "File/Folder trashed successfully!",
	RESTORED_SUCCESS: "File/Folder restored successfully!",
	NOT_FOUND: "Folder/File not found",

	PARENT_NOT_FOUND: "Parent folder not found",
	UPLOAD_FAILED: "File upload failed",
	FILE_ALREADY_EXISTS: "File already exists",
} as const;
