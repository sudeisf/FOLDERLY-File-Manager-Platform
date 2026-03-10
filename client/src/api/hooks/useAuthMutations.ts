import { useMutation } from "@tanstack/react-query"

import { authApi } from "@/api/auth"

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApi.login,
  })
}

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: authApi.register,
  })
}

export const useForgotPasswordRequestMutation = () => {
  return useMutation({
    mutationFn: authApi.forgotPasswordRequest,
  })
}

export const useForgotPasswordVerifyMutation = () => {
  return useMutation({
    mutationFn: authApi.forgotPasswordVerify,
  })
}

export const useForgotPasswordResetMutation = () => {
  return useMutation({
    mutationFn: authApi.forgotPasswordReset,
  })
}
