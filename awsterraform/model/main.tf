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

resource "aws_internet_gateway" "model_internet_gateway" {
  vpc_id = aws_vpc.model_vpc.id
}

resource "aws_subnet" "model_subnet" {
  vpc_id            = aws_vpc.model_vpc.id
  cidr_block        = "172.31.10.0/24"
  availability_zone = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "model subnet"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.model_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.model_internet_gateway.id
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.model_subnet.id
  route_table_id = aws_route_table.public_rt.id
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

resource "aws_instance" "model_server" {
  ami           = "ami-0dd45672b9b6a5fd8"
  instance_type = var.instance_type
  subnet_id = aws_subnet.model_subnet.id
  key_name      = var.key_name
  vpc_security_group_ids = [aws_security_group.rdp_sg.id]
  associate_public_ip_address = true          
  tags = {
    Name = "Model"
  }
 
 /* user_data = <<EOF
#!/bin/bash

EOF
*/
}

#No longer provisioning s3 due to AMI inclusion of files