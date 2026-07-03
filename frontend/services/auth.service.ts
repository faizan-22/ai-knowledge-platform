import { API_ENDPOINTS } from "@/constants/api-endpoints"
import {
  LoginInput,
  loginSchema,
  SignupInput,
  signupSchema,
} from "@/schemas/auth.schema"
import { api } from "../lib/axios"
import { LoginResponse, SignUpResponse } from "@/types/auth.types"

export async function loginUser(
  loginInput: LoginInput
): Promise<LoginResponse> {
  const data = loginSchema.parse(loginInput)

  const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, data)

  return response.data
}

export async function signUp(
  signupInput: SignupInput
): Promise<SignUpResponse> {
  const data = signupSchema.parse(signupInput)

  const response = await api.post(API_ENDPOINTS.AUTH.SIGNUP, data)

  return response.data
}
