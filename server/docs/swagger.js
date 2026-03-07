const PORT = Number(process.env.PORT || 3001);

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'File Uploader API',
    version: '1.0.0',
    description:
      'Backend API for authentication, folder management, file upload/download/view, folder ZIP export, and share links.',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Folders' },
    { name: 'Files' },
    { name: 'Share' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'johndoe' },
          password: { type: 'string', example: 'secret123' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', example: 'johndoe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'secret123' },
        },
      },
      CreateFolderRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'reports' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Internal server error' },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          200: { description: 'User created successfully' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user and set auth cookie',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/auth/logout': {
      get: {
        tags: ['Auth'],
        summary: 'Logout current user',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Logout successful' },
        },
      },
    },
    '/api/auth/protected': {
      get: {
        tags: ['Auth'],
        summary: 'Validate current auth token',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Authenticated' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/folders/create-folder': {
      post: {
        tags: ['Folders'],
        summary: 'Create a folder for current user',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateFolderRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Folder created' },
          400: { description: 'Invalid request' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/folders/get-folders-names': {
      get: {
        tags: ['Folders'],
        summary: 'Get current user folder names',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Folder names fetched' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/folders/folder-list': {
      get: {
        tags: ['Folders'],
        summary: 'Get current user folders with files',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Folders fetched' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/folders/{id}': {
      put: {
        tags: ['Folders'],
        summary: 'Update folder name',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string', example: 'new-folder-name' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Folder updated' },
          401: { description: 'Unauthorized' },
        },
      },
      delete: {
        tags: ['Folders'],
        summary: 'Delete folder',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Folder deleted' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/files/file': {
      post: {
        tags: ['Files'],
        summary: 'Upload a file',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary' },
                  folder: { type: 'string', example: 'public' },
                  folderID: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'File uploaded' },
          400: { description: 'Validation/upload error' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/files/download/{folderName}/{fileUid}': {
      get: {
        tags: ['Files'],
        summary: 'Download a file as attachment',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'folderName', required: true, schema: { type: 'string' } },
          { in: 'path', name: 'fileUid', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'File stream' },
          404: { description: 'File not found' },
        },
      },
    },
    '/api/files/view/{folderName}/{fileUid}': {
      get: {
        tags: ['Files'],
        summary: 'Open a file inline in browser',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'folderName', required: true, schema: { type: 'string' } },
          { in: 'path', name: 'fileUid', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Inline file stream' },
          404: { description: 'File not found' },
        },
      },
    },
    '/api/files/delete/{folderName}/{fileUid}': {
      delete: {
        tags: ['Files'],
        summary: 'Delete a file',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'folderName', required: true, schema: { type: 'string' } },
          { in: 'path', name: 'fileUid', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'File deleted' },
          404: { description: 'File not found' },
        },
      },
    },
    '/api/files/download-folder/{folderName}': {
      get: {
        tags: ['Files'],
        summary: 'Download all files in folder as ZIP',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'folderName', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'ZIP stream' },
          404: { description: 'Folder or files not found' },
        },
      },
    },
    '/share/{folderId}': {
      post: {
        tags: ['Share'],
        summary: 'Generate share link for a folder',
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'folderId', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Share link generated' },
          404: { description: 'Folder not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/share/{uuid}': {
      get: {
        tags: ['Share'],
        summary: 'Access shared folder metadata/files by share UUID',
        parameters: [
          { in: 'path', name: 'uuid', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Shared folder data' },
          404: { description: 'Shared link not found' },
          410: { description: 'Shared link expired' },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
