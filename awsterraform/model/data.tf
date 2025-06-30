data "aws_ami" "model_ami" {
    most_recent = true
    owners     = ["amazon"]

    filter {
        name="name"
        values = ["al2023-ami-2023*"]
    }
    filter {
        name="virtualization-type"
        values = ["hvm"]
    }
    filter {
        name="root-device-type"
        values = ["ebs"]
    }
    filter {
        name="architecture"
        values = ["x86_64"]
    }
}