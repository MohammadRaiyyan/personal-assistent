import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'
import type { LoginSchemaType, SignupSchemaType } from '@/schema/auth'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'

type AuthDataType = Pick<
  ReturnType<typeof authClient.useSession>,
  'data'
>['data']

export type AuthContextType = {
  isAuthenticated: boolean
  session: AuthDataType
  login: (payload: LoginSchemaType) => Promise<void>
  signup: (payload: SignupSchemaType) => Promise<void>
  logout: () => Promise<void>
  loginWithProvider: (provider: 'github' | 'google') => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession()

  const login = useCallback(async (payload: LoginSchemaType) => {
    const { error } = await authClient.signIn.email(payload)
    if (error) throw new Error(error.message)
  }, [])
  const signup = useCallback(async (payload: SignupSchemaType) => {
    const { error } = await authClient.signUp.email(payload)
    if (error) throw new Error(error.message)
  }, [])
  const logout = useCallback(async () => {
    const { error } = await authClient.signOut()
    if (error) throw new Error(error.message)
  }, [])
  const loginWithProvider = useCallback(
    async (provider: 'github' | 'google') => {
      await authClient.signIn.social({ provider, callbackURL: '/app' })
    },
    [],
  )

  const value = useMemo(
    () => ({
      session: data,
      isAuthenticated: Boolean(data),
      login,
      logout,
      signup,
      loginWithProvider,
    }),
    [data, login, logout, signup, loginWithProvider],
  ) satisfies AuthContextType

  if (isPending) {
    return (
      <div className="flex items-center gap-4">
        <Spinner />
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthContextProvider')
  }
  return context
}

export default AuthContextProvider
