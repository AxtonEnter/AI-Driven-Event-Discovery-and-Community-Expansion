variable "region" { default = "us-east-1" }

terraform {
    backend "local" {
        path = "terraform.tfstate"
    }
}

provider "aws" {
    region = var.region
}

locals {
}

module "model_stack" {
  source        = "./model"
  instance_type = "t2.micro"
  key_name      = "my-ssh-key"  # replace with your actual key pair name
}

module "webscrapper" {
  source        = "./webscrapper"
  instance_type = "t2.micro"
  key_name      = "my-ssh-key"  # replace with your actual key pair name
}

module "lambda_function" {
  source = "./lambda"

  function_name         = "my-lambda-function"
  handler               = "test.handler"               # Adjust if handler is different inside test.py
  runtime               = "python3.11"
  filename              = "${path.module}/lambda/test.py.zip"
  environment_variables = {
    EXAMPLE_ENV_VAR = "hello-world"
  }
}

module "rds" {
  source = "./rds"

  vpc_id               = "vpc-0123456789abcdef0"        # Replace with your actual VPC ID
  subnet_ids           = ["subnet-12345", "subnet-67890"] # Replace with your subnet IDs
  db_subnet_group_name = "rds-subnet-group"
  sg_name              = "rds-security-group"
  allowed_cidrs        = ["0.0.0.0/0"]                  # Open to the world (adjust as needed)
  port                 = 5432                           # Default for Postgres

  db_identifier        = "my-rds-db"
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  db_name              = "myappdb"
  db_username          = "dbadmin"
  db_password          = "changeme123"                 # Consider using sensitive variables or secrets mgmt
  skip_final_snapshot  = true
  publicly_accessible  = true
  deletion_protection  = false
}
