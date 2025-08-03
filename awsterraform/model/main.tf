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
   user_data = <<-EOF
              <powershell>
              Set-Location -Path "C:\Users\Administrator\Model\"
              python predict_events.py
              </powershell>
              <persist>true</persist>
              EOF                     
  
   tags = {
     Name = "Model Server"
   }                  
 }