resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda_exec_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_exec" {
    depends_on = [aws_iam_policy.lambda_rds_s3_policy]
    role       = aws_iam_role.lambda_exec_role.name
    policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy" "lambda_rds_s3_policy" {
  name = "lambda_rds_s3_access"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.schema_bucket.arn}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_rds_s3_attach" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_rds_s3_policy.arn
}

resource "aws_s3_bucket" "schema_bucket" {
  bucket = var.bucket_name
  force_destroy = true
}

resource "aws_s3_object" "schema_sql" {
  bucket = aws_s3_bucket.schema_bucket.bucket
  key    = var.schema_key
  source = "${path.module}/schema.sql"
  etag   = filemd5("${path.module}/schema.sql")
}
