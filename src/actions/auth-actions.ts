import { fetchAPI } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import type { AuthUser } from '@/store/auth-store';

/** Result type for user-facing auth actions */
export interface ActionResult {
   readonly success: boolean;
   readonly message: string;
}

interface AuthResponse {
   readonly accessToken: string;
   readonly refreshToken: string;
   readonly user: AuthUser;
}

/** Register a new user with email + password */
export async function signUp(formData: FormData): Promise<ActionResult> {
   const name = formData.get('name') as string | null;
   const email = formData.get('email') as string | null;
   const password = formData.get('password') as string | null;

   if (!email?.trim() || !password?.trim()) {
      return { success: false, message: 'Email và mật khẩu không được để trống.' };
   }
   if (password.length < 8) {
      return { success: false, message: 'Mật khẩu phải có ít nhất 8 ký tự.' };
   }

   try {
      await fetchAPI<AuthResponse>('/auth/register', {
         method: 'POST',
         body: {
            name: name?.trim() || undefined,
            email: email.trim(),
            password,
         },
         revalidate: false,
         cache: 'no-store',
      });
      return { success: true, message: 'Đăng ký thành công!' };
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
      };
   }
}

/** Sign in with credentials — stores JWT token on success */
export async function signInWithCredentials(
   _prevState: ActionResult,
   formData: FormData,
): Promise<ActionResult> {
   const email = formData.get('email') as string | null;
   const password = formData.get('password') as string | null;

   if (!email?.trim() || !password) {
      return { success: false, message: 'Email và mật khẩu không được để trống.' };
   }

   try {
      const data = await fetchAPI<AuthResponse>('/auth/login', {
         method: 'POST',
         body: { email: email.trim(), password },
         revalidate: false,
         cache: 'no-store',
      });
      useAuthStore.getState().setAuth(data.accessToken, data.refreshToken, data.user);
      return { success: true, message: 'Đăng nhập thành công!' };
   } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Đã xảy ra lỗi.' };
   }
}

/** Sign out — invalidates refresh token server-side + clears local auth state */
export async function signOutAction(): Promise<void> {
   const { refreshToken } = useAuthStore.getState();
   useAuthStore.getState().logout();

   if (refreshToken) {
      try {
         await fetchAPI('/auth/logout', {
            method: 'POST',
            body: { refreshToken },
            revalidate: false,
            cache: 'no-store',
         });
      } catch {
         // Logout locally even if server call fails
      }
   }
}

/** Update the current user's display name */
export async function updateProfile(
   _prevState: ActionResult,
   formData: FormData,
): Promise<ActionResult> {
   const { token } = useAuthStore.getState();
   if (!token) {
      return { success: false, message: 'Bạn cần đăng nhập để thực hiện thao tác này.' };
   }

   const name = formData.get('name') as string | null;
   if (!name?.trim()) {
      return { success: false, message: 'Tên hiển thị không được để trống.' };
   }

   try {
      const data = await fetchAPI<AuthResponse>('/auth/profile', {
         method: 'PATCH',
         body: { name: name.trim() },
         token,
         revalidate: false,
         cache: 'no-store',
      });
      useAuthStore.getState().setAuth(data.accessToken, data.refreshToken, data.user);
      return { success: true, message: 'Cập nhật hồ sơ thành công.' };
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
      };
   }
}

/** Change password for credentials-based accounts */
export async function updatePassword(formData: FormData): Promise<ActionResult> {
   const { token } = useAuthStore.getState();
   if (!token) {
      return { success: false, message: 'Bạn cần đăng nhập.' };
   }

   const currentPassword = formData.get('currentPassword') as string | null;
   const newPassword = formData.get('newPassword') as string | null;

   if (!currentPassword || !newPassword) {
      return { success: false, message: 'Vui lòng nhập đầy đủ thông tin.' };
   }
   if (newPassword.length < 8) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' };
   }

   try {
      return await fetchAPI<ActionResult>('/auth/password', {
         method: 'PATCH',
         body: { currentPassword, newPassword },
         token,
         revalidate: false,
         cache: 'no-store',
      });
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
      };
   }
}

/** Delete the current user's account */
export async function deleteAccount(password?: string): Promise<ActionResult> {
   const { token } = useAuthStore.getState();
   if (!token) {
      return { success: false, message: 'Bạn cần đăng nhập.' };
   }

   try {
      const result = await fetchAPI<ActionResult>('/auth/account', {
         method: 'DELETE',
         body: password ? { password } : {},
         token,
         revalidate: false,
         cache: 'no-store',
      });
      useAuthStore.getState().logout();
      return result;
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
      };
   }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/** Send a password reset email to the given address */
export async function forgotPassword(email: string): Promise<ActionResult> {
   if (!email.trim()) {
      return { success: false, message: 'Email không được để trống.' };
   }

   try {
      return await fetchAPI<ActionResult>('/auth/forgot-password', {
         method: 'POST',
         body: { email: email.trim() },
         revalidate: false,
         cache: 'no-store',
      });
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
      };
   }
}

/** Reset password using the token from the reset email */
export async function resetPassword(token: string, password: string): Promise<ActionResult> {
   if (!token || !password) {
      return { success: false, message: 'Token và mật khẩu không được để trống.' };
   }
   if (password.length < 8) {
      return { success: false, message: 'Mật khẩu phải có ít nhất 8 ký tự.' };
   }

   try {
      return await fetchAPI<ActionResult>('/auth/reset-password', {
         method: 'POST',
         body: { token, password },
         revalidate: false,
         cache: 'no-store',
      });
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
      };
   }
}

/** Redirect user to the backend Google OAuth endpoint */
export function signInWithGoogle(): void {
   window.location.href = `${API_URL}/auth/google`;
}

/** Refresh access token using the stored refresh token */
export async function refreshAccessToken(): Promise<boolean> {
   const { refreshToken } = useAuthStore.getState();
   if (!refreshToken) return false;

   try {
      const data = await fetchAPI<AuthResponse>('/auth/refresh', {
         method: 'POST',
         body: { refreshToken },
         revalidate: false,
         cache: 'no-store',
      });
      useAuthStore.getState().setAuth(data.accessToken, data.refreshToken, data.user);
      return true;
   } catch {
      useAuthStore.getState().logout();
      return false;
   }
}

/** Verify email using a verification token */
export async function verifyEmail(token: string): Promise<ActionResult> {
   if (!token) {
      return { success: false, message: 'Token xác minh không hợp lệ.' };
   }

   try {
      return await fetchAPI<ActionResult>('/auth/verify-email', {
         method: 'POST',
         body: { token },
         revalidate: false,
         cache: 'no-store',
      });
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
      };
   }
}

/** Resend the email verification link */
export async function resendVerification(email: string): Promise<ActionResult> {
   if (!email.trim()) {
      return { success: false, message: 'Email không được để trống.' };
   }

   try {
      return await fetchAPI<ActionResult>('/auth/resend-verification', {
         method: 'POST',
         body: { email: email.trim() },
         revalidate: false,
         cache: 'no-store',
      });
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
      };
   }
}
