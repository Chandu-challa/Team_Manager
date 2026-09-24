import re

with open("src/components/PersonForm.jsx", "r") as f:
    content = f.read()

# Add designation to the useState initialization block
form_data_init = r'(const \[formData, setFormData\] = useState\(\{)'
new_init = r'\1\n    designation: initialData?.designation || "",'

content = re.sub(form_data_init, new_init, content)

with open("src/components/PersonForm.jsx", "w") as f:
    f.write(content)
print("Added designation to formData state")
