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
resource "aws_api_gateway_rest_api" "api" {
  name        = "MyAPI"
  description = "API Gateway for EC2 and RDS interaction"
}
