provider "aws" {
  region = "us-east-1"  
}

locals {
    aws_key = "us-east-1"   # Change this to your desired AWS region
}

resource "aws_vpc" "model_vpc" {
  cidr_block = "172.31.0.0/16"
  tags = {
    Name = "model vpc"
  }
}

resource "aws_subnet" "model_subnet" {
  vpc_id            = aws_vpc.model_vpc.id
  cidr_block        = "172.31.10.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "model subnet"
  }
}

resource "aws_network_interface" "model_network" {
  subnet_id   = aws_subnet.model_subnet.id
  private_ips = ["172.31.10.100"]
  tags = {
    Name = "model_network_interface"
  }
}

resource "aws_security_group" "rdp_sg" {
  name        = "ec2_sg_webscraper"
  description = "Allow inbound traffic via rdp"
  vpc_id = aws_vpc.model_vpc.id
  ingress  { 
    from_port   = 3389
    to_port     = 3389
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
#No longer provisioning s3 due to AMI inclusion of files

resource "aws_instance" "my_server" {
   ami           = "ami-06c9a073966cc687e"
   instance_type = var.instance_type
   key_name      = var.key_name  
   network_interface {
     network_interface_id = aws_network_interface.model_network.id
     device_index = 0
   }                
   tags = {
    Name = "Scraper"
  }
  /* user_data = <<EOF
#!/bin/bash

EOF
*/
 }