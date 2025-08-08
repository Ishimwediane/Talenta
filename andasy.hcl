# andasy.hcl app configuration file generated for talenta on Tuesday, 05-Aug-25 18:45:01 CAT
#
# See https://github.com/quarksgroup/andasy-cli for information about how to use this file.

app_name = "talenta"

app {

 env = {
  HOST = "::"
}


  port = 3000

  compute {
    cpu      = 1
    memory   = 256
    cpu_kind = "shared"
  }

  process {
    name = "talenta"
  }

}
