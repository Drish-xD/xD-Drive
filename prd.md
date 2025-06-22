📂 FOLDER & FILE MANAGEMENT
Method	Endpoint	Description
GET	/resources	List root-level files/folders
GET	/resources/:id/children	List contents of folder
POST	/resources/folder	Create folder
POST	/resources/file	Upload file (multipart/form-data)
GET	/resources/:id	Get metadata of a file/folder
PUT	/resources/:id	Rename or move file/folder
DELETE	/resources/:id	Delete file/folder (soft delete)
GET	/resources/:id/download	Download file

🔁 FILE VERSIONING
Method	Endpoint	Description
GET	/resources/:id/versions	List all versions of a file
GET	/resources/:id/versions/:vid/download	Download a specific version
POST	/resources/:id/versions	Upload a new version (if updated)

🔗 SHARING (LINK & EMAIL)
Method	Endpoint	Description
POST	/share/link/:id	Create a shareable link for resource
GET	/share/link/:token	Access a resource via share link token
DELETE	/share/link/:token	Revoke share link
POST	/share/email/:id	Share with a user via email
DELETE	/share/email/:resourceId/:uid	Revoke email-based share
GET	/share/:id/permissions	Get all shared permissions for a resource

🛡️ ACCESS CONTROL & PERMISSIONS
Method	Endpoint	Description
PUT	/resources/:id/visibility	Toggle between private, shared, public
GET	/resources/:id/access	Get current user's access level for resource

📝 ACTIVITY LOGS
Method	Endpoint	Description
GET	/activity	Get current user’s recent actions
GET	/activity/:id	Get activity logs for a specific file