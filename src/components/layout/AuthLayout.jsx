import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import ScrollToTop from './ScrollToTop'

/**
 * Sign up / log in / password pages: dark panel on the left, form on the right (prototype screens 3-4).
 * The dark panel is hidden on phones.
 */
export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <div className="grid flex-1 lg:grid-cols-[43%_1fr]">
        <aside className="relative hidden overflow-hidden bg-night px-[4.7vw] pt-24 text-white lg:block">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-mint uppercase">InternConnect</p>
          <h2 className="mt-6 max-w-md text-5xl leading-[1.08] font-normal">Start building your future today.</h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/75">
            One place to discover opportunities, apply with confidence, and take the next step in your career.
          </p>
          <blockquote className="mt-24 max-w-sm border-l-2 border-mint/70 pl-4">
            <p className="font-serif text-lg leading-snug text-white/90 italic">
              &ldquo;InternConnect helped me find a Co-op that matched both my major and my ambitions.&rdquo;
            </p>
            <footer className="mt-3 text-xs text-white/60">— Sara, Computer Science student</footer>
          </blockquote>
          {/* decorative rings like the prototype */}
          <div className="pointer-events-none absolute -bottom-48 -left-40 size-[520px] rounded-full border-[56px] border-night-soft" />
        </aside>
        <main className="flex justify-center bg-canvas px-4 py-10 sm:px-8 lg:py-14">
          <div className="w-full max-w-[584px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
