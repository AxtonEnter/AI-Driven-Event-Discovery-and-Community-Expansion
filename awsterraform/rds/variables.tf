variable "vpc_id" {}
variable "subnet_ids" {
  type = list(string)
}
variable "db_subnet_group_name" {}
variable "sg_name" {}
variable "allowed_cidrs" {
  type    = list(string)
  default = ["0.0.0.0/0"]
}
variable "port" {
  default = 5432
}
variable "db_identifier" {}
variable "engine" {
  default = "postgres"
}
variable "instance_class" {
  default = "db.t3.micro"
}
variable "allocated_storage" {
  default = 20
}
variable "db_name" {}
variable "db_username" {}
variable "db_password" {}
variable "skip_final_snapshot" {
  default = true
}
variable "publicly_accessible" {
  default = true
}
variable "deletion_protection" {
  default = false
}