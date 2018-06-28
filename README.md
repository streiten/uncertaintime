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
```

## Time on Mac OS

[What time is it?](http://www.atmythoughts.com/living-in-a-tech-family-blog/2014/2/28/what-time-is-it)

Misc information and discussion  
[1](https://www.reddit.com/r/applehelp/comments/2rkf9y/osx_inaccurate_system_time/)
[2](https://apple.stackexchange.com/questions/115671/how-can-i-keep-my-system-clock-in-sync-under-mavericks)
[3](https://apple.stackexchange.com/questions/117864/how-can-i-tell-if-my-mac-is-keeping-the-clock-updated-properly)

query the time server

```
ntpq -p  
sntp -d uncertaintime.com
```

setting the timeserver  
```systemsetup -setnetworktimeserver uncertaintime.com```

set local time to NTP  
```sudo ntpdate -u uncertaintime.com```

NTP servers status  
```ntpq -p```

drift file  
```cat /var/db/ntp.drift```

current time server config  
```cat /private/etc/ntp.conf```
 
## Cool terms
### stratum
### false ticker
### pacemaker
### skew



