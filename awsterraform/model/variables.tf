variable "instance_type" {
 type        = string
 description = "Instance type for the EC2 instance"
 default     = "t2.micro"
}

variable "key_name" {
    type = string
    default = "" #keyname here
}