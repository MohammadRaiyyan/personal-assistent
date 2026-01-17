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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data, isPending, error } = authClient.useSession()
  console.log('data,error', data, error)
  if (isPending) {
    return (
      <div className="flex items-center gap-4">
        <Spinner />
      </div>
    )
  }
  //   if (error) {
  //     return <Navigate to="/auth/login" />
  //   }

  const login = useCallback(async (payload: LoginSchemaType) => {
    await authClient.signIn.email(payload)
  }, [])
  const signup = useCallback(async (payload: SignupSchemaType) => {
    await authClient.signUp.email(payload)
  }, [])
  const logout = useCallback(async () => {
    await authClient.signOut()
  }, [])

  const value = useMemo(() => {
    return {
      session: data,
      isAuthenticated: true,
      login: login,
      logout: logout,
      signup: signup,
    }
  }, [data, login, logout, signup]) satisfies AuthContextType

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
