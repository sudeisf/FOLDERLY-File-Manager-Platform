
# **File and Folder Management System**

This project is a web-based file and folder management system built using **Express**, **Prisma ORM**, and **Passport.js** for session-based authentication. It allows authenticated users to manage folders, upload files, and share folder contents with shareable links for a specified duration.

## **Features**

1. **Session-based Authentication**
   - Implemented using **Passport.js** and **Prisma session store** for session persistence.

2. **File Upload**
   - Users can upload files into specific folders using **Multer** middleware.
   - Uploaded files are stored in the local filesystem.

3. **Folder Management**
   - Users can create, read, update, and delete (CRUD) folders.
   - Each folder can contain multiple files.

4. **View File Details**
   - A route displays file details including:
     - Name
     - Size
     - Upload time
   - Includes a download button to download files.

5. **Cloud Storage Integration**
   - Files can be uploaded to a cloud storage service like **Cloudinary** or **Supabase Storage**.
   - File URLs are saved in the database.

6. **Folder Sharing**
   - Users can generate shareable links for folders.
   - Links are valid for a user-specified duration (e.g., 1 day, 10 days).

---

## **Tech Stack**

- **Backend**: Node.js, Express.js
- **ORM**: Prisma
- **Authentication**: Passport.js with Prisma session store
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary / Supabase Storage (optional)
- **Database**: PostgreSQL
- **Session Store**: Prisma-based session store

---

## **Setup and Installation**

### Prerequisites

Ensure you have the following tools installed:
- [Node.js](https://nodejs.org/) (LTS version)
- [PostgreSQL](https://www.postgresql.org/)
- Cloudinary/Supabase account (if using cloud storage)

---

### Steps to Set Up the Project

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/folder-management-system.git
   cd folder-management-system
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

   The following dependencies will be installed:
   - `express`
   - `passport`, `passport-local`
   - `express-session`
   - `prisma`
   - `@prisma/client`
   - `connect-prisma-session`
   - `multer`
   - `dotenv`
   - `cloudinary` (optional)
   - `uuid` (for unique shareable links)

3. **Set Up Environment Variables**:

   Create a `.env` file in the root of the project:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/your_db_name"
   SESSION_SECRET="your_secret_key"
   CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name" # Optional
   ```

4. **Set Up Prisma**:

   Initialize Prisma and generate the schema:
   ```bash
   npx prisma init
   npx prisma migrate dev --name init
   ```

5. **Run the Server**:
   ```bash
   npm start
   ```

   The server will run on `http://localhost:3000`.

---

## **Folder Structure**

```plaintext
├── prisma/
│   └── schema.prisma          # Prisma schema file
├── uploads/                   # Uploaded files (local storage)
├── public/                    # Static files (CSS, JS)
├── routes/
│   ├── auth.js                # Authentication routes
│   ├── folders.js             # Folder CRUD routes
│   ├── files.js               # File upload and details routes
│   ├── share.js               # Share folder routes
├── views/                     # Templates for rendering views
├── middleware/
│   └── authMiddleware.js      # Authentication middleware
├── .env                       # Environment variables
├── app.js                     # Main Express server
└── README.md                  # Project documentation
```

---

## **Key Features Walkthrough**

### **1. Session-Based Authentication**

- Authentication is handled using **Passport.js** and sessions are persisted in the PostgreSQL database using `connect-prisma-session`.

#### Routes:
- **Register**: `POST /auth/register`
- **Login**: `POST /auth/login`
- **Logout**: `POST /auth/logout`

---

### **2. File Uploads**

- **Multer** middleware handles file uploads and saves files to the `/uploads` directory.

#### Routes:
- **Upload File**: `POST /files/upload/:folderId`

Example:
```http
POST /files/upload/123
Body: file (multipart/form-data)
```

---

### **3. Folder Management**

Users can perform CRUD operations on folders.

#### Routes:
- **Create Folder**: `POST /folders/`
- **Get Folders**: `GET /folders/`
- **Update Folder**: `PUT /folders/:folderId`
- **Delete Folder**: `DELETE /folders/:folderId`

---

### **4. View File Details**

Displays file metadata and includes a download option.

#### Routes:
- **Get File Details**: `GET /files/:fileId`

---

### **5. Share Folder Functionality**

Generates a **shareable link** for a folder with an expiration date.

#### Routes:
- **Generate Share Link**: `POST /share/:folderId`
- **Access Shared Folder**: `GET /share/:uuid`

Request Example:
```http
POST /share/123
Body: { duration: "10d" }
```

Response:
```json
{
  "shareableLink": "http://localhost:3000/share/c758c495-0705-44c6-8bab-6635fd12cf81",
  "expiresAt": "2024-10-20T10:00:00Z"
}
```

---

## **Database Schema**

Sample **Prisma** schema:

```prisma
model User {
  id       Int      @id @default(autoincrement())
  username String   @unique
  password String
  sessions Session[]
  folders  Folder[]
}

model Session {
  id      String   @id @default(uuid())
  userId  Int
  user    User     @relation(fields: [userId], references: [id])
  expires DateTime
}

model Folder {
  id        Int      @id @default(autoincrement())
  name      String
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  files     File[]
}

model File {
  id        Int      @id @default(autoincrement())
  name      String
  url       String
  size      Int
  folderId  Int
  folder    Folder   @relation(fields: [folderId], references: [id])
  createdAt DateTime @default(now())
}

model Share {
  id        String   @id @default(uuid())
  folderId  Int
  folder    Folder   @relation(fields: [folderId], references: [id])
  expiresAt DateTime
}
```

---

## **Extra Credit**

- Add logic to delete expired share links using a cron job or a scheduled script.

---

## **Future Enhancements**

- Integrate **Supabase Storage** or **Cloudinary** for better file management.
- Add role-based access control (RBAC) for better security.

---

## **Contributing**

1. Fork the project.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Commit changes (`git commit -m "Add new feature"`).
4. Push to your branch (`git push origin feature/new-feature`).
5. Open a Pull Request.

---

## **License**

This project is open-source and available under the [MIT License](LICENSE). 

---

## **Contact**

For issues or suggestions, feel free to open an issue or reach out via email: `youremail@example.com`. 

---
