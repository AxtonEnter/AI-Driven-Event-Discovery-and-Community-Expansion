variable "instance_type" {
 type        = string
 description = "Instance type for the EC2 instance"
 default     = "t3.small"
}

variable "key_name" {
    type = string
    default = "EventDiscovery" #keyname here
}


variable "model_ami" {
    description = "The ami id of the snapshot that the model server will be made from."
    type = string
}