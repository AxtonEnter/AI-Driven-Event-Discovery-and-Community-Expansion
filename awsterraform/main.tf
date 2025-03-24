#awaiting edits and double checking from JD

provider "aws" {
  region = "us-east-1"  
}

locals {
    aws_key = "<YOUR-KEY-NAME>"   # Change this to your desired AWS region
  }

# Amplify Application for repo add in a react app, you can fork it from my notesapp repo just to check if it works
resource "aws_amplify_app" "frontend" {
  name       = "MyAmplifyApp"
  repository = ""
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = "main"
}
#Stuck on how to implement amplify backend elements through terraform an additional resource is necessary and may require an import

# Cognito terraform is kind of confusing too me
resource "aws_cognito_user_pool" "user_pool" {
  name = "MyUserPool"
}

resource "aws_cognito_user_pool_client" "client" {
  name         = "MyUserPoolClient"
  user_pool_id = aws_cognito_user_pool.user_pool.id
}

# RDS Database this should be fine 
resource "aws_db_instance" "rds_instance" {
  identifier            = "my-rds-instance"
  engine                = "mysql"
  instance_class        = "db.t3.micro"
  allocated_storage     = 20
  username              = "admin"
  password              = "password123"
  skip_final_snapshot   = true
}


resource "aws_instance" "my_server" {
   ami           = data.aws_ami.amazonlinux.id
   instance_type = var.instance_type
   key_name      = "${local.aws_key}"                  
  
   tags = {
     Name = "my ec2"
   }                  
 }

#ec2 will need security group right? Wasnt sure how to do this this is some example code
resource "aws_security_group" "ec2_sg" {
  name        = "ec2_sg"
  description = "Allow inbound traffic on port 80 and 22"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# API Gateway resources started but nowhere near finished
resource "aws_api_gateway_resource" "lambda_resource" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "data"
}

resource "aws_api_gateway_method" "get_method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.lambda_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.lambda_resource.id
  http_method = aws_api_gateway_method.get_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api_handler.invoke_arn
}

data "archive_file" "lambda" {
  type        = "zip"
  source_file = "${path.module}/lambda/test.js"
  output_path = "${path.module}/lambda/test.zip"
}

data "archive_file" "scraper" {
  type        = "zip"
  source_file = "${path.module}/lambda/testtwo.js"
  output_path = "${path.module}/lambda/testtwo.zip"
}

# Lambda functions, currently just have dummy code in them to make sure terraform deploys
resource "aws_lambda_function" "api_handler" {
  filename         = data.archive_file.lambda.output_path
  function_name    = "apiHandler"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  source_code_hash = data.archive_file.lambda.output_base64sha256
}

resource "aws_lambda_function" "scraper" {
  filename         = data.archive_file.scraper.output_path
  function_name    = "scraper"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  source_code_hash = data.archive_file.scraper.output_base64sha256
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}