# Cardano stake pool

## TODO

- [ ] Make it work
- [ ] Create production stack
- [x] Automatically add created servers to `~/.ssh/known_hosts`
- [x] Firewall rules
- [ ] Backup data

## Prerequisites

- yarn
- Docker
- Pulumi
- DigitalOcean account and the following env vars set
  - `DIGITALOCEAN_TOKEN`
  - `SPACES_ACCESS_KEY_ID`
  - `SPACES_SECRET_ACCESS_KEY`
- A public key in `~/.ssh/id_rsa.pub`

## Create the stack

```sh
yarn # install dependencies
pulumi up # run the pulumi program
```

This will create the Droplets at DigitalOcean and run the needed docker containers.

## Run the registration service

```sh
$(pulumi stack output registration)
# or in fish
eval (pulumi stack output registration)
```

## Logs

### Producer

```fish
env DOCKER_HOST=ssh://root@(pulumi stack output ipAdresses --json | jq '.producer' -r) docker logs (pulumi stack output containers --json | jq '.producer' -r)
```

### Relay

```fish
env DOCKER_HOST=ssh://root@(pulumi stack output ipAdresses --json | jq '.relay' -r) docker logs (pulumi stack output containers --json | jq '.relay' -r)
```

## Troubleshooting

### Can't remove default VPC

Create a new VPC in the same region and promote it to default.
