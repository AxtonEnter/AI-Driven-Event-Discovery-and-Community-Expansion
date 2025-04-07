provider "aws" {
  region = "us-east-1"  
}

locals {
    aws_key = "us-east-1"   # Change this to your desired AWS region
}

# two strategies can be used to get the webscraper into the cloud


resource "aws_instance" "my_server" {
   ami           = data.aws_ami.amazonlinux.id
   instance_type = var.instance_type
   key_name      = "${local.aws_key}"                  
  
   tags = {
     Name = "my ec2"
   }                  
 }

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

#strategey 1 is through s3 buckets

resource "aws_s3_bucket" "example" {
  bucket = "ai-event-discovery-tf-test-bucket"
}

resource "aws_s3_object" "object1" {

  for_each = fileset("uploads/", "*")

  bucket = aws_s3_bucket.example.id

  key = each.value

  source = "uploads/${each.value}"

  etag = filemd5("uploads/${each.value}")

}

#strategey 2 is through file provisioners, still figuring this out