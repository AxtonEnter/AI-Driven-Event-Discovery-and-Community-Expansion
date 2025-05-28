output "schema_bucket_name" {
  value = aws_s3_bucket.schema_bucket.bucket
}
output "lambda_exec_role_arn" {
  value = aws_iam_role.lambda_exec_role.arn
}
