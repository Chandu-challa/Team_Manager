import os
files = ['D:/Persons/frontend/src/app/(dashboard)/persons/page.jsx', 'D:/Persons/frontend/src/components/PersonForm.jsx']
for f in files:
    with open(f, 'rb') as file:
        data = file.read()
    
    text = data.decode('cp1252', errors='replace')
    
    # Just replace all non-ascii characters with a hyphen
    cleaned = ''.join([c if ord(c) < 128 else '-' for c in text])
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(cleaned)
