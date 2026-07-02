export type LoginResponse = {
  success: boolean
  statusCode: number
  data: {
    access_token: string
    token_type: string
    message: string
    email: string
    name: string
    id: number
  }
  timeStamp: string
  path: string
}

export type SignUpResponse = {
  success: boolean
  statusCode: number
  data: string
  timeStamp: string
  path: string
}