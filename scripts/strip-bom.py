import sys

with open(sys.argv[1], "rb") as f:
    data = f.read()

data = data.replace(b"\xef\xbb\xbf", b"")
data = data.replace(b"\xff\xfe", b"")
data = data.replace(b"\xfe\xff", b"")

with open(sys.argv[1], "wb") as f:
    f.write(data)

print("OK")