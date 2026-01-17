import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
    baseURL: "http://localhost:4000"
})

export { authClient };
