provider "aws" {
  region = "us-east-1"  
}

locals {
    aws_key = "EventDiscovery"   # Change this to your desired AWS region
  }

resource "aws_instance" "web_scraper_server" {
   ami           = var.webscraper_ami
   instance_type = var.instance_type
   key_name      = "${local.aws_key}"
   user_data = file("${path.path.module}/ScraperSart.ps1")
  
   tags = {
     Name = "Webscraper Server"
   }                  
 }