# Admin Panel - MegaPDF

A separate Next.js admin panel for managing MegaPDF users, transactions, and system settings.

## Features

- 🔐 **Authentication** - Admin-only access with role-based permissions
- 👥 **User Management** - View, edit, and manage user accounts
- 💰 **Transaction Monitoring** - Track payments and API usage
- 📊 **Analytics Dashboard** - Monitor system health and usage metrics
- ⚙️ **Settings Management** - Configure system and PDF tool settings
- 📝 **Activity Logs** - Monitor system and user activities

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Update the values in `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```

3. **Install shadcn/ui components:**

   ```bash
   npx shadcn@latest init
   npx shadcn@latest add button card input label dialog dropdown-menu select switch tabs avatar badge checkbox separator progress alert-dialog table
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Access the admin panel:**
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with admin credentials

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin panel pages
│   │   ├── dashboard/   # Main dashboard
│   │   ├── users/       # User management
│   │   ├── settings/    # System settings
│   │   └── layout.tsx   # Admin layout wrapper
│   ├── login/           # Login page
│   └── globals.css      # Global styles
├── components/
│   ├── admin/           # Admin-specific components
│   │   ├── admin-sidebar.tsx
│   │   └── admin-header.tsx
│   └── ui/              # Reusable UI components
├── context/
│   └── auth-context.tsx # Authentication context
├── types/
│   └── admin.ts         # TypeScript definitions
└── utils/
    └── auth.ts          # Authentication utilities
```

## Authentication

The admin panel uses cookie-based authentication. Users must have the `admin` role to access the panel.

### Login Flow:

1. User enters credentials on `/login`
2. Credentials are sent to the Go API at `/api/auth/login`
3. API returns user data with role information
4. Client stores authentication state in React context
5. Protected routes check for admin role

## API Integration

The admin panel communicates with your Go API backend:

- **Authentication:** `/api/auth/*`
- **Admin Dashboard:** `/api/admin/dashboard`
- **User Management:** `/api/admin/users`
- **Transactions:** `/api/admin/transactions`
- **Settings:** `/api/admin/settings`

## Development

### Adding New Pages

1. Create a new page in `src/app/admin/[page-name]/page.tsx`
2. Add the route to the sidebar navigation in `admin-sidebar.tsx`
3. Create any necessary components in `src/components/admin/`

### Environment Variables

- `NEXT_PUBLIC_API_URL` - Your Go API backend URL
- `NEXTAUTH_URL` - The admin panel URL
- `NEXTAUTH_SECRET` - Secret for session security

## Deployment

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Start production server:**

   ```bash
   npm start
   ```

3. **Docker deployment:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

## Security Considerations

- Admin panel should be deployed on a separate subdomain (e.g., `admin.megapdf.com`)
- Use HTTPS in production
- Implement proper CORS policies
- Consider VPN or IP restrictions for additional security
- Regular security audits and dependency updates

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is part of the MegaPDF suite.
