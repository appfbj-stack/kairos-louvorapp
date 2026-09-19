import sys

with open(sys.argv[1], "rb") as f:
    data = f.read()

# Strip BOMs (UTF-8 BOM, UTF-16 BOMs)
data = data.replace(b"\xef\xbb\xbf", b"")  # UTF-8
data = data.replace(b"\xff\xfe", b"")  # UTF-16 LE
data = data.replace(b"\xfe\xff", b"")  # UTF-16 BE

with open(sys.argv[1], "wb") as f:
    f.write(data)

print("OK")
