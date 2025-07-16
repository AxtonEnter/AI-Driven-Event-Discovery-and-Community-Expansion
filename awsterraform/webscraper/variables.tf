variable "instance_type" {
 type        = string
 description = "Instance type for the EC2 instance"
 default     = "t3.large"
}

variable "key_name" {
    type = string
    default = "EventDiscovery" #keyname here
}

variable "webscraper_ami" {
    description = "The ami id of the snapshot that the web scraper server will be made from."
    type = string
}