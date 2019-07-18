## Hole punching example
public ip 96.85.110.86
aws 52.206.232.250

1. Create two linux VMs in VirtualBox and set their networking to NAT mode.

2. Upload this repo to the host and to both of the VMs

3. If your host IP address is 52.206.232.250, run this on the host:

```
node example/tracker.js 52.206.232.250
node example/tracker.js 0.0.0.0

```

4. Run on first VM:

```
env DEBUG="*" node example/server.js 52.206.232.250
```

5. Run on second VM:

```
env DEBUG="*" node example/client.js 52.206.232.250
```

6. You will see the VMs playing ping-pong even though they are both behind NAT

You can omit setting DEBUG env variable to make it less verbose
