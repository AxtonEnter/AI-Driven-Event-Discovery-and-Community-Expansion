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

module "model" {
  source        = "./model"
  model_ami = var.model_ami
}

module "webscraper" {
  source = "./webscraper"
  webscraper_ami = var.webscraper_ami
}

module "queue" {
  source = "./queue"
}


# we are handling variables in modules now each module will just call source for simplicity sake. 
/*

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.93.0"
    }
  }
}


module "cognito" {
  source         = "./cognito"
  user_pool_name = "my-user-pool"
  client_name    = "my-client"
  callback_urls = https://awseb--awseb-qtfstuhvgp4v-1642944154.us-east-1.elb.amazonaws.com/login
  logout_urls   = https://awseb--awseb-qtfstuhvgp4v-1642944154.us-east-1.elb.amazonaws.com/logout
}
*/
