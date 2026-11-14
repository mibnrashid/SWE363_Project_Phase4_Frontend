import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'

/**
 * Logged-in pages (student, company, admin). The page content gets the standard
 * width and top padding, so pages only render their own content:
 *
 *   export default function SavedPage() {
 *     return (<><PageHeader ... /> ...</>)
 *   }
 */
export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="container-page flex-1 pt-8 sm:pt-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
