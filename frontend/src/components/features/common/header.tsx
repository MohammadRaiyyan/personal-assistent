import { Link } from '@tanstack/react-router'
import { FileText, GraduationCap, LayoutDashboard, PenBox } from 'lucide-react'

function Header() {
  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/">Logo</Link>

        <div className="flex items-center space-x-2 md:space-x-4 ">
          <Link
            to="/app"
            activeOptions={{ exact: true }}
            activeProps={{
              className: 'bg-secondary text-secondary-foreground ',
            }}
            className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-secondary/50 hover:text-secondary-foreground transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden md:block">Industry Insights</span>
          </Link>

          <Link
            to="/app/resume"
            activeOptions={{ exact: true }}
            activeProps={{
              className: 'bg-secondary text-secondary-foreground ',
            }}
            className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-secondary/50 hover:text-secondary-foreground transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Build Resume</span>
          </Link>

          <Link
            to="/app/cover-letters"
            activeOptions={{ exact: true }}
            activeProps={{
              className: 'bg-secondary text-secondary-foreground ',
            }}
            className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-secondary/50 hover:text-secondary-foreground transition-colors"
          >
            <PenBox className="h-4 w-4" />
            <span>Cover Letter</span>
          </Link>

          <Link
            to="/app/interview"
            activeOptions={{ exact: true }}
            activeProps={{
              className: 'bg-secondary text-secondary-foreground ',
            }}
            className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-secondary/50 hover:text-secondary-foreground transition-colors"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Interview Prep</span>
          </Link>

          {/* <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                  userButtonPopoverCard: 'shadow-xl', // ✅ Fixed typo
                  userPreviewMainIdentifier: 'font-semibold',
                },
              }}
              afterSignOutUrl="/"
            />
          </SignedIn> */}
        </div>
      </nav>
    </header>
  )
}

export default Header
