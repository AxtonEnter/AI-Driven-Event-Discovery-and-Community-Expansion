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

locals {
}

# we are handling variables in modules now each module will just call source for simplicity sake. 

module "webscrapper" {
  source        = "./webscrapper"
}
/*
module "model_stack" {
  source        = "./model"
}



module "lambda_function" {
 source = "./lambda"
}

module "rds" {
 source = "./rds"
}
*/