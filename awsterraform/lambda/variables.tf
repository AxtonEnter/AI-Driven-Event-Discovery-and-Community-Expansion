variable "function_name" {}
variable "handler" {
  description = "Lambda handler (e.g., index.handler)"
}
variable "runtime" {
  description = "Lambda runtime (e.g., nodejs18.x, python3.11)"
}
variable "filename" {
  description = "Path to zipped deployment package"
}
variable "environment_variables" {
  type    = map(string)
  default = {}
}
variable "lambda_exec_role_arn" {
  type = string
}
