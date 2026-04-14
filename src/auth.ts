import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDB from "./lib/db"
import { User } from "./models/user.model"
import bcrypt from "bcryptjs"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        // Email and Password credentials for Sign In
        Credentials({
            credentials: {
                email: {
                    type: "email",
                    label: "Email",
                    placeholder: "johndoe@gmail.com",
                },
                password: {
                    type: "password",
                    label: "Password",
                    placeholder: "*****",
                },
            },
            async authorize(credentials, request) {
                const email = credentials.email as string
                const password = credentials.password as string
                // Check user provide email or password
                if (!email || !password) {
                    throw Error("Missing Email or Password")
                }

                // Connect Database
                await connectDB()

                // Check user exist in database or not
                const user = await User.findOne({ email })
                if (!user) {
                    throw Error("User does not exist.")
                }

                // verify user entered password with stored password
                const isMatch = await bcrypt.compare(password, user.password)

                // Check password correct or not
                if (!isMatch) {
                    throw Error("Email or Password are incorrect.")
                }

                return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            },
        }),

        // Google provider for Sign In
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        })
    ],

    callbacks: {
        // create user with google Sign In
        async signIn({ user, account }) {

            // User create only when user come via Google Sign In
            if (account?.provider === "google") {

                // Connect to database for create user
                await connectDB()

                // Find user in databse and create them
                const dbUser = await User.findOne({ email: user.email })
                if (!dbUser) {
                    await User.create({
                        name: user.name,
                        email: user.email
                    })
                }

                // Update user id and role in database with google Sign In
                user.id = dbUser._id
                user.role = dbUser.role
            }

            return true
        },

        // Generate JWT token for particular USER
        async jwt({ token, user }) {
            token.name = user.name,
                token.id = user.id,
                token.email = user.email,
                token.role = user.role

            return token
        },

        // After creating token we store them in session
        async session({ token, session }) {
            if (session.user) {
                session.user.name = token.name,
                    session.user.id = token.id as string,
                    session.user.email = token.email as string,
                    session.user.role = token.role as string
            }

            return session
        }
    },

    // Redirect to provided page
    pages: {
        signIn: "/signin",
        error: "/signin"
    },

    // How many days user Log In that website
    session: {
        strategy: "jwt",
        maxAge: 10 * 24 * 60 * 60
    },

    // AUTH_SECRET for JWT verification
    secret: process.env.AUTH_SECRET
})