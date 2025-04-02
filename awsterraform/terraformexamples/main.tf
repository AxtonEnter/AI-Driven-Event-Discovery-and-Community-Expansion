provider "aws" {
  region = "us-east-1"  
}

locals {
    aws_key = "us-east-1"   # Change this to your desired AWS region
  }

resource "aws_instance" "my_server" {
   ami           = data.aws_ami.amazonlinux.id
   instance_type = var.instance_type
   key_name      = "${local.aws_key}"                  
  
   tags = {
     Name = "my ec2"
   }                  
 }