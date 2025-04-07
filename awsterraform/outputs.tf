output "amplify_url" {
  description = "Amplify app URL"
  value       = aws_amplify_branch.main.url
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.user_pool.id
}

output "cognito_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.client.id
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.rds_instance.endpoint
}

output "instance_ip_addr" {
  value = aws_instance.my_server[*].private_ip
}

output "api_gateway_url" {
  description = "API Gateway URL"
  value       = "${aws_api_gateway_deployment.api_deployment.invoke_url}/prod"
}