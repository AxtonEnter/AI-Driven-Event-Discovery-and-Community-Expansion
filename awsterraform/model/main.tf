provider "aws" {
  region = "us-east-1"  
}

locals {
    aws_key = "EventDiscovery"   # Change this to your desired AWS region
  }

resource "aws_instance" "model_server" {
   ami           = var.model_ami
   instance_type = var.instance_type
   key_name      = "${local.aws_key}"                  
  
   tags = {
     Name = "model server"
   }                  
 }