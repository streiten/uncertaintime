# Uncertain Time
Questioning authority of time.  
Uncertain time is a basic NTP Server messing with time. 

## Requirements
A public IP and port 123 pre-routed to port 1234 for accepting and responding to NTP datagrams is required.

For ufw in /etc/ufw/before.rules that looks like 

```
:PREROUTING ACCEPT [0:0]
-A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
-A PREROUTING -p udp --dport 123 -j REDIRECT --to-port 1234
COMMIT

