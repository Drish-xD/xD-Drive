export const AUTH = {
	ACCOUNT_NOT_VERIFIED: "Account not verified.",

	// Email Verification
	EMAIL_VERIFIED: "Email verified successfully!",
	INVALID_ACCESS_TOKEN: "Invalid or expired access token.",
	INVALID_CREDENTIALS: "Invalid credentials.",
	INVALID_REFRESH_TOKEN: "Invalid or expired refresh token.",

	// Login
	LOGGED_IN: "User successfully logged in!",

	// Logout
	LOGGED_OUT: "User successfully logged out!",
	NO_REFRESH_TOKEN: "No refresh token provided.",
	NOT_VERIFIED: "User not verified.",

	// Refresh Token
	REFRESHED_TOKEN: "Token(s) refreshed successfully.",

	// Registration
	REGISTERED: "User registered successfully!",
	// General
	UNAUTHORIZED: "User unauthorized to perform this action/operation.",
	USER_ALREADY_EXISTS: "User already exists.",
	USER_ALREADY_VERIFIED: "User already verified",
	USER_NOT_FOUND: "User not found.",
} as const;

export const USER = {
	DELETED_SUCCESS: "User deleted successfully!",
	NOT_FOUND: "User not found",
	UPDATED_SUCCESS: "User updated successfully!",
} as const;

export const RESOURCE = {
	ARCHIVED_SUCCESS: "Archived successfully!",
	CREATED_FOLDER_FAILED: "Folder creation failed!",
	CREATED_FOLDER_SUCCESS: "Folder created successfully!",

	DELETED_SUCCESS: "Deleted successfully!",
	DOWNLOADED_FILE_SUCCESS: "File downloaded successfully!",
	FILE_ALREADY_EXISTS: "File already exists",
	FILE_NOT_FOUND: "File not found",
	FOLDER_NOT_FOUND: "Folder not found",
	MOVE_FAILED: "Resource move failed",
	MOVED_SUCCESS: "Resource moved successfully!",

	NOT_FOUND: "Folder/File not found",
	PARENT_NOT_FOUND: "Parent folder not found",
	RENAMED_SUCCESS: "Renamed successfully!",
	RESTORED_SUCCESS: "Restored successfully!",
	STORAGE_QUOTA_EXCEEDED: "Storage quota exceeded",
	UNARCHIVED_SUCCESS: "Unarchived successfully!",
	UPLOAD_FAILED: "File upload failed",
	UPLOADED_FILE_SUCCESS: "File uploaded successfully!",
} as const;
