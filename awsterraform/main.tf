terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.93.0"
    }
  }
}

provider "aws" {
    region = "us-east-1"
}

module "queue" {
  source = "./queue"
}

# we are handling variables in modules now each module will just call source for simplicity sake. 
/*
module "model" {
  source        = "./model"
}

module "lambda_function" {
 source = "./lambda"
}


module "rds" {
 source = "./rds"
 vpc_id               = aws_vpc.main.id
 subnet_ids           = [aws_subnet.subnet_a.id, aws_subnet.subnet_b.id]
 db_subnet_group_name  = "my-subnet-group"
 sg_name               = "rds-sg"
 allowed_cidrs         = ["0.0.0.0/0"]
 db_identifier         = "mydb-instance"
 engine                = "postgres"
 instance_class        = "db.t3.micro"
 allocated_storage     = 20
 db_name               = "mydatabase"
 db_username           = "test12321"
 db_password           = "mypassword123"
 skip_final_snapshot   = true
 publicly_accessible   = false
 deletion_protection   = false
}

module "s3" {
  source = "./s3"
  bucket_name = var.bucket_name
}

/*
module "lambda_function" {
  source = "./lambda"

  function_name = "schema-loader"
  handler       = "schema_loader.lambda_handler"
  runtime       = "python3.9"
  filename      = "${path.module}/scripts/schema_loader.zip"
  lambda_exec_role_arn = module.s3.lambda_exec_role_arn

  environment_variables = {
    SCHEMA_BUCKET = module.s3.schema_bucket_name
    SCHEMA_KEY    = "schema.sql"
    RDS_HOST      = module.rds.db_endpoint
    DB_NAME       = var.db_name
    DB_USER       = var.db_username
    DB_PASS       = var.db_password
  }
}
*/

provider "aws" {
    region = "us-east-1"
}

module "queue" {
  source = "./queue"
}

# we are handling variables in modules now each module will just call source for simplicity sake. 
/*
module "model" {
  source        = "./model"
}

module "lambda_function" {
 source = "./lambda"
}

module "cognito" {
  source         = "./cognito"
  user_pool_name = "my-user-pool"
  client_name    = "my-client"
  callback_urls = ["http://localhost:3000/callback"]
  logout_urls   = ["http://localhost:3000/"]
}
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.93.0"
    }
  }
}


module "rds" {
 source = "./rds"
 vpc_id               = aws_vpc.main.id
 subnet_ids           = [aws_subnet.subnet_a.id, aws_subnet.subnet_b.id]
 db_subnet_group_name  = "my-subnet-group"
 sg_name               = "rds-sg"
 allowed_cidrs         = ["0.0.0.0/0"]
 db_identifier         = "mydb-instance"
 engine                = "postgres"
 instance_class        = "db.t3.micro"
 allocated_storage     = 20
 db_name               = "mydatabase"
 db_username           = "test12321"
 db_password           = "mypassword123"
 skip_final_snapshot   = true
 publicly_accessible   = false
 deletion_protection   = false
}

module "s3" {
  source = "./s3"
  bucket_name = var.bucket_name
}

/*
module "lambda_function" {
  source = "./lambda"

  function_name = "schema-loader"
  handler       = "schema_loader.lambda_handler"
  runtime       = "python3.9"
  filename      = "${path.module}/scripts/schema_loader.zip"
  lambda_exec_role_arn = module.s3.lambda_exec_role_arn

  environment_variables = {
    SCHEMA_BUCKET = module.s3.schema_bucket_name
    SCHEMA_KEY    = "schema.sql"
    RDS_HOST      = module.rds.db_endpoint
    DB_NAME       = var.db_name
    DB_USER       = var.db_username
    DB_PASS       = var.db_password
  }
}


module "cognito" {
  source         = "./cognito"
  user_pool_name = "my-user-pool"
  client_name    = "my-client"
  callback_urls = ["http://localhost:3000/callback"]
  logout_urls   = ["http://localhost:3000/"]
}
*/
