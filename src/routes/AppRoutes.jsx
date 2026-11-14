/*
  All routes of the app. Owned by Musa (main branch).
  Teammates: you do NOT need to edit this file - your pages are already registered.
  Just replace the placeholder page files in your own feature folder.
*/
import { Navigate, Route, Routes } from 'react-router-dom'
import { ROLES } from '../lib/constants'
import ProtectedRoute from './ProtectedRoute'
import PublicLayout from '../components/layout/PublicLayout'
import AppLayout from '../components/layout/AppLayout'
import AuthLayout from '../components/layout/AuthLayout'

// guest + auth (Musa)
import LandingPage from '../features/guest/pages/LandingPage'
import ListingDetailPage from '../features/guest/pages/ListingDetailPage'
import NotFoundPage from '../features/guest/pages/NotFoundPage'
import SignupPage from '../features/auth/pages/SignupPage'
import LoginPage from '../features/auth/pages/LoginPage'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage'
import CheckEmailPage from '../features/auth/pages/CheckEmailPage'
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage'
import CompanyPendingPage from '../features/auth/pages/CompanyPendingPage'

// student (Asim)
import StudentDashboardPage from '../features/student/pages/StudentDashboardPage'
import StudentProfilePage from '../features/student/pages/StudentProfilePage'
import SearchPage from '../features/student/pages/SearchPage'
import ApplyPage from '../features/student/pages/ApplyPage'
import SavedPage from '../features/student/pages/SavedPage'
import ApplicationsPage from '../features/student/pages/ApplicationsPage'
import SettingsPage from '../features/student/pages/SettingsPage'
import NotificationsPage from '../features/student/pages/NotificationsPage'

// company (Bahaa)
import CompanyDashboardPage from '../features/company/pages/CompanyDashboardPage'
import PostingsPage from '../features/company/pages/PostingsPage'
import PostingFormPage from '../features/company/pages/PostingFormPage'
import ApplicantsPage from '../features/company/pages/ApplicantsPage'
import AllApplicantsPage from '../features/company/pages/AllApplicantsPage'
import ApplicantDetailPage from '../features/company/pages/ApplicantDetailPage'
import CompanyProfilePage from '../features/company/pages/CompanyProfilePage'

// company shortlist + admin (Raed)
import ShortlistPage from '../features/company/shortlist/ShortlistPage'
import CompanyRequestsPage from '../features/admin/pages/CompanyRequestsPage'
import UsersPage from '../features/admin/pages/UsersPage'
import AdminPostingsPage from '../features/admin/pages/AdminPostingsPage'
import ImportedListingsPage from '../features/admin/pages/ImportedListingsPage'
import ExternalSourcesPage from '../features/admin/pages/ExternalSourcesPage'
import StatisticsPage from '../features/admin/pages/StatisticsPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* guest pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
      </Route>

      {/* auth pages */}
      <Route element={<AuthLayout />}>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/check-email/:accountId" element={<CheckEmailPage />} />
        <Route path="/verify-email/:accountId" element={<VerifyEmailPage />} />
      </Route>

      {/* student */}
      <Route element={<ProtectedRoute role={ROLES.STUDENT} />}>
        <Route element={<AppLayout />}>
          <Route path="/student" element={<StudentDashboardPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/search" element={<SearchPage />} />
          <Route path="/student/apply/:listingId" element={<ApplyPage />} />
          <Route path="/student/saved" element={<SavedPage />} />
          <Route path="/student/applications" element={<ApplicationsPage />} />
          <Route path="/student/settings" element={<SettingsPage />} />
          <Route path="/student/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* company waiting for approval (or rejected) */}
      <Route element={<ProtectedRoute role={ROLES.COMPANY} allowPendingCompany />}>
        <Route element={<AppLayout />}>
          <Route path="/company/pending" element={<CompanyPendingPage />} />
        </Route>
      </Route>

      {/* approved company */}
      <Route element={<ProtectedRoute role={ROLES.COMPANY} />}>
        <Route element={<AppLayout />}>
          <Route path="/company" element={<CompanyDashboardPage />} />
          <Route path="/company/postings" element={<PostingsPage />} />
          <Route path="/company/postings/new" element={<PostingFormPage />} />
          <Route path="/company/postings/:listingId/edit" element={<PostingFormPage />} />
          <Route path="/company/postings/:listingId/applicants" element={<ApplicantsPage />} />
          <Route path="/company/postings/:listingId/shortlist" element={<ShortlistPage />} />
          <Route path="/company/applicants" element={<AllApplicantsPage />} />
          <Route path="/company/applicants/:applicationId" element={<ApplicantDetailPage />} />
          <Route path="/company/profile" element={<CompanyProfilePage />} />
        </Route>
      </Route>

      {/* admin */}
      <Route element={<ProtectedRoute role={ROLES.ADMIN} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/requests" replace />} />
          <Route path="/admin/requests" element={<CompanyRequestsPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/postings" element={<AdminPostingsPage />} />
          <Route path="/admin/imports" element={<ImportedListingsPage />} />
          <Route path="/admin/sources" element={<ExternalSourcesPage />} />
          <Route path="/admin/statistics" element={<StatisticsPage />} />
        </Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
