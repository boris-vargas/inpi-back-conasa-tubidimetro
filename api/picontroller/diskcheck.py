import time
import os
import psutil
import platform
import socket
from datetime import datetime

def get_ip_address(ifname):
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    return socket.inet_ntoa(fcntl.ioctl(
        s.fileno(),
        0x8915,  # SIOCGIFADDR
        struct.pack('256s', ifname[:15])
    )[20:24])

byteunits = ('B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB')
def filesizeformat(value):
    exponent = int(log(value, 1024))
    return "%.1f %s" % (float(value) / pow(1024, exponent), byteunits[exponent])

def bytes2human(n):
    """
    >>> bytes2human(10000)
    '9K'
    >>> bytes2human(100001221)
    '95M'
    """
    symbols = ('K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y')
    prefix = {}
    for i, s in enumerate(symbols):
        prefix[s] = 1 << (i + 1) * 10
    for s in reversed(symbols):
        if n >= prefix[s]:
            value = int(float(n) / prefix[s])
            return '%s%s' % (value, s)
    return "%sB" % n


def cpu_usage():
    # load average, uptime
    av1, av2, av3 = os.getloadavg()
    return "%.1f %.1f %.1f" \
        % (av1, av2, av3)

def cpu_temperature():
    tempC = ((int(open('/sys/class/thermal/thermal_zone0/temp').read()) / 1000))
    return "%s" \
        % (str(tempC))

def mem_usage():
    usage = psutil.virtual_memory()
    return "%s" \
        % (usage.used)

def disk_usage():
    usage = psutil.disk_usage("/root")
    return " %i" \
        % (usage.used)

def network(iface):
    stat = psutil.net_io_counters(pernic=True)[iface]
    return "%s: Tx%s, Rx%s" % \
           (iface, bytes2human(stat.bytes_sent), bytes2human(stat.bytes_recv))

def lan_ip():
    #f = os.popen('ifconfig eth0 | grep "inet\ addr" | cut -c 21-33')
    f = os.popen("ip route get 1 | awk '{print $NF;exit}'")
    ip = str(f.read())
    # strip out trailing chars for cleaner output
    return "IP: %s" % ip.rstrip('\r\n').rstrip(' ')

cpu_sp=psutil.cpu_freq(0)
av1, av2, av3 = os.getloadavg()

print ("{\"cpu1\":" + "%.1f" % av1 + ",\"cpu2\":" + "%.1f" % av2 + ",\"cpu3\":" + "%.1f" % av3 + ",\"temperature\":" + cpu_temperature() + ",\"ram\":" + mem_usage() + ",\"disk\":" + disk_usage() + ",\"cpu_speed\":" + "%d" % int(cpu_sp.current) + "}")
