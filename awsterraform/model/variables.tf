variable "instance_type" {
 type        = string
 description = "Instance type for the EC2 instance"
 default     = "t3.small"
}

variable "key_name" {
    type = string
    default = "EventDiscovery" #keyname here
}