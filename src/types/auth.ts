import { auth } from "../lib/auth.js";


export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
export type SessionUser = NonNullable<Session>["user"];