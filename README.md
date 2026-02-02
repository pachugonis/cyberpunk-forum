# 🌐 Cyberpunk Forum

A futuristic forum application with a cyberpunk aesthetic, built with modern web technologies. Features real-time discussions, user authentication, role-based access control, and a stunning neon-themed UI.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.3.0-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login with NextAuth.js v5
- Role-based access control (User, Moderator, Admin)
- Secure password hashing with bcrypt
- Session management

### 💬 Forum Functionality
- Create and manage discussion topics
- Categorized content with custom icons and colors
- Comment system with nested replies
- Reaction system (Like, Love, Fire, Cyber, Hack)
- Pin and lock topics (moderators/admins)
- View counter for topics
- Real-time search functionality

### 👤 User Profiles
- User profiles with bio and avatar support
- View user's topics and activity
- User management (admin panel)

### 🎨 Cyberpunk UI Components
- **Glitch Text**: Animated text with cyberpunk glitch effect
- **Neon Borders**: Glowing neon borders and highlights
- **Hologram Badges**: Futuristic badge components
- **Tech Grid Background**: Animated grid background
- **Cyber Cards**: Styled card components with neon accents
- Dark theme with neon color palette
- Responsive design for all devices

### 🛠️ Admin Panel
- User management (roles, deletion)
- Category management (CRUD operations)
- Content moderation tools

## 🚀 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **next-themes** - Theme management
- **Sonner** - Toast notifications

### Backend
- **Next.js API Routes** - Backend API
- **NextAuth.js v5** - Authentication
- **Prisma** - ORM and database toolkit
- **SQLite** - Database (via LibSQL)
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pachugonis/cyberpunk-forum.git
   cd cyberpunk-forum
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

   Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**
   ```bash
   # Push the schema to database
   npm run db:push
   
   # Seed the database with initial data
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:seed    # Seed database with initial data
npm run db:push    # Push schema changes to database
npm run db:studio  # Open Prisma Studio (database GUI)
```

## 🗄️ Database Schema

The application uses the following main models:

- **User** - User accounts with authentication
- **Category** - Forum categories
- **Topic** - Discussion topics
- **Comment** - Comments with nested replies support
- **Reaction** - User reactions to topics and comments

See [prisma/schema.prisma](prisma/schema.prisma) for the complete schema.

## 🎨 Project Structure

```
cyberpunk-forum/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Database seeding
│   └── migrations/        # Database migrations
├── src/
│   ├── app/
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (main)/        # Main forum pages
│   │   ├── admin/         # Admin panel
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── cyberpunk/     # Cyberpunk-themed components
│   │   ├── forum/         # Forum-specific components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI components (Radix)
│   ├── lib/
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── prisma.ts      # Prisma client
│   │   └── utils.ts       # Utility functions
│   └── types/             # TypeScript type definitions
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 Default Admin Credentials

After seeding the database, you can login with:

- **Email**: Check `prisma/seed.ts` for default user credentials
- **Password**: Check `prisma/seed.ts` for default user credentials

⚠️ **Important**: Change default credentials in production!

## 🎯 Features Roadmap

- [ ] Real-time notifications
- [ ] Private messaging
- [ ] File attachments
- [ ] User reputation system
- [ ] Advanced search filters
- [ ] Markdown support in posts
- [ ] Email verification
- [ ] OAuth providers (Google, GitHub)
- [ ] Report/flag system
- [ ] User badges and achievements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Igor Pachugonis**

- GitHub: [@pachugonis](https://github.com/pachugonis)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Radix UI for accessible components
- Vercel for hosting platform
- The cyberpunk aesthetic community for inspiration

---

Made with 💜 and ⚡ by Igor Pachugonis
