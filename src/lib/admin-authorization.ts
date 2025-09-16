/**
 * Admin authorization utility
 * Manages which emails are authorized to sign up as admin
 */

// Get authorized admin emails from environment variable
const getAuthorizedAdminEmails = (): string[] => {
  const adminEmails = process.env.NEXT_PUBLIC_AUTHORIZED_ADMIN_EMAILS || process.env.AUTHORIZED_ADMIN_EMAILS || ''
  return adminEmails
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0)
}

/**
 * Check if an email is authorized for admin signup
 * @param email - Email address to check
 * @returns boolean - true if authorized, false otherwise
 */
export const isAuthorizedAdminEmail = (email: string): boolean => {
  const authorizedEmails = getAuthorizedAdminEmails()
  const normalizedEmail = email.trim().toLowerCase()
  
  return authorizedEmails.includes(normalizedEmail)
}

/**
 * Get list of authorized admin emails (for display purposes)
 * @returns array of authorized email addresses
 */
export const getAuthorizedEmails = (): string[] => {
  return getAuthorizedAdminEmails()
}

/**
 * Validate admin signup attempt
 * @param email - Email attempting to sign up as admin
 * @param role - Role being requested
 * @throws Error if admin signup is not authorized
 */
export const validateAdminSignup = (email: string, role: string): void => {
  if (role === 'admin' && !isAuthorizedAdminEmail(email)) {
    throw new Error(
      `Admin access is restricted. The email "${email}" is not authorized for admin signup. Please contact your system administrator.`
    )
  }
}