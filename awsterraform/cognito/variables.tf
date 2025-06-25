variable "user_pool_name" {
  type        = string
  description = "Name of the Cognito User Pool"
}

variable "client_name" {
  type        = string
  description = "Name of the Cognito App Client"
}

variable "callback_urls" {
  type        = list(string)
  description = "List of callback URLs"
}

variable "logout_urls" {
  type        = list(string)
  description = "List of logout URLs"
}
