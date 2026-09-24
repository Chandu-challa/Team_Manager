import re

with open("src/components/PersonForm.jsx", "r") as f:
    content = f.read()

# 1. Modify handleSubmit signature and logic
new_submit_logic = """  const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      if (initialData?.id) {
        await dataAPI.updatePerson(initialData.id, formData);
        toast.success("Person updated successfully");
        router.push("/persons");
        router.refresh();
      } else {
        await dataAPI.createPerson(formData);
        toast.success("Person created successfully");
        if (addAnother) {
          // Reset only person details, keep geography
          setFormData(prev => ({
            ...prev,
            name: "",
            designation: "",
            phone: "",
            email: "",
            address: "",
            photo: null
          }));
          setPreviewUrl("");
        } else {
          router.push("/persons");
          router.refresh();
        }
      }
"""

content = re.sub(
    r'  const handleSubmit = async \(e\) => \{.*?router\.refresh\(\);\s*\}', 
    new_submit_logic, 
    content, 
    flags=re.DOTALL
)

# 2. Modify form buttons
old_buttons = """                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="min-w-[120px] bg-indigo-600 hover:bg-indigo-700">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Save Changes" : "Save Person"}
                  </Button>
                </div>"""

new_buttons = """                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  {!initialData && (
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={(e) => handleSubmit(e, true)} 
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save & Add Another
                    </Button>
                  )}
                  <Button 
                    type="button" 
                    onClick={(e) => handleSubmit(e, false)} 
                    disabled={loading} 
                    className="min-w-[120px] bg-indigo-600 hover:bg-indigo-700"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Save Changes" : "Save Person"}
                  </Button>
                </div>"""

content = content.replace(old_buttons, new_buttons)

# also fix the form onSubmit just in case
content = content.replace("<form onSubmit={handleSubmit} noValidate>", "<form onSubmit={(e) => handleSubmit(e, false)} noValidate>")

with open("src/components/PersonForm.jsx", "w") as f:
    f.write(content)
print("Updated PersonForm with Save & Add Another")
